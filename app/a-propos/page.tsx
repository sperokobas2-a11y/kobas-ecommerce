```tsx
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Code2,
  Heart,
  Package,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";

import Header from "@/components/Header";

export const dynamic = "force-dynamic";

const baseUrl = "https://kobas-ecommerce.vercel.app";

export const metadata: Metadata = {
  title: "À propos de Kobas Tech | Solutions technologiques au Bénin",
  description:
    "Découvrez Kobas Tech, votre partenaire des solutions digitales au Bénin : produits numériques, logiciels, développement web et mobile, intelligence artificielle et services technologiques.",
  keywords: [
    "Kobas Tech",
    "à propos Kobas Tech",
    "technologie Bénin",
    "solutions digitales Bénin",
    "entreprise tech Bénin",
    "développement web Bénin",
    "développement mobile Bénin",
    "intelligence artificielle Bénin",
    "produits numériques",
    "logiciels",
    "services technologiques",
  ],
  alternates: {
    canonical: baseUrl + "/a-propos",
  },
  openGraph: {
    title: "À propos de Kobas Tech | Solutions technologiques au Bénin",
    description:
      "Découvrez Kobas Tech et notre mission : simplifier l'accès à la technologie grâce à des produits numériques et des solutions digitales adaptées.",
    url: baseUrl + "/a-propos",
    siteName: "Kobas Tech",
    locale: "fr_BJ",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "À propos de Kobas Tech | Solutions technologiques au Bénin",
    description:
      "Découvrez Kobas Tech, votre partenaire des solutions digitales et technologiques au Bénin.",
  },
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Confiance",
    text: "Des produits vérifiés et des transactions sécurisées, à chaque commande.",
  },
  {
    icon: Zap,
    title: "Rapidité",
    text: "Un service pensé pour vous faire gagner du temps, du choix à la livraison.",
  },
  {
    icon: Heart,
    title: "Proximité",
    text: "Une équipe basée au Bénin, à l'écoute de nos clients au quotidien.",
  },
  {
    icon: Sparkles,
    title: "Innovation",
    text: "Une veille technologique constante pour vous proposer le meilleur.",
  },
];

const STATS = [
  { value: "100%", label: "Paiements sécurisés" },
  { value: "24/7", label: "Boutique en ligne" },
  { value: "Bénin", label: "Basés localement" },
];

export default function AProposPage() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Kobas Tech",
    url: baseUrl,
    description:
      "Kobas Tech est un partenaire des solutions digitales proposant des produits numériques, logiciels, accessoires et services technologiques au Bénin.",
    areaServed: {
      "@type": "Country",
      name: "Bénin",
    },
    knowsAbout: [
      "Technologie",
      "Produits numériques",
      "Logiciels",
      "Développement web",
      "Développement mobile",
      "Intelligence artificielle",
    ],
  };

  const aboutPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "À propos de Kobas Tech",
    url: baseUrl + "/a-propos",
    description:
      "Découvrez Kobas Tech, sa mission, ses valeurs et ses solutions technologiques au Bénin.",
    mainEntity: {
      "@type": "Organization",
      name: "Kobas Tech",
      url: baseUrl,
    },
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
          __html: JSON.stringify(aboutPageJsonLd),
        }}
      />

      <main className="min-h-screen bg-[#08090d] text-white">
        <Header />

        {/* HERO */}
        <section className="relative overflow-hidden border-b border-white/5">
          <div className="absolute left-1/2 top-0 h-100 w-100 -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

          <div className="relative mx-auto max-w-4xl px-5 py-20 text-center lg:px-8">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-3 py-1.5 text-xs font-medium text-blue-300">
              <Sparkles className="h-3.5 w-3.5" />
              À propos de nous
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              L&apos;innovation technologique,
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-500 bg-clip-text text-transparent">
                pensée pour le Bénin.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              Kobas Tech est votre partenaire des solutions digitales :
              produits numériques, logiciels, accessoires et services
              technologiques réunis dans une boutique pensée pour vous.
            </p>
          </div>
        </section>

        {/* NOTRE HISTOIRE */}
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
                Notre histoire
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Née d&apos;une passion pour la tech
              </h2>

              <p className="mt-5 text-sm leading-7 text-zinc-400 sm:text-base">
                Kobas Tech est née d&apos;une conviction simple : l&apos;accès
                à la technologie ne devrait jamais être compliqué. Nous avons
                construit une plateforme qui rassemble produits numériques,
                logiciels, accessoires et services technologiques, pensée pour
                répondre aux besoins réels de nos clients.
              </p>

              <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
                Aujourd&apos;hui, notre mission reste la même : simplifier
                votre accès à la technologie, avec un service fiable, rapide
                et à votre écoute.
              </p>

              <Link
                href="/boutique"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-black transition hover:bg-zinc-200"
              >
                Découvrir la boutique
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-6 rounded-[40px] bg-gradient-to-br from-blue-500/20 to-violet-600/20 blur-2xl" />

              <div className="relative flex aspect-square items-center justify-center rounded-[40px] border border-white/10 bg-gradient-to-br from-white/10 to-white/2 shadow-2xl backdrop-blur-xl">
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-2xl shadow-blue-500/30">
                    <Zap className="h-10 w-10 fill-white" />
                  </div>

                  <p className="mt-6 text-2xl font-black tracking-tight">
                    KOBAS
                  </p>

                  <p className="mt-1 text-xs font-semibold tracking-[0.5em] text-blue-400">
                    TECH
                  </p>

                  <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />

                  <p className="mt-4 text-sm text-zinc-500">
                    Votre partenaire des solutions digitales
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="border-y border-white/5 bg-white/[0.015]">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:grid-cols-3 lg:px-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                  {stat.value}
                </p>

                <p className="mt-2 text-sm text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* VALEURS */}
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
              Ce qui nous anime
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Nos valeurs
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => {
              const Icon = value.icon;

              return (
                <div
                  key={value.title}
                  className="rounded-2xl border border-white/8 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-white/[0.05]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-5 font-semibold">{value.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    {value.text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CE QUE NOUS PROPOSONS */}
        <section className="border-t border-white/5 bg-white/[0.015]">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <div className="mb-12 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
                Notre offre
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Ce que nous proposons
              </h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-blue-400">
                  <Package className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    Produits numériques
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Abonnements, licences, jeux et logiciels, livrés
                    rapidement.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-blue-400">
                  <Code2 className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    Développement web & mobile
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Sites, applications Android et solutions sur-mesure pour
                    votre activité.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-blue-400">
                  <Rocket className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    Solutions intelligence artificielle
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Intégration d&apos;outils IA adaptés à vos besoins métier.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-blue-400">
                  <Users className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    Accompagnement client
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Une équipe disponible pour vous conseiller avant et après
                    achat.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-blue-400">
                  <Award className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    Qualité garantie
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Des produits sélectionnés et vérifiés avant mise en ligne.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-blue-400">
                  <Target className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">Vision claire</h3>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Devenir la référence des solutions digitales au Bénin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="rounded-3xl border border-blue-500/10 bg-gradient-to-r from-blue-500/5 to-violet-500/5 p-8 text-center sm:p-14">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Une question, un projet ?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500">
              Notre équipe est à votre disposition pour vous accompagner et
              répondre à toutes vos questions.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
              >
                Nous contacter
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/boutique"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Voir la boutique
              </Link>
            </div>
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
```
