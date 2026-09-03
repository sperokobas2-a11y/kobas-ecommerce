import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type RouteContext = {
  params: Promise<{ id: string }>;
};

const ALLOWED_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const STATUS_MESSAGES: Record<string, string> = {
  PENDING: "Votre commande est en attente de traitement.",
  CONFIRMED: "Votre commande a été confirmée et va être préparée.",
  PROCESSING: "Votre commande est en cours de préparation.",
  SHIPPED: "Votre commande a été expédiée.",
  DELIVERED: "Votre commande a été livrée. Merci pour votre achat !",
  CANCELLED: "Votre commande a été annulée.",
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Commande introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("GET /api/admin/orders/[id]:", error);

    return NextResponse.json(
      { error: "Impossible de charger la commande." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const status = body.status as
      | (typeof ALLOWED_STATUSES)[number]
      | undefined;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Le statut fourni est invalide." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Commande introuvable." },
        { status: 404 }
      );
    }

    const statusChanged = order.status !== status;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        items: true,
        payments: true,
      },
    });

    // Envoi d'un e-mail de notification si le statut a réellement changé
    if (statusChanged && resend) {
      try {
        await resend.emails.send({
          from: "Kobas Tech <onboarding@resend.dev>",
          to: updatedOrder.customer.email,
          subject: `Commande ${updatedOrder.orderNumber} — ${
            STATUS_LABELS[status]
          }`,
          html: `
            <h2>Mise à jour de votre commande</h2>
            <p>Bonjour ${updatedOrder.customer.firstName},</p>
            <p>
              Le statut de votre commande
              <strong>${updatedOrder.orderNumber}</strong> a été mis à jour :
            </p>
            <p style="font-size: 16px; font-weight: bold; color: #3b82f6;">
              ${STATUS_LABELS[status]}
            </p>
            <p>${STATUS_MESSAGES[status]}</p>
            <p style="margin-top: 20px; color: #666;">
              Vous pouvez suivre votre commande à tout moment depuis votre
              espace client, rubrique "Mes commandes".
            </p>
            <p style="margin-top: 20px; color: #666;">
              Pour toute question, contactez-nous à sperokobas2@gmail.com.
            </p>
            <p>— L'équipe Kobas Tech</p>
          `,
        });
      } catch (emailError) {
        // On ne bloque pas la mise à jour du statut si l'e-mail échoue
        console.error(
          "Erreur envoi e-mail de changement de statut:",
          emailError
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Statut de la commande mis à jour.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id]:", error);

    return NextResponse.json(
      { error: "Impossible de mettre à jour la commande." },
      { status: 500 }
    );
  }
}
