"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!token) {
      setError("Lien de réinitialisation invalide.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Impossible de réinitialiser le mot de passe."
        );
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-red-400" />

        <h2 className="mt-4 text-lg font-bold">
          Lien invalide
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Le lien de réinitialisation est invalide ou incomplet.
        </p>

        <Link
          href="/mot-de-passe-oublie"
          className="mt-5 inline-block text-sm font-semibold text-blue-400 hover:underline"
        >
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />

        <h2 className="mt-4 text-xl font-bold">
          Mot de passe réinitialisé
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Votre nouveau mot de passe a bien été enregistré.
        </p>

        <Link
          href="/connexion"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-sm font-bold text-black transition hover:bg-blue-400"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-semibold text-zinc-400">
            Nouveau mot de passe
          </label>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-12 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-zinc-400">
            Confirmer le mot de passe
          </label>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-12 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              aria-label={
                showConfirmPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
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
              Réinitialisation...
            </>
          ) : (
            "Réinitialiser le mot de passe"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link
          href="/connexion"
          className="font-semibold text-blue-400 hover:underline"
        >
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}

export default function ReinitialiserMotDePassePage() {
  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <section className="mx-auto max-w-md px-5 py-16 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
            <Lock className="h-8 w-8" />
          </div>

          <h1 className="mt-5 text-2xl font-black">
            Nouveau mot de passe
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Choisissez un nouveau mot de passe pour votre compte Kobas Tech.
          </p>
        </div>

        <div className="mt-8">
          <Suspense
            fallback={
              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-400" />
                <p className="mt-3 text-sm text-zinc-500">
                  Chargement...
                </p>
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
