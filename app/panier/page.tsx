"use client";

import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Zap,
} from "lucide-react";

import { useCartStore } from "@/lib/store/cart-store";

export default function PanierPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore(
    (state) => state.updateQuantity
  );
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08090d]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600">
              <Zap className="h-5 w-5 fill-white" />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight">
                KOBAS
              </p>

              <p className="-mt-1 text-[9px] font-semibold tracking-[0.28em] text-blue-400">
                TECH
              </p>
            </div>
          </Link>

          <Link
            href="/boutique"
            className="text-sm font-medium text-zinc-400 transition hover:text-white"
          >
            Continuer mes achats
          </Link>
        </div>
      </header>

      {/* CONTENU */}
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
            Kobas Tech
          </p>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Mon panier
          </h1>

          <p className="text-sm text-zinc-500">
            {itemCount} article{itemCount !== 1 ? "s" : ""} dans
            votre panier
          </p>
        </div>

        {/* PANIER VIDE */}
        {items.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-400">
              <ShoppingBag className="h-9 w-9" />
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              Votre panier est vide
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
              Découvrez nos produits et ajoutez ceux qui vous
              intéressent à votre panier.
            </p>

            <Link
              href="/boutique"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-black transition hover:bg-zinc-200"
            >
              Découvrir la boutique
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* ARTICLES */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Vos produits
                </h2>

                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-medium text-zinc-500 transition hover:text-red-400"
                >
                  Vider le panier
                </button>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 sm:p-5"
                >
                  <div className="flex gap-4">
                    {/* IMAGE */}
                    <Link
                      href={`/produit/${item.slug}`}
                      className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900 to-blue-950/40 sm:h-28 sm:w-28"
                    >
                      <Zap className="h-9 w-9 text-blue-400" />
                    </Link>

                    {/* INFOS */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            href={`/produit/${item.slug}`}
                            className="text-base font-semibold transition hover:text-blue-400 sm:text-lg"
                          >
                            {item.name}
                          </Link>

                          <p className="mt-1 text-xs text-zinc-500">
                            Réf. {item.id.slice(-8)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Supprimer ${item.name}`}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                        {/* QUANTITÉ */}
                        <div className="flex h-10 items-center rounded-lg border border-white/10 bg-white/[0.03]">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity - 1
                              )
                            }
                            className="flex h-full w-9 items-center justify-center text-zinc-400 transition hover:text-white"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>

                          <span className="w-8 text-center text-xs font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity + 1
                              )
                            }
                            disabled={
                              item.quantity >= item.stock
                            }
                            className="flex h-full w-9 items-center justify-center text-zinc-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* PRIX */}
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            {(
                              item.price * item.quantity
                            ).toLocaleString("fr-FR")}{" "}
                            FCFA
                          </p>

                          {item.quantity > 1 && (
                            <p className="text-xs text-zinc-600">
                              {item.price.toLocaleString("fr-FR")}{" "}
                              FCFA / unité
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RÉSUMÉ */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <h2 className="text-lg font-bold">
                  Résumé de la commande
                </h2>

                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">
                      Sous-total
                    </span>

                    <span className="font-medium">
                      {total.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">
                      Livraison
                    </span>

                    <span className="text-emerald-400">
                      À définir
                    </span>
                  </div>
                </div>

                <div className="my-6 h-px bg-white/10" />

                <div className="flex items-end justify-between">
                  <span className="font-semibold">
                    Total
                  </span>

                  <span className="text-2xl font-black">
                    {total.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>

                <Link
                  href="/commande"
                  className="mt-6 flex h-13 w-full items-center justify-center rounded-xl bg-white px-6 text-sm font-bold text-black transition hover:bg-blue-400"
                >
                  Passer la commande
                </Link>

                <Link
                  href="/boutique"
                  className="mt-3 flex h-12 w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
                >
                  Continuer mes achats
                </Link>

                <div className="mt-6 border-t border-white/5 pt-5">
                  <p className="text-center text-xs leading-5 text-zinc-600">
                    Le paiement sera effectué de manière
                    sécurisée lors de la validation de votre
                    commande.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>

      {/* FOOTER */}
     <Footer />
    </main>
  );
}
