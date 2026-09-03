import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const reviews = await prisma.review.findMany({
      where: { productId: id },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      reviews,
      averageRating,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("GET /api/products/[id]/reviews:", error);

    return NextResponse.json(
      { error: "Impossible de charger les avis." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      (session.user as { role?: string }).role !== "customer"
    ) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour laisser un avis." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const { rating, comment } = body;

    if (
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        { error: "La note doit être un nombre entier entre 1 et 5." },
        { status: 400 }
      );
    }

    if (!comment?.trim()) {
      return NextResponse.json(
        { error: "Le commentaire est obligatoire." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit introuvable." },
        { status: 404 }
      );
    }

    const customerId = (session.user as { id?: string }).id as string;

    // Un seul avis par client et par produit — on met à jour s'il existe déjà
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: id,
        customerId,
      },
    });

    let review;

    if (existingReview) {
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment: comment.trim(),
        },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    } else {
      review = await prisma.review.create({
        data: {
          productId: id,
          customerId,
          rating,
          comment: comment.trim(),
        },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: existingReview
          ? "Votre avis a été mis à jour."
          : "Votre avis a été publié.",
        review,
      },
      { status: existingReview ? 200 : 201 }
    );
  } catch (error) {
    console.error("POST /api/products/[id]/reviews:", error);

    return NextResponse.json(
      { error: "Impossible d'enregistrer l'avis." },
      { status: 500 }
    );
  }
}
