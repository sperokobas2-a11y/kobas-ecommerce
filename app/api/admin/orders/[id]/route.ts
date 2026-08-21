import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return NextResponse.json(
        { error: "Commande introuvable." },
        { status: 404 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        items: true,
        payments: true,
      },
    });

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