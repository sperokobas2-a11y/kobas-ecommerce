import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.toLowerCase().trim()
        : "";

    if (!email) {
      return NextResponse.json(
        {
          error: "Adresse e-mail invalide.",
        },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: {
        email,
      },
    });

    /*
     * On retourne la même réponse même si l'e-mail
     * n'existe pas afin de ne pas révéler les comptes
     * enregistrés sur Kobas Tech.
     */
    if (!customer) {
      return NextResponse.json({
        success: true,
      });
    }

    await prisma.passwordResetToken.deleteMany({
      where: {
        customerId: customer.id,
      },
    });

    const rawToken = randomBytes(32).toString("hex");

    const tokenHash = createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + 60 * 60 * 1000
    );

    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        expiresAt,
        customerId: customer.id,
      },
    });

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      "https://kobas-ecommerce.vercel.app";

    const resetUrl =
      `${baseUrl}/reinitialiser-mot-de-passe?token=${rawToken}`;

    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM;

    if (!resendApiKey || !emailFrom) {
      console.error(
        "RESEND_API_KEY ou EMAIL_FROM manquant."
      );

      return NextResponse.json(
        {
          error:
            "Le service d'envoi d'e-mails n'est pas configuré.",
        },
        { status: 500 }
      );
    }

    const emailResponse = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: emailFrom,
          to: [customer.email],
          subject:
            "Réinitialisation de votre mot de passe | Kobas Tech",
          html: `
            <div style="font-family: Arial, sans-serif; background:#08090d; color:#ffffff; padding:40px 20px;">
              <div style="max-width:600px;margin:auto;background:#111318;border-radius:20px;padding:35px;border:1px solid #252832;">
                
                <h1 style="margin:0 0 20px;color:#ffffff;">
                  Kobas <span style="color:#60a5fa;">Tech</span>
                </h1>

                <h2 style="color:#ffffff;">
                  Réinitialisation du mot de passe
                </h2>

                <p style="color:#a1a1aa;line-height:1.7;">
                  Bonjour ${customer.firstName},
                </p>

                <p style="color:#a1a1aa;line-height:1.7;">
                  Vous avez demandé la réinitialisation de votre
                  mot de passe Kobas Tech.
                </p>

                <div style="margin:30px 0;">
                  <a
                    href="${resetUrl}"
                    style="display:inline-block;background:#ffffff;color:#000000;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:bold;"
                  >
                    Réinitialiser mon mot de passe
                  </a>
                </div>

                <p style="color:#71717a;font-size:13px;line-height:1.6;">
                  Ce lien est valable pendant 1 heure.
                  Si vous n'êtes pas à l'origine de cette demande,
                  vous pouvez ignorer cet e-mail.
                </p>

                <hr style="border:none;border-top:1px solid #27272a;margin:30px 0;" />

                <p style="color:#52525b;font-size:12px;">
                  Kobas Tech — Technologie. Simplicité. Confiance.
                </p>
              </div>
            </div>
          `,
        }),
      }
    );

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();

      console.error(
        "Erreur Resend:",
        errorText
      );

      return NextResponse.json(
        {
          error:
            "Impossible d'envoyer l'e-mail. Veuillez réessayer.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Erreur forgot-password:",
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
