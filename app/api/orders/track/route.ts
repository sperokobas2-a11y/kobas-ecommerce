import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderNumber, email } = body;

    if (!orderNumber?.trim() || !email?.trim()) {
      return NextResponse.json(
        {
          error:
            "Le numéro de commande et l'email sont obligatoires.",
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        orderNumber: orderNumber.trim().toUpperCase(),
      },
      include: {
        items: true,
        payments: true,
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (
      !order ||
      order.customer.email.toLowerCase() !== email.trim().toLowerCase()
    ) {
      return NextResponse.json(
        {
          error:
            "Aucune commande trouvée avec ces informations. Vérifiez le numéro de commande et l'email.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("POST /api/orders/track:", error);

    return NextResponse.json(
      { error: "Impossible de retrouver la commande." },
      { status: 500 }
    );
  }
}
