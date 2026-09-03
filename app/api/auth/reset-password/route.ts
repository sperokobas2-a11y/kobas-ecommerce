import { NextResponse } from "next/server";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const token =
      typeof body.token === "string"
        ? body.token.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Le lien de réinitialisation est invalide.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Le mot de passe doit contenir au moins 8 caractères.",
        },
        { status: 400 }
      );
    }

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const resetToken =
      await prisma.passwordResetToken.findUnique({
        where: {
          tokenHash,
        },
      });

    if (!resetToken) {
      return NextResponse.json(
        {
          error:
            "Ce lien est invalide ou a déjà été utilisé.",
        },
        { status: 400 }
      );
    }

    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({
        where: {
          id: resetToken.id,
        },
      });

      return NextResponse.json(
        {
          error:
            "Ce lien de réinitialisation a expiré.",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    await prisma.customer.update({
      where: {
        id: resetToken.customerId,
      },
      data: {
        password: hashedPassword,
      },
    });

    await prisma.passwordResetToken.delete({
      where: {
        id: resetToken.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Erreur reset-password:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue. Veuillez réessayer.",
      },
      { status: 500 }
    );
  }
}
