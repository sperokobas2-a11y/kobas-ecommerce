import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Zap,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import AddToCartButton from "@/components/add-to-cart-button";
export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
    include: {
      category: true,
    },
  });

  if (!product || !product.active) {
    notFound();
  }

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

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-400 transition hover:text-white"
            >
              Accueil
            </Link>

            <Link
              href="/boutique"
              className="text-sm font-medium text-white"
            >
              Boutique
            </Link>

            <Link
              href="/categories"
              className="text-sm font-medium text-zinc-400 transition hover:text-white"
            >
              Catégories
            </Link>

            <Link
              href="/a-propos"
              className="text-sm font-medium text-zinc-400 transition hover:text-white"
            >
              À propos
            </Link>
          </nav>

          <Link
            href="/panier"
            aria-label="Panier"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            <ShoppingCart className="h-4 w-4" />

            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-bold">
              0
            </span>
          </Link>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="border-b border-white/5">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-5 py-5 text-xs text-zinc-500 lg:px-8">
          <Link
            href="/"
            className="transition hover:text-white"
          >
            Accueil
          </Link>

          <ChevronRight className="h-3 w-3" />

          <Link
            href="/boutique"
            className="transition hover:text-white"
          >
            Boutique
          </Link>

          <ChevronRight className="h-3 w-3" />

          <span className="truncate text-zinc-300">
            {product.name}
          </span>
        </div>
      </div>

      {/* PRODUIT */}
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-20">
        <Link
          href="/boutique"
          className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la boutique
        </Link>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* IMAGE / VISUEL */}
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900 to-blue-950/40">
  {product.images?.[0] ? (
    <img
      src={product.images[0]}
      alt={product.name}
      className="h-full w-full object-cover"
    />
  ) : (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative flex h-40 w-40 items-center justify-center rounded-[40px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-0 rounded-[40px] bg-blue-500/10 blur-2xl" />

        <Zap className="relative h-16 w-16 text-blue-400" />
      </div>
    </div>
  )}

  {product.featured && (
    <span className="absolute left-6 top-6 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-blue-300">
      PRODUIT POPULAIRE
    </span>
  )}
</div>

          {/* INFORMATIONS */}
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
              {product.category.name}
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              {product.name}
            </h1>

            {/* PRIX */}
            <div className="mt-6 flex flex-wrap items-end gap-4">
              <p className="text-3xl font-bold">
                {product.price.toLocaleString("fr-FR")} FCFA
              </p>

              {product.comparePrice && (
                <p className="text-base text-zinc-600 line-through">
                  {product.comparePrice.toLocaleString("fr-FR")} FCFA
                </p>
              )}
            </div>

            <div className="mt-8 h-px bg-white/10" />

            {/* DESCRIPTION */}
            <p className="mt-8 text-base leading-7 text-zinc-400">
              {product.description}
            </p>

            {/* STOCK */}
            <div className="mt-8 flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  product.stock > 0
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {product.stock > 0 ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
              </div>

              <div>
                <p className="text-sm font-semibold">
                  {product.stock > 0
                    ? "Produit disponible"
                    : "Rupture de stock"}
                </p>

                {product.stock > 0 && (
                  <p className="text-xs text-zinc-500">
                    {product.stock} exemplaire
                    {product.stock > 1 ? "s" : ""} disponible
                    {product.stock > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>

            {/* QUANTITÉ */}
            <div className="mt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Quantité
              </p>

              <div className="flex h-12 w-fit items-center rounded-xl border border-white/10 bg-white/[0.03]">
                <button
                  type="button"
                  className="flex h-full w-12 items-center justify-center text-zinc-400 transition hover:text-white"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="w-10 text-center text-sm font-semibold">
                  1
                </span>

                <button
                  type="button"
                  className="flex h-full w-12 items-center justify-center text-zinc-400 transition hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  stock: product.stock,
                }}
              />

              <button
                type="button"
                disabled={product.stock <= 0}
                className="flex h-13 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Acheter maintenant

                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* GARANTIES */}
            <div className="mt-10 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2">
              <div className="flex gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />

                <div>
                  <p className="text-sm font-semibold">
                    Paiement sécurisé
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Transactions sécurisées.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Zap className="h-5 w-5 shrink-0 text-blue-400" />

                <div>
                  <p className="text-sm font-semibold">
                    Livraison rapide
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Traitement rapide de votre commande.
                  </p>
                </div>
              </div>
            </div>

            {/* REFERENCE */}
            <p className="mt-8 text-xs text-zinc-600">
              Référence produit : {product.sku}
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <span className="font-semibold text-white">
              KOBAS TECH
            </span>

            <span className="mx-2">•</span>

            Technologie. Simplicité. Confiance.
          </div>

          <p>
            © {new Date().getFullYear()} Kobas Tech.
          </p>
        </div>
      </footer>
    </main>
  );
}
