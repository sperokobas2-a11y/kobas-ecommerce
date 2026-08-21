"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  ShoppingBag,
  Users,
} from "lucide-react";

type CustomerOrder = {
  id: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
};

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  address: string | null;
  city: string | null;
  country: string;
  orders: CustomerOrder[];
  createdAt: string;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCustomers() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/customers", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Impossible de charger les clients.");
        }

        if (cancelled) return;

        setCustomers(data.customers || []);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Une erreur est survenue."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCustomers();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return customers;

    return customers.filter((customer) => {
      return (
        `${customer.firstName} ${customer.lastName}`
          .toLowerCase()
          .includes(normalizedSearch) ||
        customer.email.toLowerCase().includes(normalizedSearch) ||
        customer.whatsapp.includes(normalizedSearch) ||
        (customer.city || "").toLowerCase().includes(normalizedSearch)
      );
    });
  }, [customers, search]);

  const totalCustomers = customers.length;

  const totalRevenue = customers.reduce((sum, customer) => {
    const paid = customer.orders
      .filter((order) => order.paymentStatus === "PAID")
      .reduce((s, order) => s + order.total, 0);
    return sum + paid;
  }, 0);

  const repeatCustomers = customers.filter(
    (customer) => customer.orders.length > 1
  ).length;

  const newCustomers = customers.filter((customer) => {
    const createdAt = new Date(customer.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdAt >= thirtyDaysAgo;
  }).length;

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
          Relation client
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-tight">
          Clients
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Consultez la liste et l&apos;historique de vos clients.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Clients"
          value={totalCustomers.toString()}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Nouveaux (30j)"
          value={newCustomers.toString()}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Clients fidèles"
          value={repeatCustomers.toString()}
          icon={<ShoppingBag className="h-5 w-5" />}
        />
        <StatCard
          label="Revenu total"
          value={`${totalRevenue.toLocaleString("fr-FR")} FCFA`}
          icon={<ShoppingBag className="h-5 w-5" />}
        />
      </div>

      <div className="mt-8">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client, email, WhatsApp, ville..."
            className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
          />
        </div>
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
            Chargement des clients...
          </div>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] px-6 py-20 text-center">
          <Users className="mx-auto h-12 w-12 text-zinc-700" />

          <h2 className="mt-5 text-xl font-bold">Aucun client trouvé</h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">
            {customers.length === 0
              ? "Vous n'avez encore aucun client enregistré."
              : "Aucun client ne correspond à votre recherche."}
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.025]">
                <tr className="text-xs uppercase tracking-wider text-zinc-600">
                  <th className="px-5 py-4 font-semibold">Client</th>
                  <th className="px-5 py-4 font-semibold">Contact</th>
                  <th className="px-5 py-4 font-semibold">Localisation</th>
                  <th className="px-5 py-4 font-semibold">Commandes</th>
                  <th className="px-5 py-4 font-semibold">Total dépensé</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {filteredCustomers.map((customer) => {
                  const spent = customer.orders
                    .filter((o) => o.paymentStatus === "PAID")
                    .reduce((s, o) => s + o.total, 0);

                  return (
                    <tr
                      key={customer.id}
                      className="transition hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-violet-600/20 text-sm font-bold text-blue-300">
                            {customer.firstName?.[0]}
                            {customer.lastName?.[0]}
                          </div>

                          <div>
                            <p className="text-sm font-semibold">
                              {customer.firstName} {customer.lastName}
                            </p>
                            <p className="mt-1 text-xs text-zinc-600">
                              Depuis{" "}
                              {new Date(
                                customer.createdAt
                              ).toLocaleDateString("fr-FR", {
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <Phone className="h-3.5 w-3.5 text-zinc-600" />
                          {customer.whatsapp}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-600">
                          <Mail className="h-3.5 w-3.5 text-zinc-700" />
                          <span className="max-w-[180px] truncate">
                            {customer.email}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <MapPin className="h-3.5 w-3.5 text-zinc-600" />
                          {customer.city || customer.country}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <span className="inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                          {customer.orders.length} commande
                          {customer.orders.length !== 1 ? "s" : ""}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <p className="text-sm font-bold">
                          {spent.toLocaleString("fr-FR")} FCFA
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-white/5 px-5 py-4">
            <p className="text-xs text-zinc-600">
              {filteredCustomers.length} client
              {filteredCustomers.length !== 1 ? "s" : ""} affiché
              {filteredCustomers.length !== 1 ? "s" : ""}
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
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          {icon}
        </div>
        <span className="text-xl font-black">{value}</span>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-600">
        {label}
      </p>
    </div>
  );
}