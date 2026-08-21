import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function createSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* =========================================================
   GET — LISTE DES PRODUITS
========================================================= */

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
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
      products,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/products:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de charger les produits.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST — CRÉATION D'UN PRODUIT
========================================================= */

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

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
      featured,
      active,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {
          error:
            "Le nom du produit est obligatoire.",
        },
        { status: 400 }
      );
    }

    if (!description?.trim()) {
      return NextResponse.json(
        {
          error:
            "La description est obligatoire.",
        },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        {
          error:
            "La catégorie est obligatoire.",
        },
        { status: 400 }
      );
    }

    if (
      typeof price !== "number" ||
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
      stock < 0
    ) {
      return NextResponse.json(
        {
          error: "Le stock est invalide.",
        },
        { status: 400 }
      );
    }

    const category =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

    if (!category) {
      return NextResponse.json(
        {
          error:
            "La catégorie sélectionnée n'existe pas.",
        },
        { status: 400 }
      );
    }

    let slug = createSlug(name);

    const existingSlug =
      await prisma.product.findUnique({
        where: {
          slug,
        },
      });

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const finalSku =
      sku?.trim() || null;

    if (finalSku) {
      const existingSku =
        await prisma.product.findUnique({
          where: {
            sku: finalSku,
          },
        });

      if (existingSku) {
        return NextResponse.json(
          {
            error:
              "Ce SKU est déjà utilisé par un autre produit.",
          },
          { status: 409 }
        );
      }
    }

    const product =
      await prisma.product.create({
        data: {
          name: name.trim(),
          slug,
          description: description.trim(),

          price,

          comparePrice:
            typeof comparePrice ===
              "number" &&
            comparePrice > 0
              ? comparePrice
              : null,

          stock,

          sku: finalSku,

          images: Array.isArray(images)
            ? images.filter(
                (
                  image
                ): image is string =>
                  typeof image ===
                    "string" &&
                  image.trim().length >
                    0
              )
            : [],

          featured: Boolean(
            featured
          ),

          active: Boolean(
            active
          ),

          categoryId,
        },

        include: {
          category: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/admin/products:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de créer le produit.",
      },
      { status: 500 }
    );
  }
}