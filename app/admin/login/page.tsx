"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, Lock, Mail, Zap } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const result = await signIn("admin", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08090d] px-5 text-white">
      <div className="w-full max-w-md">
        {/* LOGO */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
            <Zap className="h-8 w-8 fill-white" />
          </div>

          <h1 className="mt-5 text-2xl font-black">
            KOBAS TECH
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Administration
          </p>
        </div>

        {/* FORMULAIRE */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7 shadow-2xl">
          <h2 className="text-xl font-bold">
            Connexion administrateur
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Connectez-vous pour accéder au tableau de
            bord.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-5"
          >
            {/* EMAIL */}
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
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="admin@kobastech.com"
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
                />
              </div>
            </div>

            {/* MOT DE PASSE */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-400">
                Mot de passe
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="••••••••••••"
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
                />
              </div>
            </div>

            {/* ERREUR */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <p className="text-xs font-medium text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* BOUTON */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-black transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-700">
          Kobas Tech • Administration sécurisée
        </p>
      </div>
    </main>
  );
}