import Link from "next/link";
import { Package, Search, ShoppingCart, Zap } from "lucide-react";

import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";

type RecherchePageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function RecherchePage({
  searchParams,
}: RecherchePageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const products = query
    ? await prisma.product.findMany({
        where: {
          active: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : [];

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <Header />

      {/* RECHERCHE */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
            Kobas Tech Store
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Rechercher un produit
          </h1>

          <form action="/recherche" method="GET" className="mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

              <input
                type="search"
                name="q"
                defaultValue={query}
                autoFocus
                placeholder="Nom du produit, référence, mot-clé..."
                className="h-13 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-28 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500/50"
              />

              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-black transition hover:bg-blue-400"
              >
                Rechercher
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* RÉSULTATS */}
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        {!query ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-16 text-center">
            <Search className="mx-auto h-12 w-12 text-zinc-600" />

            <h2 className="mt-5 text-xl font-semibold">
              Que recherchez-vous ?
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Tapez un mot-clé ci-dessus pour trouver un produit.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-zinc-500">
              <span className="font-semibold text-white">
                {products.length}
              </span>{" "}
              résultat{products.length !== 1 ? "s" : ""} pour «{" "}
              <span className="text-white">{query}</span> »
            </p>

            {products.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-16 text-center">
                <Package className="mx-auto h-12 w-12 text-zinc-600" />

                <h2 className="mt-5 text-xl font-semibold">
                  Aucun résultat trouvé
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                  Essayez avec un autre mot-clé, ou parcourez notre{" "}
                  <Link
                    href="/boutique"
                    className="text-blue-400 hover:underline"
                  >
                    boutique complète
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025] transition duration-300 hover:-translate-y-1 hover:border-white/15"
                  >
                    <Link href={`/produit/${product.slug}`}>
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-blue-950/40">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-blue-400 backdrop-blur-xl transition duration-500 group-hover:scale-110">
                            <Zap className="h-9 w-9" />
                          </div>
                        </div>

                        {product.featured && (
                          <span className="absolute left-4 top-4 rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-blue-300">
                            POPULAIRE
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="p-5">
                      <p className="text-xs font-medium text-blue-400">
                        {product.category.name}
                      </p>

                      <Link href={`/produit/${product.slug}`}>
                        <h2 className="mt-2 line-clamp-2 min-h-12 text-lg font-semibold transition hover:text-blue-400">
                          {product.name}
                        </h2>
                      </Link>

                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">
                        {product.description}
                      </p>

                      <div className="mt-5 flex items-end justify-between gap-3">
                        <div>
                          {product.comparePrice && (
                            <p className="text-xs text-zinc-600 line-through">
                              {product.comparePrice.toLocaleString("fr-FR")}{" "}
                              FCFA
                            </p>
                          )}

                          <p className="text-xl font-bold">
                            {product.price.toLocaleString("fr-FR")} FCFA
                          </p>
                        </div>

                        <button
                          type="button"
                          aria-label={`Ajouter ${product.name} au panier`}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black transition hover:bg-blue-400"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <span className="font-semibold text-white">KOBAS TECH</span>
            <span className="mx-2">•</span>
            Technologie. Simplicité. Confiance.
          </div>

          <p>© {new Date().getFullYear()} Kobas Tech.</p>
        </div>
      </footer>
    </main>
  );
}