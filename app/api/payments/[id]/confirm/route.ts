import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const ALLOWED_STATUSES = ["PAID", "FAILED"] as const;

type AllowedPaymentStatus = (typeof ALLOWED_STATUSES)[number];

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const status = body.status as AllowedPaymentStatus | undefined;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Le statut doit être PAID ou FAILED." },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return NextResponse.json(
        { error: `Transaction introuvable : ${id}` },
        { status: 404 }
      );
    }

    if (payment.status === "PAID") {
      return NextResponse.json(
        { error: "Cette transaction est déjà confirmée." },
        { status: 409 }
      );
    }

    const [updatedPayment, updatedOrder] = await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: status },
      }),
    ]);

    // Envoi automatique des liens de téléchargement si le paiement est confirmé
    if (status === "PAID" && resend) {
      try {
        const fullOrder = await prisma.order.findUnique({
          where: { id: updatedOrder.id },
          include: {
            items: true,
            customer: true,
          },
        });

        const downloadableItems = fullOrder?.items.filter(
          (item) => item.downloadUrl
        );

        if (fullOrder && downloadableItems && downloadableItems.length > 0) {
          const itemsHtml = downloadableItems
            .map(
              (item) => `
                <li style="margin-bottom: 12px;">
                  <strong>${item.name}</strong><br/>
                  <a href="${item.downloadUrl}" style="color: #3b82f6;">
                    Télécharger le fichier
                  </a>
                </li>
              `
            )
            .join("");

          await resend.emails.send({
            from: "Kobas Tech <onboarding@resend.dev>",
            to: fullOrder.customer.email,
            subject: `Vos fichiers pour la commande ${fullOrder.orderNumber}`,
            html: `
              <h2>Merci pour votre commande, ${fullOrder.customer.firstName} !</h2>
              <p>
                Votre paiement pour la commande <strong>${fullOrder.orderNumber}</strong>
                a été confirmé. Voici vos liens de téléchargement :
              </p>
              <ul>
                ${itemsHtml}
              </ul>
              <p style="margin-top: 20px; color: #666;">
                Conservez précieusement ces liens. En cas de souci, contactez-nous
                à sperokobas2@gmail.com.
              </p>
              <p>— L'équipe Kobas Tech</p>
            `,
          });
        }
      } catch (emailError) {
        // On ne bloque pas la réponse si l'e-mail échoue :
        // le paiement reste confirmé, on pourra renvoyer le lien manuellement.
        console.error(
          "Erreur envoi e-mail de téléchargement:",
          emailError
        );
      }
    }

    return NextResponse.json({
      success: true,
      message:
        status === "PAID"
          ? "Paiement confirmé avec succès."
          : "Paiement marqué comme échoué.",
      paymentId: updatedPayment.id,
      orderId: updatedOrder.id,
      paymentStatus: updatedPayment.status,
      orderPaymentStatus: updatedOrder.paymentStatus,
    });
  } catch (error) {
    console.error("PATCH /api/payments/[id]/confirm:", error);

    return NextResponse.json(
      { error: "Impossible de mettre à jour le paiement." },
      { status: 500 }
    );
  }
}
