import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const ALLOWED_STATUSES = [
  "PAID",
  "FAILED",
] as const;

type AllowedPaymentStatus =
  (typeof ALLOWED_STATUSES)[number];

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const body = await request.json();

    const status = body.status as
      | AllowedPaymentStatus
      | undefined;

    if (
      !status ||
      !ALLOWED_STATUSES.includes(status)
    ) {
      return NextResponse.json(
        {
          error:
            "Le statut doit être PAID ou FAILED.",
        },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: {
        id,
      },
    });

    if (!payment) {
      return NextResponse.json(
        {
          error: `Transaction introuvable : ${id}`,
        },
        { status: 404 }
      );
    }

    if (payment.status === "PAID") {
      return NextResponse.json(
        {
          error:
            "Cette transaction est déjà confirmée.",
        },
        { status: 409 }
      );
    }

    const updatedPayment =
      await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status,
        },
      });

    const updatedOrder =
      await prisma.order.update({
        where: {
          id: payment.orderId,
        },
        data: {
          paymentStatus: status,
        },
      });

    return NextResponse.json({
      success: true,
      message:
        status === "PAID"
          ? "Paiement confirmé avec succès."
          : "Paiement marqué comme échoué.",
      payment: updatedPayment,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        paymentStatus: updatedOrder.paymentStatus,
      },
    });
  } catch (error) {
    console.error(
      "PATCH /api/payments/[id]/confirm:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de mettre à jour le paiement.",
      },
      { status: 500 }
    );
  }
}