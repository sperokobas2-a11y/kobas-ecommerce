import FavoriteButton from "@/components/favorite-button";
import ProductReviews from "@/components/product-reviews";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import Image from "next/image";
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
import BuyNowButton from "@/components/buy-now-button";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      images: true,
      active: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!product || !product.active) {
    return {
      title: "Produit introuvable | Kobas Tech",
      description: "Ce produit n'est plus disponible sur Kobas Tech.",
    };
  }

  const baseUrl = "https://kobas-ecommerce.vercel.app";
  const productUrl = baseUrl + "/produit/" + slug;

  const description =
    product.description.length > 160
      ? product.description.slice(0, 157) + "..."
      : product.description;

  return {
    title: product.name + " | Kobas Tech",

    description,

    keywords: [
      product.name,
      "Kobas Tech",
      product.category.name,
      "technologie",
      "produit numérique",
      "Bénin",
    ],

    alternates: {
      canonical: productUrl,
    },

    openGraph: {
      title: product.name + " | Kobas Tech",
      description,
      url: productUrl,
      siteName: "Kobas Tech",
      locale: "fr_BJ",
      type: "website",

      images: product.images?.[0]
        ? [
            {
              url: product.images[0],
              width: 1200,
              height: 1200,
              alt: product.name,
            },
          ]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title: product.name + " | Kobas Tech",
      description,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

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

  const productUrl =
    "https://kobas-ecommerce.vercel.app/produit/" + product.slug;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",

    name: product.name,

    description: product.description,

    image: product.images,

    sku: product.sku || product.id,

    brand: {
      "@type": "Brand",
      name: "Kobas Tech",
    },

    category: product.category.name,

    offers: {
      "@type": "Offer",

      url: productUrl,

      priceCurrency: "XOF",

      price: product.price,

      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",

      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />

      <main className="min-h-screen bg-zinc-950 text-white">
        {/* HEADER */}
        <header className="border-b border-white/10 bg-zinc-950/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight"
            >
              Kobas <span className="text-primary">Tech</span>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href="/"
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Accueil
              </Link>

              <Link
                href="/boutique"
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Boutique
              </Link>

              <Link
                href="/categories"
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Catégories
              </Link>

              <Link
                href="/a-propos"
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                À propos
              </Link>

              <Link
                href="/contact"
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Contact
              </Link>
            </nav>

            <Link
              href="/boutique"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 transition-colors hover:bg-zinc-800"
              aria-label="Voir la boutique"
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </div>
        </header>

        {/* CONTENU */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* BREADCRUMB */}
          <div className="mb-8 flex items-center gap-2 text-sm text-zinc-400">
            <Link
              href="/boutique"
              className="transition-colors hover:text-white"
            >
              Boutique
            </Link>

            <ChevronRight className="h-4 w-4" />

            <Link
              href={"/boutique?categorie=" + product.category.slug}
              className="transition-colors hover:text-white"
            >
              {product.category.name}
            </Link>

            <ChevronRight className="h-4 w-4" />

            <span className="truncate text-white">
              {product.name}
            </span>
          </div>

          {/* RETOUR */}
          <Link
            href="/boutique"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la boutique
          </Link>

          {/* PRODUIT */}
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {/* IMAGE */}
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Package className="h-24 w-24 text-zinc-500" />
                </div>
              )}
            </div>

            {/* INFORMATIONS */}
            <div className="flex flex-col">
              {/* CATÉGORIE */}
              <Link
                href={"/boutique?categorie=" + product.category.slug}
                className="mb-3 w-fit text-sm font-semibold uppercase tracking-wider text-primary"
              >
                {product.category.name}
              </Link>

              {/* NOM */}
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {product.name}
              </h1>

              {/* PRIX */}
              <div className="mt-6 flex items-center gap-3">
                <span className="text-3xl font-bold">
                  {product.price.toLocaleString("fr-FR")} FCFA
                </span>

                {product.comparePrice &&
                  product.comparePrice > product.price && (
                    <span className="text-lg text-zinc-400 line-through">
                      {product.comparePrice.toLocaleString("fr-FR")} FCFA
                    </span>
                  )}
              </div>

              {/* DESCRIPTION */}
              <div className="mt-8">
                <h2 className="mb-3 text-lg font-semibold">
                  Description
                </h2>

                <p className="whitespace-pre-line leading-7 text-zinc-400">
                  {product.description}
                </p>
              </div>

              {/* STOCK */}
              <div className="mt-8 flex items-center gap-2">
                {product.stock > 0 ? (
                  <>
                    <Check className="h-5 w-5 text-green-500" />

                    <span className="text-sm font-medium text-green-500">
                      En stock
                    </span>

                    {product.stock <= 5 && (
                      <span className="text-sm text-zinc-400">
                        — Plus que {product.stock} disponible
                        {product.stock > 1 ? "s" : ""}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />

                    <span className="text-sm font-medium text-red-500">
                      Rupture de stock
                    </span>
                  </>
                )}
              </div>

              {/* QUANTITÉ */}
              <div className="mt-8">
                <p className="mb-3 text-sm font-medium">
                  Quantité
                </p>

                <div className="flex h-12 w-fit items-center rounded-xl border border-white/10">
                  <button
                    type="button"
                    className="flex h-full w-12 items-center justify-center transition-colors hover:bg-zinc-800"
                    aria-label="Diminuer la quantité"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <span className="flex w-12 justify-center font-medium">
                    1
                  </span>

                  <button
                    type="button"
                    className="flex h-full w-12 items-center justify-center transition-colors hover:bg-zinc-800"
                    aria-label="Augmenter la quantité"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <AddToCartButton product={product} />

                <BuyNowButton product={product} />
              </div>

              <div className="mt-3">
                <FavoriteButton
                  productId={product.id}
                  variant="full"
                />
              </div>

              {/* GARANTIES */}
              <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-zinc-900/50 p-5 sm:grid-cols-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                  <div>
                    <p className="text-sm font-semibold">
                      Paiement sécurisé
                    </p>

                    <p className="mt-1 text-xs text-zinc-400">
                      Transactions protégées
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Zap className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                  <div>
                    <p className="text-sm font-semibold">
                      Livraison rapide
                    </p>

                    <p className="mt-1 text-xs text-zinc-400">
                      Accès rapide à votre achat
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Package className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                  <div>
                    <p className="text-sm font-semibold">
                      Support Kobas Tech
                    </p>

                    <p className="mt-1 text-xs text-zinc-400">
                      Assistance disponible
                    </p>
                  </div>
                </div>
              </div>

              {/* RÉFÉRENCE */}
              {product.sku && (
                <p className="mt-6 text-xs text-zinc-400">
                  Référence : {product.sku}
                </p>
              )}
            </div>
          </div>

          <ProductReviews productId={product.id} />
        </div>

        {/* FOOTER */}
        <Footer />
      </main>
    </>
  );
}
