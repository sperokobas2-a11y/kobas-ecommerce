import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Vous devez être connecté.",
        },
        { status: 401 }
      );
    }

    const customerId = session.user.id;

    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
      select: {
        id: true,
        googleId: true,
        password: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        {
          error: "Compte client introuvable.",
        },
        { status: 404 }
      );
    }

    if (!customer.googleId) {
      return NextResponse.json(
        {
          error: "Aucun compte Google n'est connecté.",
        },
        { status: 400 }
      );
    }

    /*
     * Sécurité :
     * on ne permet pas de supprimer Google si le client
     * n'a aucun mot de passe local.
     *
     * Cela éviterait que le client perde son seul moyen
     * de connexion au compte.
     */
    if (!customer.password) {
      return NextResponse.json(
        {
          error:
            "Définissez d'abord un mot de passe avant de déconnecter votre compte Google.",
        },
        { status: 400 }
      );
    }

    await prisma.customer.update({
      where: {
        id: customer.id,
      },
      data: {
        googleId: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Compte Google déconnecté avec succès.",
    });
  } catch (error) {
    console.error(
      "POST /api/customers/me/google/unlink:",
      error
    );

    return NextResponse.json(
      {
        error: "Impossible de déconnecter le compte Google.",
      },
      { status: 500 }
    );
  }
}
