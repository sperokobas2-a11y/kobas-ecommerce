import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Package,
  Search,
  ShoppingCart,
  Zap,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";

export const dynamic = "force-dynamic";

type BoutiquePageProps = {
  searchParams: Promise<{ categorie?: string }>;
};

const baseUrl = "https://kobas-ecommerce.vercel.app";

export async function generateMetadata({
  searchParams,
}: BoutiquePageProps): Promise<Metadata> {
  const { categorie } = await searchParams;

  if (categorie) {
    const category = await prisma.category.findUnique({
      where: {
        slug: categorie,
      },
      select: {
        name: true,
        description: true,
      },
    });

    if (category) {
      const description =
        category.description ||
        "Découvrez les produits de la catégorie " +
          category.name +
          " sur Kobas Tech.";

      const categoryUrl =
        baseUrl + "/boutique?categorie=" + category.slug;

      return {
        title: category.name + " | Kobas Tech",
        description,
        keywords: [
          category.name,
          "Kobas Tech",
          "boutique",
          "produits numériques",
          "technologie",
          "Bénin",
        ],
        alternates: {
          canonical: categoryUrl,
        },
        openGraph: {
          title: category.name + " | Kobas Tech",
          description,
          url: categoryUrl,
          siteName: "Kobas Tech",
          locale: "fr_BJ",
          type: "website",
        },
        twitter: {
          card: "summary",
          title: category.name + " | Kobas Tech",
          description,
        },
      };
    }
  }

  return {
    title: "Boutique | Kobas Tech",
    description:
      "Découvrez la boutique Kobas Tech et notre sélection de produits numériques et technologiques au Bénin.",
    keywords: [
      "Kobas Tech",
      "boutique",
      "produits numériques",
      "technologie",
      "Bénin",
      "produits technologiques",
    ],
    alternates: {
      canonical: baseUrl + "/boutique",
    },
    openGraph: {
      title: "Boutique | Kobas Tech",
      description:
        "Découvrez notre sélection de produits numériques et technologiques.",
      url: baseUrl + "/boutique",
      siteName: "Kobas Tech",
      locale: "fr_BJ",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Boutique | Kobas Tech",
      description:
        "Découvrez notre sélection de produits numériques et technologiques.",
    },
  };
}

export default async function BoutiquePage({
  searchParams,
}: BoutiquePageProps) {
  const { categorie } = await searchParams;

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const activeCategory = categorie
    ? categories.find((c) => c.slug === categorie)
    : null;

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(activeCategory ? { categoryId: activeCategory.id } : {}),
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const boutiqueUrl = activeCategory
    ? baseUrl + "/boutique?categorie=" + activeCategory.slug
    : baseUrl + "/boutique";

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: activeCategory
      ? activeCategory.name + " | Kobas Tech"
      : "Boutique Kobas Tech",
    url: boutiqueUrl,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: baseUrl + "/produit/" + product.slug,
      name: product.name,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd),
        }}
      />

      <main className="min-h-screen bg-[#08090d] text-white">
        <Header />

        {/* HERO */}
        <section className="border-b border-white/5">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
              Kobas Tech Store
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              {activeCategory ? activeCategory.name : "Notre boutique"}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              {activeCategory?.description ||
                "Découvrez notre sélection de produits numériques et technologiques."}
            </p>
          </div>
        </section>

        {/* CONTENU */}
        <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          {/* BARRE DE RECHERCHE + TRI */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

              <input
                type="search"
                placeholder="Rechercher un produit..."
                className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500/50"
              />
            </div>

            <button
              type="button"
              className="flex h-12 items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-zinc-300 lg:w-48"
            >
              Plus récents
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            </button>
          </div>

          {/* CATEGORIES */}
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
            <Link
              href="/boutique"
              className={
                "whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition " +
                (!activeCategory
                  ? "bg-white text-black"
                  : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/10 hover:text-white")
              }
            >
              Tous les produits
            </Link>

            {categories.map((category) => {
              const isActive = activeCategory?.id === category.id;

              return (
                <Link
                  key={category.id}
                  href={"/boutique?categorie=" + category.slug}
                  className={
                    "whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition " +
                    (isActive
                      ? "bg-white font-semibold text-black"
                      : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/10 hover:text-white")
                  }
                >
                  {category.name}
                </Link>
              );
            })}
          </div>

          {/* COMPTEUR */}
          <div className="mt-10 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              <span className="font-semibold text-white">
                {products.length}
              </span>{" "}
              produit{products.length > 1 ? "s" : ""}
              {activeCategory
                ? " dans « " + activeCategory.name + " »"
                : ""}
            </p>

            {activeCategory && (
              <Link
                href="/boutique"
                className="text-xs font-medium text-zinc-500 transition hover:text-white"
              >
                Réinitialiser le filtre
              </Link>
            )}
          </div>

          {/* PRODUITS */}
          {products.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-16 text-center">
              <Package className="mx-auto h-12 w-12 text-zinc-600" />

              <h2 className="mt-5 text-xl font-semibold">
                Aucun produit disponible
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                {activeCategory
                  ? "Aucun produit dans cette catégorie pour le moment."
                  : "Les produits seront affichés ici dès qu'ils seront disponibles."}
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025] transition duration-300 hover:-translate-y-1 hover:border-white/15"
                >
                  {/* IMAGE */}
                  <Link href={"/produit/" + product.slug}>
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-blue-950/40">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-blue-400 backdrop-blur-xl transition duration-500 group-hover:scale-110">
                            <Zap className="h-9 w-9" />
                          </div>
                        </div>
                      )}

                      {product.featured && (
                        <span className="absolute left-4 top-4 rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-blue-300">
                          POPULAIRE
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* INFORMATIONS */}
                  <div className="p-5">
                    <p className="text-xs font-medium text-blue-400">
                      {product.category.name}
                    </p>

                    <Link href={"/produit/" + product.slug}>
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
                            {product.comparePrice.toLocaleString("fr-FR")} FCFA
                          </p>
                        )}

                        <p className="text-xl font-bold">
                          {product.price.toLocaleString("fr-FR")} FCFA
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-label={"Ajouter " + product.name + " au panier"}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black transition hover:bg-blue-400"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>

                    {/* STOCK */}
                    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4 text-[11px]">
                      <span className="text-zinc-600">
                        Réf. {product.sku}
                      </span>

                      <span
                        className={
                          product.stock > 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      >
                        {product.stock > 0
                          ? product.stock + " en stock"
                          : "Rupture de stock"}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 rounded-3xl border border-blue-500/10 bg-gradient-to-r from-blue-500/5 to-violet-500/5 p-8 text-center sm:p-12">
            <h2 className="text-2xl font-bold">
              Vous ne trouvez pas ce que vous cherchez ?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500">
              Contactez Kobas Tech. Nous pouvons vous aider à trouver la
              solution adaptée à vos besoins.
            </p>

            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
            >
              Nous contacter
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* FOOTER */}
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
    </>
  );
}
