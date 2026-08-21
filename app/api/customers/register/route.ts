import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, whatsapp, address, city } =
      body;

    if (!firstName || !lastName || !email || !password || !whatsapp) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          error: "Le mot de passe doit contenir au moins 6 caractères.",
        },
        { status: 400 }
      );
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cette adresse email." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        whatsapp,
        address: address || null,
        city: city || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Compte créé avec succès.",
        customer: {
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/customers/register:", error);

    return NextResponse.json(
      { error: "Impossible de créer le compte." },
      { status: 500 }
    );
  }
}