"use client";

import Link from "next/link";
import {
  Check,
  Home,
  ShoppingBag,
  Zap,
} from "lucide-react";

import { useCartStore } from "@/lib/store/cart-store";

export default function ConfirmationPage() {
  const clearCart = useCartStore(
    (state) => state.clearCart
  );

  const orderNumber =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("order")
      : null;

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      {/* HEADER */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-18 max-w-7xl items-center px-5 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600">
              <Zap className="h-5 w-5 fill-white" />
            </div>

            <div>
              <p className="text-lg font-bold">
                KOBAS
              </p>

              <p className="-mt-1 text-[9px] font-semibold tracking-[0.28em] text-blue-400">
                TECH
              </p>
            </div>
          </Link>
        </div>
      </header>

      {/* CONTENU */}
      <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-2xl items-center justify-center px-5 py-16">
        <div className="w-full text-center">

          {/* SUCCÈS */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 ring-8 ring-emerald-500/5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500">
              <Check
                className="h-8 w-8 text-white"
                strokeWidth={3}
              />
            </div>
          </div>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
            Commande confirmée
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Merci pour votre commande !
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-zinc-500">
            Votre commande a bien été enregistrée.
            Notre équipe Kobas Tech prendra contact
            avec vous pour la suite du traitement.
          </p>

          {/* NUMÉRO DE COMMANDE */}
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
              Numéro de commande
            </p>

            <p className="mt-3 break-all text-xl font-black tracking-wide text-blue-400">
              {orderNumber || "Commande confirmée"}
            </p>

            <p className="mt-3 text-xs text-zinc-600">
              Conservez ce numéro pour suivre votre commande.
            </p>
          </div>

          {/* PAIEMENT */}
          <div className="mx-auto mt-5 max-w-md rounded-2xl border border-yellow-500/10 bg-yellow-500/5 p-5 text-left">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-yellow-400" />

              <div>
                <p className="text-sm font-semibold">
                  Paiement en attente
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Votre commande est enregistrée.
                  Le paiement sera traité selon la
                  méthode sélectionnée.
                </p>
              </div>
            </div>
          </div>

          {/* BOUTONS */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/boutique"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-black transition hover:bg-blue-400"
            >
              <ShoppingBag className="h-4 w-4" />
              Continuer mes achats
            </Link>

            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              <Home className="h-4 w-4" />
              Accueil
            </Link>
          </div>

          {/* CONTACT */}
          <div className="mx-auto mt-12 max-w-md border-t border-white/5 pt-6">
            <p className="text-xs leading-5 text-zinc-600">
              Un problème avec votre commande ?
              Contactez Kobas Tech via WhatsApp ou
              par email.
            </p>
          </div>

          {/* VIDER LE PANIER */}
          <button
            onClick={clearCart}
            className="mt-6 text-xs text-zinc-700 transition hover:text-zinc-400"
          >
            Vider le panier
          </button>
        </div>
      </section>
    </main>
  );
}