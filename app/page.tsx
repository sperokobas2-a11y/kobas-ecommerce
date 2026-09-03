import Footer from "@/components/Footer";
import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/Header";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Gamepad2,
  Laptop,
  MonitorSmartphone,
  Package,
  ShieldCheck,
  Smartphone,
  ShoppingCart,
  Sparkles,
  Zap,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const baseUrl = "https://kobas-ecommerce.vercel.app";

export const metadata: Metadata = {
  title: "Kobas Tech | Technologie, produits numériques et solutions tech",
  description:
    "Kobas Tech vous propose des produits numériques, logiciels, solutions informatiques, jeux et services technologiques au Bénin.",
  keywords: [
    "Kobas Tech",
    "technologie Bénin",
    "boutique informatique Bénin",
    "produits numériques",
    "logiciels",
    "gaming",
    "jeux vidéo",
    "smartphones",
    "informatique",
    "solutions technologiques",
    "boutique en ligne Bénin",
  ],
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: "Kobas Tech | Technologie, produits numériques et solutions tech",
    description:
      "Découvrez les produits numériques, logiciels, solutions informatiques et produits technologiques proposés par Kobas Tech.",
    url: baseUrl,
    siteName: "Kobas Tech",
    locale: "fr_BJ",
    type: "website",
    images: [
      {
        url: baseUrl + "/logo.png",
        width: 1200,
        height: 630,
        alt: "Kobas Tech",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kobas Tech | Technologie, produits numériques et solutions tech",
    description:
      "Découvrez les produits numériques, logiciels et solutions technologiques de Kobas Tech.",
    images: [baseUrl + "/logo.png"],
  },
};

const categories = [
  {
    name: "Gaming",
    description: "Jeux, accessoires et expériences gaming",
    icon: Gamepad2,
  },
  {
    name: "Logiciels",
    description: "Les outils pour travailler et créer",
    icon: Laptop,
  },
  {
    name: "Informatique",
    description: "Équipements et solutions informatiques",
    icon: MonitorSmartphone,
  },
  {
    name: "Téléphones",
    description: "Smartphones et accessoires",
    icon: Smartphone,
  },
];

export default async function Home() {
  const products = await prisma.product.findMany({
    where: {
      active: true,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
  });

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Kobas Tech",
    url: baseUrl,
    logo: baseUrl + "/logo.png",
    description:
      "Kobas Tech propose des produits numériques, logiciels, solutions informatiques et services technologiques.",
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kobas Tech",
    url: baseUrl,
    description:
      "Boutique en ligne de produits numériques et technologiques au Bénin.",
    inLanguage: "fr-BJ",
  };

  const productListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Produits populaires Kobas Tech",
    url: baseUrl + "/boutique",
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
          __html: JSON.stringify(organizationJsonLd),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productListJsonLd),
        }}
      />

      <main className="min-h-screen bg-[#08090d] text-white">
        {/* NAVBAR */}
        <Header />

        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

          <div className="absolute right-0 top-20 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[120px]" />

          <div className="relative mx-auto grid min-h-[640px] max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8">
            {/* HERO CONTENT */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-3 py-1.5 text-xs font-medium text-blue-300">
                <Sparkles className="h-3.5 w-3.5" />
                L&apos;univers tech à portée de main
              </div>

              <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                La technologie.
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-500 bg-clip-text text-transparent">
                  Sans compromis.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">
                Découvrez les produits, logiciels et solutions numériques
                sélectionnés par Kobas Tech pour vous accompagner au quotidien.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/boutique"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-black transition hover:bg-zinc-200"
                >
                  Explorer la boutique
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/categories"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Voir les catégories
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-6 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Paiement sécurisé
                </div>

                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-400" />
                  Livraison rapide
                </div>

                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-violet-400" />
                  Support client
                </div>
              </div>
            </div>

            {/* HERO VISUAL */}
            <div className="relative hidden lg:block">
              <div className="relative mx-auto aspect-square max-w-[520px]">
                <div className="absolute inset-10 rounded-[40px] bg-gradient-to-br from-blue-500/20 to-violet-600/20 blur-2xl" />

                <div className="absolute inset-12 flex items-center justify-center rounded-[40px] border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02] shadow-2xl backdrop-blur-xl">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative flex h-64 w-full items-center justify-center">
                      <Image
                        src="/logo.png"
                        alt="Kobas Tech"
                        width={420}
                        height={220}
                        className="h-auto max-h-56 w-auto max-w-[90%] object-contain drop-shadow-2xl"
                        priority
                      />
                    </div>

                    <div className="mx-auto mt-4 h-px w-32 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />

                    <p className="mt-5 text-sm text-zinc-300">
                      Technology. Simplicity. Trust.
                    </p>
                  </div>
                </div>

                <div className="absolute left-0 top-20 rounded-2xl border border-white/10 bg-zinc-900/80 p-4 shadow-xl backdrop-blur-xl">
                  <Gamepad2 className="h-6 w-6 text-blue-400" />
                </div>

                <div className="absolute bottom-24 right-0 rounded-2xl border border-white/10 bg-zinc-900/80 p-4 shadow-xl backdrop-blur-xl">
                  <Laptop className="h-6 w-6 text-violet-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="border-y border-white/5 bg-white/[0.015]">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
                  Explorer
                </p>

                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Nos catégories
                </h2>
              </div>

              <Link
                href="/categories"
                className="hidden items-center gap-1 text-sm font-medium text-zinc-300 transition hover:text-white sm:flex"
              >
                Tout voir
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => {
                const Icon = category.icon;

                return (
                  <Link
                    key={category.name}
                    href="/boutique"
                    className="group rounded-2xl border border-white/8 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-white/[0.05]"
                  >
                    <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition group-hover:bg-blue-500/15">
                      <Icon className="h-6 w-6" />
                    </div>

                    <h3 className="font-semibold">{category.name}</h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-300">
                      {category.description}
                    </p>

                    <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-zinc-300 transition group-hover:text-blue-400">
                      Découvrir
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* PRODUCTS */}
        <section>
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
                  Sélection Kobas
                </p>

                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Produits populaires
                </h2>
              </div>

              <Link
                href="/boutique"
                className="hidden items-center gap-1 text-sm font-medium text-zinc-300 transition hover:text-white sm:flex"
              >
                Voir la boutique
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-12 text-center">
                <Package className="mx-auto h-10 w-10 text-zinc-400" />

                <h3 className="mt-4 text-lg font-semibold">
                  Aucun produit disponible
                </h3>

                <p className="mt-2 text-sm text-zinc-300">
                  Les produits disponibles apparaîtront ici.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025] transition duration-300 hover:-translate-y-1 hover:border-white/15"
                  >
                    <Link href={"/produit/" + product.slug}>
                      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-blue-950/40">
  {product.images?.[0] ? (
    <Image
      src={product.images[0]}
      alt={`Image du ${product.name}`}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="object-contain p-2 transition duration-500 group-hover:scale-105"
      priority={product.featured}
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
                    <div className="p-5">
                      <p className="text-xs font-medium text-blue-400">
                        {product.category.name}
                      </p>

                      <Link href={"/produit/" + product.slug}>
                        <h3 className="mt-2 text-lg font-semibold transition hover:text-blue-400">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="mt-5 flex items-end justify-between">
                        <div>
                          {product.comparePrice && (
                            <p className="text-xs text-zinc-400 line-through">
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
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black transition hover:bg-blue-400"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* TRUST */}
        <section className="border-t border-white/5 bg-white/[0.015]">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
            {[
              {
                icon: ShieldCheck,
                title: "Paiement sécurisé",
                text: "Vos transactions sont protégées.",
              },
              {
                icon: Zap,
                title: "Service rapide",
                text: "Nous traitons vos commandes rapidement.",
              },
              {
                icon: Package,
                title: "Produits vérifiés",
                text: "Une sélection pensée pour vous.",
              },
              {
                icon: Sparkles,
                title: "Support client",
                text: "Une équipe disponible pour vous aider.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-blue-400">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">{item.title}</h3>

                    <p className="mt-1 text-xs leading-5 text-zinc-300">
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FOOTER */}
        <Footer />
      </main>
    </>
  );
}
