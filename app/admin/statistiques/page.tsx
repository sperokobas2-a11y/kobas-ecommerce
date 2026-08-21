"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  DollarSign,
  Loader2,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";

type Stats = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueGrowth: number;
  salesByDay: Record<string, number>;
  topProducts: { name: string; quantity: number; revenue: number }[];
  ordersByStatus: Record<string, number>;
  paymentsByMethod: Record<string, number>;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const METHOD_LABELS: Record<string, string> = {
  MTN_MONEY: "MTN Money",
  MOOV_MONEY: "Moov Money",
  CARD: "Carte bancaire",
  CASH: "Espèces",
};

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/stats", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Impossible de charger les statistiques."
          );
        }

        if (cancelled) return;

        setStats(data.stats);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Une erreur est survenue."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const maxDailySale = stats
    ? Math.max(...Object.values(stats.salesByDay), 1)
    : 1;

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
            Performance
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Statistiques
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Analysez les performances de votre boutique.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="mt-8 flex min-h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025]">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
              Chargement des statistiques...
            </div>
          </div>
        ) : stats ? (
          <>
            {/* CARTES PRINCIPALES */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Revenu total"
                value={`${stats.totalRevenue.toLocaleString("fr-FR")} FCFA`}
                icon={<DollarSign className="h-5 w-5" />}
                growth={stats.revenueGrowth}
              />
              <StatCard
                label="Commandes"
                value={stats.totalOrders.toString()}
                icon={<ShoppingBag className="h-5 w-5" />}
              />
              <StatCard
                label="Produits"
                value={stats.totalProducts.toString()}
                icon={<Package className="h-5 w-5" />}
              />
              <StatCard
                label="Clients"
                value={stats.totalCustomers.toString()}
                icon={<Users className="h-5 w-5" />}
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Panier moyen
                </p>
                <p className="mt-2 text-2xl font-black">
                  {stats.averageOrderValue.toLocaleString("fr-FR", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  FCFA
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Évolution sur 30 jours
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {stats.revenueGrowth >= 0 ? (
                    <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-red-400" />
                  )}
                  <p
                    className={`text-2xl font-black ${
                      stats.revenueGrowth >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {stats.revenueGrowth >= 0 ? "+" : ""}
                    {stats.revenueGrowth.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* GRAPHIQUE VENTES PAR JOUR */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                  Ventes des 14 derniers jours
                </h2>
              </div>

              <div className="mt-6 flex h-48 items-end gap-2">
                {Object.entries(stats.salesByDay).map(([date, amount]) => {
                  const heightPercent = (amount / maxDailySale) * 100;

                  return (
                    <div
                      key={date}
                      className="group relative flex flex-1 flex-col items-center justify-end"
                    >
                      <div className="pointer-events-none absolute -top-8 rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-black opacity-0 transition group-hover:opacity-100">
                        {amount.toLocaleString("fr-FR")} FCFA
                      </div>

                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400 transition group-hover:from-blue-500 group-hover:to-violet-400"
                        style={{
                          height: `${Math.max(heightPercent, 2)}%`,
                        }}
                      />

                      <p className="mt-2 text-[9px] text-zinc-600">
                        {new Date(date).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {/* TOP PRODUITS */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                    Top produits
                  </h2>
                </div>

                {stats.topProducts.length === 0 ? (
                  <p className="mt-6 text-sm text-zinc-600">
                    Aucune vente enregistrée.
                  </p>
                ) : (
                  <div className="mt-5 space-y-4">
                    {stats.topProducts.map((product, index) => (
                      <div
                        key={product.name + index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-400">
                            {index + 1}
                          </span>
                          <div>
                            <p className="max-w-[180px] truncate text-sm font-medium">
                              {product.name}
                            </p>
                            <p className="text-xs text-zinc-600">
                              {product.quantity} vendu
                              {product.quantity !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm font-bold">
                          {product.revenue.toLocaleString("fr-FR")} FCFA
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RÉPARTITION STATUTS */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-blue-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                    Statuts des commandes
                  </h2>
                </div>

                <div className="mt-5 space-y-3">
                  {Object.entries(stats.ordersByStatus).map(
                    ([status, count]) => {
                      const percent =
                        stats.totalOrders > 0
                          ? (count / stats.totalOrders) * 100
                          : 0;

                      return (
                        <div key={status}>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400">
                              {STATUS_LABELS[status] || status}
                            </span>
                            <span className="text-zinc-500">{count}</span>
                          </div>
                          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* MOYENS DE PAIEMENT */}
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Moyens de paiement utilisés
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(stats.paymentsByMethod).map(
                  ([method, count]) => (
                    <div
                      key={method}
                      className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                    >
                      <p className="text-xs text-zinc-600">
                        {METHOD_LABELS[method] || method}
                      </p>
                      <p className="mt-2 text-xl font-black">{count}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
  growth,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  growth?: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          {icon}
        </div>

        {growth !== undefined && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold ${
              growth >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {growth >= 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(growth).toFixed(0)}%
          </span>
        )}
      </div>

      <p className="mt-4 text-xl font-black">{value}</p>

      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-600">
        {label}
      </p>
    </div>
  );
}