import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (
      !session?.user ||
      (session.user as { role?: string }).role !== "customer"
    ) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

    const customerId = (session.user as { id?: string }).id;

    if (!customerId) {
      return NextResponse.json(
        { error: "Identifiant client introuvable." },
        { status: 401 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Client introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        whatsapp: customer.whatsapp,
        address: customer.address,
        city: customer.city,
        country: customer.country,

        // Informations de sécurité du compte
        hasGoogleAccount: Boolean(customer.googleId),
        hasPassword: Boolean(customer.password),
      },
    });
  } catch (error) {
    console.error("GET /api/customers/me:", error);

    return NextResponse.json(
      { error: "Impossible de charger le profil." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      (session.user as { role?: string }).role !== "customer"
    ) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

    const customerId = (session.user as { id?: string }).id;

    if (!customerId) {
      return NextResponse.json(
        { error: "Identifiant client introuvable." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      firstName,
      lastName,
      whatsapp,
      address,
      city,
    } = body;

    if (!firstName || !lastName || !whatsapp) {
      return NextResponse.json(
        {
          error:
            "Le prénom, le nom et le WhatsApp sont obligatoires.",
        },
        { status: 400 }
      );
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        firstName,
        lastName,
        whatsapp,
        address: address || null,
        city: city || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil mis à jour avec succès.",
      customer: {
        id: updatedCustomer.id,
        firstName: updatedCustomer.firstName,
        lastName: updatedCustomer.lastName,
        email: updatedCustomer.email,
        whatsapp: updatedCustomer.whatsapp,
        address: updatedCustomer.address,
        city: updatedCustomer.city,
        country: updatedCustomer.country,

        // Informations de sécurité du compte
        hasGoogleAccount: Boolean(updatedCustomer.googleId),
        hasPassword: Boolean(updatedCustomer.password),
      },
    });
  } catch (error) {
    console.error("PATCH /api/customers/me:", error);

    return NextResponse.json(
      { error: "Impossible de mettre à jour le profil." },
      { status: 500 }
    );
  }
}
