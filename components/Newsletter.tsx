"use client";

import { FormEvent, useState } from "react";
import { Loader2, Mail } from "lucide-react";

export default function Newsletter() {
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
    <div className="border-y border-white/5 bg-white/[0.015]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 lg:px-8 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="mx-auto max-w-7xl px-5 pb-4 lg:px-8">
          <p
            className={`text-xs ${
              error ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {error || message}
          </p>
        </div>
      )}
    </div>
  );
}
