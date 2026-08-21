import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const category =
      await prisma.category.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

    if (!category) {
      return NextResponse.json(
        {
          error: "Catégorie introuvable.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      category,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/categories/[id]:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de charger la catégorie.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
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
      image,
    } = body;

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Le nom de la catégorie est obligatoire.",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.category.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error: "Catégorie introuvable.",
        },
        { status: 404 }
      );
    }

    const cleanName = name.trim();

    const slug = cleanName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const duplicate =
      await prisma.category.findFirst({
        where: {
          slug,
          NOT: {
            id,
          },
        },
      });

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            "Une autre catégorie utilise déjà ce nom.",
        },
        { status: 409 }
      );
    }

    const category =
      await prisma.category.update({
        where: {
          id,
        },
        data: {
          name: cleanName,
          slug,
          description:
            typeof description === "string" &&
            description.trim()
              ? description.trim()
              : null,
          image:
            typeof image === "string" &&
            image.trim()
              ? image.trim()
              : null,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error(
      "PUT /api/admin/categories/[id]:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de modifier la catégorie.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const category =
      await prisma.category.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

    if (!category) {
      return NextResponse.json(
        {
          error: "Catégorie introuvable.",
        },
        { status: 404 }
      );
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        {
          error:
            `Impossible de supprimer "${category.name}" car elle contient ${category._count.products} produit(s).`,
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Catégorie supprimée avec succès.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/categories/[id]:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de supprimer la catégorie.",
      },
      { status: 500 }
    );
  }
}