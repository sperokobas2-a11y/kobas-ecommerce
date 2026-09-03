import { NextResponse } from "next/server";
import crypto from "crypto";

import { auth } from "@/lib/auth";

const GOOGLE_LINK_COOKIE = "kobas_google_link";
const GOOGLE_LINK_MAX_AGE = 10 * 60;

function createLinkSignature(customerId: string) {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET manquant.");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(customerId)
    .digest("hex");
}

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

    const signature = createLinkSignature(customerId);

    const cookieValue = `${customerId}.${signature}`;

    const response = NextResponse.json({
      success: true,
      message: "Autorisation de liaison Google créée.",
    });

    response.cookies.set({
      name: GOOGLE_LINK_COOKIE,
      value: cookieValue,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: GOOGLE_LINK_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error(
      "POST /api/customers/me/google/link:",
      error
    );

    return NextResponse.json(
      {
        error: "Impossible de préparer la liaison Google.",
      },
      { status: 500 }
    );
  }
}
