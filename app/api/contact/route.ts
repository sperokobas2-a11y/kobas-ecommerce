import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Le nom, l'email et le message sont obligatoires." },
        { status: 400 }
      );
    }

    // 1. Stockage en base
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
      },
    });

    // 2. Envoi d'e-mail (uniquement si RESEND_API_KEY est configurée)
    if (resend) {
      try {
        await resend.emails.send({
          from: "Kobas Tech <onboarding@resend.dev>",
          to: "sperokobas2@gmail.com",
          replyTo: email,
          subject: subject
            ? `[Contact] ${subject}`
            : `Nouveau message de ${name}`,
          html: `
            <h2>Nouveau message de contact</h2>
            <p><strong>Nom :</strong> ${name}</p>
            <p><strong>Email :</strong> ${email}</p>
            ${phone ? `<p><strong>Téléphone :</strong> ${phone}</p>` : ""}
            ${subject ? `<p><strong>Sujet :</strong> ${subject}</p>` : ""}
            <p><strong>Message :</strong></p>
            <p>${message.replace(/\n/g, "<br>")}</p>
          `,
        });
      } catch (emailError) {
        // On ne bloque pas la réponse si l'e-mail échoue :
        // le message est déjà enregistré en base.
        console.error("Erreur envoi e-mail Resend:", emailError);
      }
    } else {
      console.log(
        "RESEND_API_KEY non configurée — message stocké en base uniquement."
      );
    }

    return NextResponse.json({
      success: true,
      message: "Votre message a bien été envoyé.",
      id: contactMessage.id,
    });
  } catch (error) {
    console.error("POST /api/contact:", error);

    return NextResponse.json(
      { error: "Impossible d'envoyer votre message." },
      { status: 500 }
    );
  }
}