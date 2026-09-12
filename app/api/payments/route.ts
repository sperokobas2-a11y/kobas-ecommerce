import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const PAYMENT_METHODS = ["MTN_MONEY", "MOOV_MONEY", "CARD", "CASH"] as const;

const createPaymentSchema = z.object({
  orderId: z.string().trim().min(1, "L'identifiant de la commande est obligatoire."),
  method: z.enum(PAYMENT_METHODS, {
    errorMap: () => ({ message: "Le moyen de paiement est invalide." }),
  }),
  phone: z
    .string()
    .trim()
    .min(6, "Le numéro de téléphone n'est pas valide.")
    .max(20, "Le numéro de téléphone n'est pas valide.")
    .optional(),
});

function generateTransactionId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `KOBAS-${timestamp}-${random}`;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();

    const parsed = createPaymentSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Données invalides." },
        { status: 400 }
      );
    }

    const { orderId, method, phone } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Commande introuvable." },
        { status: 404 }
      );
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        { error: "Cette commande est déjà payée." },
        { status: 409 }
      );
    }

    // Empêche la création d'un doublon si un paiement PENDING existe déjà pour cette commande
    const existingPending = await prisma.payment.findFirst({
      where: {
        orderId: order.id,
        status: "PENDING",
      },
    });

    if (existingPending) {
      return NextResponse.json(
        {
          error: "Un paiement est déjà en attente pour cette commande.",
          payment: {
            id: existingPending.id,
            transactionId: existingPending.transactionId,
            method: existingPending.method,
            status: existingPending.status,
            createdAt: existingPending.createdAt,
          },
        },
        { status: 409 }
      );
    }

    if (method !== "CARD" && method !== "CASH" && !phone) {
      return NextResponse.json(
        {
          error:
            "Le numéro de téléphone est obligatoire pour ce moyen de paiement.",
        },
        { status: 400 }
      );
    }

    const transactionId = generateTransactionId();

    const payment = await prisma.payment.create({
      data: {
        transactionId,
        orderId: order.id,
        amount: order.total,
        currency: "XOF",
        method,
        status: "PENDING",
        phone: phone || null,
        provider:
          method === "MTN_MONEY"
            ? "MTN"
            : method === "MOOV_MONEY"
              ? "MOOV"
              : method === "CARD"
                ? "CARD"
                : "CASH",
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod: method,
        paymentStatus: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Transaction créée avec succès.",
        payment: {
          id: payment.id,
          transactionId: payment.transactionId,
          orderId: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
          status: payment.status,
          phone: payment.phone,
          provider: payment.provider,
          createdAt: payment.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/payments:", error);

    return NextResponse.json(
      { error: "Impossible de créer la transaction." },
      { status: 500 }
    );
  }
}
