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

      <main className="min-h-screen bg-background">
        {/* HEADER */}
        <header className="border-b border-border/50 bg-background/95 backdrop-blur">
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
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Accueil
              </Link>

              <Link
                href="/boutique"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Boutique
              </Link>

              <Link
                href="/categories"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Catégories
              </Link>

              <Link
                href="/a-propos"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                À propos
              </Link>

              <Link
                href="/contact"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Contact
              </Link>
            </nav>

            <Link
              href="/boutique"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted"
              aria-label="Voir la boutique"
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </div>
        </header>

        {/* CONTENU */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* BREADCRUMB */}
          <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href="/boutique"
              className="transition-colors hover:text-foreground"
            >
              Boutique
            </Link>

            <ChevronRight className="h-4 w-4" />

            <Link
              href={
                "/boutique?categorie=" + product.category.slug
              }
              className="transition-colors hover:text-foreground"
            >
              {product.category.name}
            </Link>

            <ChevronRight className="h-4 w-4" />

            <span className="truncate text-foreground">
              {product.name}
            </span>
          </div>

          {/* RETOUR */}
          <Link
            href="/boutique"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la boutique
          </Link>

          {/* PRODUIT */}
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {/* IMAGE */}
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-border/50 bg-muted">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Package className="h-24 w-24 text-muted-foreground/40" />
                </div>
              )}
            </div>

            {/* INFORMATIONS */}
            <div className="flex flex-col">
              {/* CATÉGORIE */}
              <Link
                href={
                  "/boutique?categorie=" + product.category.slug
                }
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
                    <span className="text-lg text-muted-foreground line-through">
                      {product.comparePrice.toLocaleString(
                        "fr-FR"
                      )}{" "}
                      FCFA
                    </span>
                  )}
              </div>

              {/* DESCRIPTION */}
              <div className="mt-8">
                <h2 className="mb-3 text-lg font-semibold">
                  Description
                </h2>

                <p className="whitespace-pre-line leading-7 text-muted-foreground">
                  {product.description}
                </p>
              </div>

              {/* STOCK */}
              <div className="mt-8 flex items-center gap-2">
                {product.stock > 0 ? (
                  <>
                    <Check className="h-5 w-5 text-green-600" />

                    <span className="text-sm font-medium text-green-600">
                      En stock
                    </span>

                    {product.stock <= 5 && (
                      <span className="text-sm text-muted-foreground">
                        — Plus que {product.stock} disponible
                        {product.stock > 1 ? "s" : ""}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />

                    <span className="text-sm font-medium text-red-600">
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

                <div className="flex h-12 w-fit items-center rounded-xl border border-border">
                  <button
                    type="button"
                    className="flex h-full w-12 items-center justify-center transition-colors hover:bg-muted"
                    aria-label="Diminuer la quantité"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <span className="flex w-12 justify-center font-medium">
                    1
                  </span>

                  <button
                    type="button"
                    className="flex h-full w-12 items-center justify-center transition-colors hover:bg-muted"
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

              {/* GARANTIES */}
              <div className="mt-8 grid gap-4 rounded-2xl border border-border/50 bg-muted/30 p-5 sm:grid-cols-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                  <div>
                    <p className="text-sm font-semibold">
                      Paiement sécurisé
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
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

                    <p className="mt-1 text-xs text-muted-foreground">
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

                    <p className="mt-1 text-xs text-muted-foreground">
                      Assistance disponible
                    </p>
                  </div>
                </div>
              </div>

              {/* RÉFÉRENCE */}
              {product.sku && (
                <p className="mt-6 text-xs text-muted-foreground">
                  Référence : {product.sku}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-20 border-t border-border/50">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <p>
              © {new Date().getFullYear()} Kobas Tech. Tous
              droits réservés.
            </p>

            <div className="flex gap-5">
              <Link
                href="/a-propos"
                className="transition-colors hover:text-foreground"
              >
                À propos
              </Link>

              <Link
                href="/contact"
                className="transition-colors hover:text-foreground"
              >
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
