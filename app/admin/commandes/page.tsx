"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Eye,
  Loader2,
  Package,
  Search,
  Truck,
} from "lucide-react";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  total: number;
};

type Payment = {
  id: string;
  status: string;
  method: string;
};

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  whatsapp: string;
  email: string;
};

type Order = {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  payments: Payment[];
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "En attente" },
  { value: "CONFIRMED", label: "Confirmée" },
  { value: "PROCESSING", label: "En préparation" },
  { value: "SHIPPED", label: "Expédiée" },
  { value: "DELIVERED", label: "Livrée" },
  { value: "CANCELLED", label: "Annulée" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/orders", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Impossible de charger les commandes.");
        }

        if (cancelled) return;

        setOrders(data.orders || []);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Une erreur est survenue."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  async function updateStatus(order: Order, newStatus: string) {
    try {
      setUpdatingId(order.id);

      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible de mettre à jour le statut.");
      }

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Une erreur est survenue."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !normalizedSearch ||
        order.orderNumber.toLowerCase().includes(normalizedSearch) ||
        `${order.customer?.firstName} ${order.customer?.lastName}`
          .toLowerCase()
          .includes(normalizedSearch) ||
        order.customer?.whatsapp?.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
  const processingOrders = orders.filter(
    (o) => o.status === "PROCESSING" || o.status === "CONFIRMED"
  ).length;
  const deliveredOrders = orders.filter(
    (o) => o.status === "DELIVERED"
  ).length;

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
          Ventes
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-tight">
          Commandes
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Suivez et gérez toutes les commandes de vos clients.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Commandes"
          value={totalOrders}
          icon={<ClipboardList className="h-5 w-5" />}
        />
        <StatCard
          label="En attente"
          value={pendingOrders}
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          label="En cours"
          value={processingOrders}
          icon={<Truck className="h-5 w-5" />}
        />
        <StatCard
          label="Livrées"
          value={deliveredOrders}
          icon={<ClipboardList className="h-5 w-5" />}
        />
      </div>

      <div className="mt-8 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un n° de commande, client, WhatsApp..."
            className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-12 rounded-xl border border-white/10 bg-[#111218] px-4 text-sm text-zinc-300 outline-none focus:border-blue-500 md:w-64"
        >
          <option value="all">Tous les statuts</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
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
            Chargement des commandes...
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] px-6 py-20 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-zinc-700" />

          <h2 className="mt-5 text-xl font-bold">
            Aucune commande trouvée
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">
            {orders.length === 0
              ? "Vous n'avez encore reçu aucune commande."
              : "Aucune commande ne correspond à votre recherche."}
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.025]">
                <tr className="text-xs uppercase tracking-wider text-zinc-600">
                  <th className="px-5 py-4 font-semibold">Commande</th>
                  <th className="px-5 py-4 font-semibold">Client</th>
                  <th className="px-5 py-4 font-semibold">Total</th>
                  <th className="px-5 py-4 font-semibold">Paiement</th>
                  <th className="px-5 py-4 font-semibold">Statut</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-5">
                      <p className="text-sm font-semibold">
                        {order.orderNumber}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        {new Date(order.createdAt).toLocaleDateString(
                          "fr-FR",
                          { day: "2-digit", month: "short", year: "numeric" }
                        )}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <p className="text-sm text-zinc-300">
                        {order.customer?.firstName}{" "}
                        {order.customer?.lastName}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        {order.customer?.whatsapp}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <p className="text-sm font-bold">
                        {order.total.toLocaleString("fr-FR")} FCFA
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        {order.items?.length || 0} article
                        {order.items?.length !== 1 ? "s" : ""}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <PaymentBadge status={order.paymentStatus} />
                    </td>

                    <td className="px-5 py-5">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) =>
                          updateStatus(order, e.target.value)
                        }
                        className="h-9 rounded-lg border border-white/10 bg-[#111218] px-3 text-xs font-semibold text-zinc-300 outline-none focus:border-blue-500 disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/commandes/${order.id}`}
                          aria-label={`Voir la commande ${order.orderNumber}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-500 transition hover:bg-blue-500/10 hover:text-blue-400"
                        >
                          {updatingId === order.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-white/5 px-5 py-4">
            <p className="text-xs text-zinc-600">
              {filteredOrders.length} commande
              {filteredOrders.length !== 1 ? "s" : ""} affichée
              {filteredOrders.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          {icon}
        </div>
        <span className="text-2xl font-black">{value}</span>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-600">
        {label}
      </p>
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  if (status === "PAID") {
    return (
      <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
        Payée
      </span>
    );
  }

  if (status === "FAILED") {
    return (
      <span className="inline-flex rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
        Échouée
      </span>
    );
  }

  if (status === "REFUNDED") {
    return (
      <span className="inline-flex rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-400">
        Remboursée
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
      En attente
    </span>
  );
}