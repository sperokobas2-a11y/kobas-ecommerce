import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      product,
    });
  } catch (error) {
    console.error("GET /api/admin/products/[id]:", error);

    return NextResponse.json(
      {
        error: "Impossible de charger le produit.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const body = await request.json();

    const {
      name,
      description,
      price,
      comparePrice,
      stock,
      sku,
      categoryId,
      images,
      downloadUrl,
      featured,
      active,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {
          error: "Le nom du produit est obligatoire.",
        },
        { status: 400 }
      );
    }

    if (!description?.trim()) {
      return NextResponse.json(
        {
          error: "La description est obligatoire.",
        },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        {
          error: "La catégorie est obligatoire.",
        },
        { status: 400 }
      );
    }

    if (
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return NextResponse.json(
        {
          error: "Le prix est invalide.",
        },
        { status: 400 }
      );
    }

    if (
      typeof stock !== "number" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return NextResponse.json(
        {
          error: "Le stock est invalide.",
        },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          error: "Produit introuvable.",
        },
        { status: 404 }
      );
    }

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          error: "La catégorie sélectionnée n'existe pas.",
        },
        { status: 400 }
      );
    }

    const finalSku =
      typeof sku === "string" && sku.trim() ? sku.trim() : null;

    if (finalSku) {
      const skuProduct = await prisma.product.findFirst({
        where: {
          sku: finalSku,
          NOT: {
            id,
          },
        },
      });

      if (skuProduct) {
        return NextResponse.json(
          {
            error: "Ce SKU est déjà utilisé par un autre produit.",
          },
          { status: 409 }
        );
      }
    }

    const finalImages = Array.isArray(images)
      ? images.filter(
          (image): image is string =>
            typeof image === "string" && image.trim().length > 0
        )
      : [];

    const finalDownloadUrl =
      typeof downloadUrl === "string" && downloadUrl.trim().length > 0
        ? downloadUrl.trim()
        : null;

    const updatedProduct = await prisma.product.update({
      where: {
        id,
      },
      data: {
        name: name.trim(),
        description: description.trim(),

        price,

        comparePrice:
          typeof comparePrice === "number" &&
          Number.isFinite(comparePrice) &&
          comparePrice > 0
            ? comparePrice
            : null,

        stock,

        sku: finalSku,

        images: finalImages,

        downloadUrl: finalDownloadUrl,

        featured: Boolean(featured),
        active: Boolean(active),

        categoryId,
      },

      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("PATCH /api/admin/products/[id]:", error);

    return NextResponse.json(
      {
        error: "Impossible de modifier le produit.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          error: "Produit introuvable.",
        },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Produit supprimé avec succès.",
    });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id]:", error);

    return NextResponse.json(
      {
        error: "Impossible de supprimer le produit.",
      },
      { status: 500 }
    );
  }
}
