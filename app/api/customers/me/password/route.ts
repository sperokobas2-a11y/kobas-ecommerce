import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "customer") {
      return NextResponse.json(
        { error: "Vous devez être connecté pour modifier votre mot de passe." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const currentPassword =
      typeof body.currentPassword === "string"
        ? body.currentPassword
        : "";

    const newPassword =
      typeof body.newPassword === "string"
        ? body.newPassword
        : "";

    if (!newPassword) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe est obligatoire." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit contenir au moins 8 caractères." },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Compte client introuvable." },
        { status: 404 }
      );
    }

    // Compte Google sans mot de passe : on permet d'en définir un.
    if (customer.password) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Votre ancien mot de passe est obligatoire." },
          { status: 400 }
        );
      }

      const isValid = await bcrypt.compare(
        currentPassword,
        customer.password
      );

      if (!isValid) {
        return NextResponse.json(
          { error: "Votre ancien mot de passe est incorrect." },
          { status: 400 }
        );
      }
    }

    const samePassword =
      customer.password &&
      (await bcrypt.compare(newPassword, customer.password));

    if (samePassword) {
      return NextResponse.json(
        {
          error:
            "Le nouveau mot de passe doit être différent de l'ancien.",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.customer.update({
      where: {
        id: customer.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Mot de passe modifié avec succès.",
    });
  } catch (error) {
    console.error("PATCH /api/customers/me/password:", error);

    return NextResponse.json(
      { error: "Impossible de modifier le mot de passe." },
      { status: 500 }
    );
  }
}
