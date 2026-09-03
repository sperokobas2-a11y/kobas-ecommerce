"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

import Header from "@/components/Header";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Une erreur est survenue. Veuillez réessayer."
        );

        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError(
        "Impossible de contacter le serveur. Veuillez réessayer."
      );
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <Header />

      <section className="mx-auto max-w-md px-5 py-16 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
            <Mail className="h-8 w-8 text-white" />
          </div>

          <h1 className="mt-5 text-2xl font-black">
            Mot de passe oublié ?
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Entrez votre adresse e-mail pour recevoir un lien
            de réinitialisation.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-7 shadow-2xl">
          {success ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />

              <h2 className="mt-4 text-lg font-bold">
                Vérifiez votre boîte mail
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Si un compte Kobas Tech correspond à cette
                adresse e-mail, un lien de réinitialisation vous
                a été envoyé.
              </p>

              <Link
                href="/connexion"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-xs font-semibold text-zinc-400">
                  Adresse email
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <p className="text-xs font-medium text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-black transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  "Envoyer le lien"
                )}
              </button>

              <Link
                href="/connexion"
                className="flex items-center justify-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
