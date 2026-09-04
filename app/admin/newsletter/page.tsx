"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, Mail, Search } from "lucide-react";

type Subscriber = {
  id: string;
  email: string;
  createdAt: string;
};

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSubscribers() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/newsletter", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Impossible de charger les abonnés."
          );
        }

        if (cancelled) return;

        setSubscribers(data.subscribers || []);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Une erreur est survenue."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSubscribers();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSubscribers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return subscribers;

    return subscribers.filter((sub) =>
      sub.email.toLowerCase().includes(normalizedSearch)
    );
  }, [subscribers, search]);

  function exportCsv() {
    const header = "Email,Date d'inscription\n";

    const rows = subscribers
      .map(
        (sub) =>
          `${sub.email},${new Date(sub.createdAt).toLocaleDateString(
            "fr-FR"
          )}`
      )
      .join("\n");

    const csvContent = header + rows;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `newsletter-kobas-tech-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
            Communication
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Newsletter
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            {subscribers.length} abonné{subscribers.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          disabled={subscribers.length === 0}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-black transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Exporter en CSV
        </button>
      </div>

      <div className="mt-8 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un email..."
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
            Chargement des abonnés...
          </div>
        </div>
      ) : filteredSubscribers.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] px-6 py-20 text-center">
          <Mail className="mx-auto h-12 w-12 text-zinc-700" />

          <h2 className="mt-5 text-xl font-bold">Aucun abonné</h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">
            {subscribers.length === 0
              ? "Personne n'est encore inscrit à la newsletter."
              : "Aucun abonné ne correspond à votre recherche."}
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
          <table className="w-full text-left">
            <thead className="border-b border-white/10 bg-white/[0.025]">
              <tr className="text-xs uppercase tracking-wider text-zinc-600">
                <th className="px-5 py-4 font-semibold">Email</th>
                <th className="px-5 py-4 font-semibold">
                  Date d&apos;inscription
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {filteredSubscribers.map((sub) => (
                <tr key={sub.id} className="transition hover:bg-white/[0.02]">
                  <td className="px-5 py-4 text-sm">{sub.email}</td>
                  <td className="px-5 py-4 text-sm text-zinc-500">
                    {new Date(sub.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-white/5 px-5 py-4">
            <p className="text-xs text-zinc-600">
              {filteredSubscribers.length} abonné
              {filteredSubscribers.length !== 1 ? "s" : ""} affiché
              {filteredSubscribers.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
