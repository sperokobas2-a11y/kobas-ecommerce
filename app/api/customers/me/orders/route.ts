import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || (session.user as { role?: string }).role !== "customer") {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

    const customerId = (session.user as { id?: string }).id;

    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        items: true,
        payments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET /api/customers/me/orders:", error);

    return NextResponse.json(
      { error: "Impossible de charger les commandes." },
      { status: 500 }
    );
  }
}