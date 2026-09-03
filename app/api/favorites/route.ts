import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (
      !session?.user ||
      (session.user as { role?: string }).role !== "customer"
    ) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

    const customerId = (session.user as { id?: string }).id as string;

    const favorites = await prisma.favorite.findMany({
      where: { customerId },
      include: {
        product: {
          include: {
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("GET /api/favorites:", error);

    return NextResponse.json(
      { error: "Impossible de charger les favoris." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      (session.user as { role?: string }).role !== "customer"
    ) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour gérer vos favoris." },
        { status: 401 }
      );
    }

    const customerId = (session.user as { id?: string }).id as string;
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "L'identifiant du produit est obligatoire." },
        { status: 400 }
      );
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        customerId_productId: {
          customerId,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });

      return NextResponse.json({
        success: true,
        favorited: false,
        message: "Produit retiré des favoris.",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit introuvable." },
        { status: 404 }
      );
    }

    await prisma.favorite.create({
      data: {
        customerId,
        productId,
      },
    });

    return NextResponse.json({
      success: true,
      favorited: true,
      message: "Produit ajouté aux favoris.",
    });
  } catch (error) {
    console.error("POST /api/favorites:", error);

    return NextResponse.json(
      { error: "Impossible de mettre à jour les favoris." },
      { status: 500 }
    );
  }
}
