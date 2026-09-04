"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setMessage(data.message);
      setEmail("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {/* NEWSLETTER */}
        <div className="flex flex-col gap-4 border-b border-white/5 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <Mail className="h-4 w-4 text-blue-400" />
              Restez informé
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Recevez nos nouveautés et promotions par e-mail.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse e-mail"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500 sm:w-64"
            />

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-5 text-sm font-bold text-black transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "S'inscrire"
              )}
            </button>
          </form>
        </div>

        {(message || error) && (
          <p
            className={`pt-3 text-xs ${
              error ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {error || message}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-zinc-500">
            <span className="font-semibold text-white">KOBAS TECH</span>
            <span className="mx-2">•</span>
            Technologie. Simplicité. Confiance.
          </div>

          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Kobas Tech.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/5 pt-5 text-xs text-zinc-600">
          <Link href="/suivi-commande" className="transition hover:text-zinc-400">
            Suivre ma commande
          </Link>
          <Link href="/mentions-legales" className="transition hover:text-zinc-400">
            Mentions légales
          </Link>
          <Link href="/cgv" className="transition hover:text-zinc-400">
            Conditions générales de vente
          </Link>
          <Link href="/confidentialite" className="transition hover:text-zinc-400">
            Politique de confidentialité
          </Link>
          <Link href="/contact" className="transition hover:text-zinc-400">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
