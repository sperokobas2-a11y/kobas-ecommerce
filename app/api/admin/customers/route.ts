import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("GET /api/admin/customers:", error);

    return NextResponse.json(
      { error: "Impossible de charger les clients." },
      { status: 500 }
    );
  }
}