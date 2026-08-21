import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateTransactionId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `KOBAS-${timestamp}-${random}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { orderId, method, phone } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "L'identifiant de la commande est obligatoire." },
        { status: 400 }
      );
    }

    const allowedMethods = ["MTN_MONEY", "MOOV_MONEY", "CARD", "CASH"];

    if (!allowedMethods.includes(method)) {
      return NextResponse.json(
        { error: "Le moyen de paiement est invalide." },
        { status: 400 }
      );
    }

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
          error:
            "Un paiement est déjà en attente pour cette commande.",
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

    if (method !== "CARD" && method !== "CASH") {
      if (!phone || typeof phone !== "string") {
        return NextResponse.json(
          {
            error:
              "Le numéro de téléphone est obligatoire pour ce moyen de paiement.",
          },
          { status: 400 }
        );
      }
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
        phone:
          typeof phone === "string" && phone.trim()
            ? phone.trim()
            : null,
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