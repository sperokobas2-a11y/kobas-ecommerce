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
   GET — LISTE DES CATÉGORIES
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

    const categories =
      await prisma.category.findMany({
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
          createdAt: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

    return NextResponse.json({
      categories,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/categories:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de charger les catégories.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST — CRÉATION D'UNE CATÉGORIE
========================================================= */

export async function POST(
  request: Request
) {
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

    const cleanName = name.trim();

    const slug = createSlug(cleanName);

    if (!slug) {
      return NextResponse.json(
        {
          error:
            "Impossible de créer un slug valide.",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.category.findFirst({
        where: {
          OR: [
            {
              name: {
                equals: cleanName,
                mode: "insensitive",
              },
            },
            {
              slug,
            },
          ],
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "Cette catégorie existe déjà.",
        },
        { status: 409 }
      );
    }

    const category =
      await prisma.category.create({
        data: {
          name: cleanName,
          slug,
          description:
            typeof description ===
              "string" &&
            description.trim()
              ? description.trim()
              : null,
          image:
            typeof image ===
              "string" &&
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
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        success: true,
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/admin/categories:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de créer la catégorie.",
      },
      { status: 500 }
    );
  }
}