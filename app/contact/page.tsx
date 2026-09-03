"use client";

import Footer from "@/components/Footer";
import type { FormEvent } from "react";
import { useState } from "react";
import {
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Send,
} from "lucide-react";

import Header from "@/components/Header";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible d'envoyer votre message.");
      }

      setSuccess(true);

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  const contactPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Kobas Tech",
    url: "https://kobas-ecommerce.vercel.app/contact",
    description:
      "Contactez Kobas Tech au Bénin pour toute question, demande d'assistance, projet digital ou besoin en solutions technologiques.",
    mainEntity: {
      "@type": "Organization",
      name: "Kobas Tech",
      url: "https://kobas-ecommerce.vercel.app",
      email: "sperokobas2@gmail.com",
      telephone: "+2290192604908",
      areaServed: {
        "@type": "Country",
        name: "Bénin",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+2290192604908",
        email: "sperokobas2@gmail.com",
        contactType: "customer service",
        areaServed: "BJ",
        availableLanguage: ["fr"],
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactPageJsonLd),
        }}
      />

      <main className="min-h-screen bg-[#08090d] text-white">
        <Header />

        {/* HERO */}
        <section className="border-b border-white/5">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
              Kobas Tech
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Contactez-nous
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Une question, un projet, besoin d&apos;aide ? Notre équipe vous
              répond rapidement.
            </p>
          </div>
        </section>

        {/* CONTENU */}
        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
            {/* INFOS CONTACT */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <MessageCircle className="h-5 w-5" />
                </div>

                <h2 className="mt-5 font-semibold">WhatsApp</h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Réponse rapide, du lundi au samedi.
                </p>

                <a
                  href="https://wa.me/2290192604908"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:underline"
                >
                  +229 01 92 60 49 08
                </a>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <Mail className="h-5 w-5" />
                </div>

                <h2 className="mt-5 font-semibold">E-mail</h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Pour toute demande détaillée.
                </p>

                <a
                  href="mailto:sperokobas2@gmail.com"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-violet-400 hover:underline"
                >
                  sperokobas2@gmail.com
                </a>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <MapPin className="h-5 w-5" />
                </div>

                <h2 className="mt-5 font-semibold">Localisation</h2>

                <p className="mt-2 text-sm text-zinc-500">Bénin</p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                  <Clock className="h-5 w-5" />
                </div>

                <h2 className="mt-5 font-semibold">Disponibilité</h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Lundi – Samedi
                  <br />
                  08h00 – 20h00
                </p>
              </div>
            </div>

            {/* FORMULAIRE */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
              <h2 className="text-xl font-bold">
                Envoyez-nous un message
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Remplissez le formulaire ci-dessous, nous vous répondrons dans
                les plus brefs délais.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-zinc-400">
                      Nom complet
                    </label>

                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                      placeholder="Votre nom"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-zinc-400">
                      Téléphone / WhatsApp
                    </label>

                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: e.target.value,
                        })
                      }
                      placeholder="01 XX XX XX XX"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-zinc-400">
                    Adresse email
                  </label>

                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    placeholder="vous@exemple.com"
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-zinc-400">
                    Sujet
                  </label>

                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subject: e.target.value,
                      })
                    }
                    placeholder="Objet de votre message"
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-zinc-400">
                    Message
                  </label>

                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        message: e.target.value,
                      })
                    }
                    placeholder="Décrivez votre demande..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                    <p className="text-sm text-emerald-400">
                      Votre message a bien été envoyé. Nous vous répondrons
                      rapidement.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-black transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Envoyer le message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <Footer />
      </main>
    </>
  );
}
