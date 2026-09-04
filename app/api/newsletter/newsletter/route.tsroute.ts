import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "L'adresse e-mail est obligatoire." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Adresse e-mail invalide." },
        { status: 400 }
      );
    }

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Vous êtes déjà inscrit à la newsletter.",
      });
    }

    await prisma.newsletterSubscriber.create({
      data: { email: normalizedEmail },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Merci pour votre inscription !",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/newsletter:", error);

    return NextResponse.json(
      { error: "Impossible de finaliser l'inscription." },
      { status: 500 }
    );
  }
}
