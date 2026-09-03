"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Heart, Loader2, ShoppingCart, Zap } from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FavoriteButton from "@/components/favorite-button";

type FavoriteProduct = {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice: number | null;
    images: string[];
    stock: number;
    category: {
      name: string;
    };
  };
};

export default function FavorisPage() {
  const router = useRouter();
  const { status } = useSession();

  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/connexion");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;

    async function loadFavorites() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/favorites", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Impossible de charger les favoris."
          );
        }

        if (cancelled) return;

        setFavorites(data.favorites || []);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Une erreur est survenue."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-[#08090d] text-white">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
          Kobas Tech
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-tight">
          Mes favoris
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          {favorites.length} produit{favorites.length !== 1 ? "s" : ""}{" "}
          enregistré{favorites.length !== 1 ? "s" : ""}
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-400">
              <Heart className="h-9 w-9" />
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              Aucun favori pour le moment
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
              Parcourez la boutique et cliquez sur le cœur d&apos;un produit
              pour l&apos;ajouter ici.
            </p>

            <Link
              href="/boutique"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-black transition hover:bg-zinc-200"
            >
              Découvrir la boutique
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((favorite) => (
              <article
                key={favorite.id}
                className="group overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025] transition duration-300 hover:-translate-y-1 hover:border-white/15"
              >
                <div className="relative">
                  <Link href={`/produit/${favorite.product.slug}`}>
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-blue-950/40">
                      {favorite.product.images?.[0] ? (
                        <img
                          src={favorite.product.images[0]}
                          alt={favorite.product.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-blue-400 backdrop-blur-xl">
                            <Zap className="h-9 w-9" />
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="absolute right-3 top-3">
                    <FavoriteButton productId={favorite.product.id} />
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs font-medium text-blue-400">
                    {favorite.product.category.name}
                  </p>

                  <Link href={`/produit/${favorite.product.slug}`}>
                    <h2 className="mt-2 line-clamp-2 min-h-12 text-lg font-semibold transition hover:text-blue-400">
                      {favorite.product.name}
                    </h2>
                  </Link>

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      {favorite.product.comparePrice && (
                        <p className="text-xs text-zinc-600 line-through">
                          {favorite.product.comparePrice.toLocaleString(
                            "fr-FR"
                          )}{" "}
                          FCFA
                        </p>
                      )}

                      <p className="text-xl font-bold">
                        {favorite.product.price.toLocaleString("fr-FR")}{" "}
                        FCFA
                      </p>
                    </div>

                    <Link
                      href={`/produit/${favorite.product.slug}`}
                      aria-label={`Voir ${favorite.product.name}`}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black transition hover:bg-blue-400"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
