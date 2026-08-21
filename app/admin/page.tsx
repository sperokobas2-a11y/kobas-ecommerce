import Link from "next/link";
import {
  BarChart3,
  Boxes,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [
    productCount,
    customerCount,
    orderCount,
    revenueResult,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    prisma.product.count(),

    prisma.customer.count(),

    prisma.order.count(),

    prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        paymentStatus: "PAID",
      },
    }),

    prisma.order.findMany({
      take: 6,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        customer: true,
      },
    }),

    prisma.product.findMany({
      where: {
        active: true,
        stock: {
          lte: 5,
        },
      },
      take: 5,
      orderBy: {
        stock: "asc",
      },
    }),
  ]);

  const revenue = revenueResult._sum.total ?? 0;

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        {/* TITRE */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
            Administration
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Tableau de bord
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Vue d&apos; ensemble de votre activité Kobas Tech.
          </p>
        </div>

        {/* STATISTIQUES */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Chiffre d'affaires"
            value={`${revenue.toLocaleString(
              "fr-FR"
            )} FCFA`}
            icon={<BarChart3 />}
          />

          <StatCard
            title="Commandes"
            value={orderCount.toString()}
            icon={<ShoppingCart />}
          />

          <StatCard
            title="Produits"
            value={productCount.toString()}
            icon={<Package />}
          />

          <StatCard
            title="Clients"
            value={customerCount.toString()}
            icon={<Users />}
          />
        </div>

        {/* CONTENU */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* COMMANDES */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.025]">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <h2 className="font-bold">
                  Commandes récentes
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  Les dernières commandes reçues.
                </p>
              </div>

              <Link
                href="/admin/commandes"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                Voir tout
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-10 text-center text-sm text-zinc-600">
                Aucune commande pour le moment.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {order.orderNumber}
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        {order.customer.firstName}{" "}
                        {order.customer.lastName}
                      </p>
                    </div>

                    <div className="flex items-center gap-5">
                      <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold text-zinc-400">
                        {order.status}
                      </span>

                      <span className="text-sm font-bold">
                        {order.total.toLocaleString(
                          "fr-FR"
                        )}{" "}
                        FCFA
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* STOCK */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center gap-3">
                <Boxes className="h-5 w-5 text-orange-400" />

                <div>
                  <h2 className="font-bold">
                    Stock faible
                  </h2>

                  <p className="mt-1 text-xs text-zinc-600">
                    Produits nécessitant votre attention.
                  </p>
                </div>
              </div>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center text-sm text-emerald-400">
                Tous les stocks sont suffisants.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-4 p-5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {product.name}
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        {product.price.toLocaleString(
                          "fr-FR"
                        )}{" "}
                        FCFA
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400">
                      {product.stock} restant
                      {product.stock !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* NAVIGATION */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminLink
            href="/admin/produits"
            icon={<Package />}
            title="Produits"
            description="Gérer le catalogue"
          />

          <AdminLink
            href="/admin/commandes"
            icon={<ShoppingCart />}
            title="Commandes"
            description="Gérer les commandes"
          />

          <AdminLink
            href="/admin/clients"
            icon={<Users />}
            title="Clients"
            description="Voir les clients"
          />

          <AdminLink
            href="/admin/statistiques"
            icon={<BarChart3 />}
            title="Statistiques"
            description="Analyser les ventes"
          />
        </section>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-8 text-xs text-zinc-600 lg:px-8">
          <span>
            © {new Date().getFullYear()} Kobas Tech
          </span>

          <span>Administration</span>
        </div>
      </footer>
    </main>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500">
          {title}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-2xl font-black">
        {value}
      </p>
    </div>
  );
}

/* =========================
   ADMIN LINK
========================= */

function AdminLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-blue-500/30 hover:bg-blue-500/[0.04]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-400 transition group-hover:bg-blue-500/10 group-hover:text-blue-400">
        {icon}
      </div>

      <h3 className="mt-5 font-bold">
        {title}
      </h3>

      <p className="mt-1 text-xs text-zinc-600">
        {description}
      </p>
    </Link>
  );
}