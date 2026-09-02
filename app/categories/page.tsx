import Link from "next/link";
import {
  ArrowRight,
  Gamepad2,
  Laptop,
  MonitorSmartphone,
  Package,
  Smartphone,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
export const dynamic = "force-dynamic";

// Icônes de secours si la catégorie n'a pas d'image, associées par nom
const FALLBACK_ICONS: Record<string, typeof Gamepad2> = {
  Gaming: Gamepad2,
  Logiciels: Laptop,
  Informatique: MonitorSmartphone,
  Téléphones: Smartphone,
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
            Kobas Tech
          </p>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Nos catégories
          </h1>

          <p className="max-w-xl text-sm leading-6 text-zinc-500">
            Parcourez notre catalogue organisé par catégorie pour trouver
            exactement ce dont vous avez besoin.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-400">
              <Package className="h-9 w-9" />
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              Aucune catégorie disponible
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
              Les catégories apparaîtront ici dès qu&apos;elles seront ajoutées.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = FALLBACK_ICONS[category.name] || Package;

              return (
                <Link
                  key={category.id}
                  href={`/boutique?categorie=${category.slug}`}
                  className="group overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025] transition duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-white/[0.05]"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-blue-950/40">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-blue-400 backdrop-blur-xl transition duration-500 group-hover:scale-110">
                          <Icon className="h-8 w-8" />
                        </div>
                      </div>
                    )}

                    <span className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-bold tracking-wider text-zinc-300 backdrop-blur-xl">
                      {category._count.products} produit
                      {category._count.products !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold">
                      {category.name}
                    </h3>

                    {category.description && (
                      <p className="mt-2 text-sm leading-6 text-zinc-500">
                        {category.description}
                      </p>
                    )}

                    <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-zinc-400 transition group-hover:text-blue-400">
                      Découvrir
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <footer className="mt-10 border-t border-white/5">
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
