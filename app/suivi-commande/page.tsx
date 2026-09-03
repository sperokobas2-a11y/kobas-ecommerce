"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Loader2,
  Package,
  Search,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  total: number;
};

type Order = {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
  };
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const STATUS_STEPS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export default function SuiviCommandePage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Commande introuvable.");
      }

      setOrder(data.order);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  const currentStepIndex = order
    ? STATUS_STEPS.indexOf(order.status)
    : -1;
  const isCancelled = order?.status === "CANCELLED";

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <Header />

      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
          Kobas Tech
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-tight">
          Suivre ma commande
        </h1>

        <p className="mt-3 text-sm text-zinc-500">
          Entrez votre numéro de commande et votre adresse e-mail pour
          consulter son statut.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-400">
                Numéro de commande
              </label>

              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="KOB-661344"
                className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-400">
                Adresse email
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-black transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Rechercher
          </button>
        </form>

        {order && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold">{order.orderNumber}</p>

                <p className="mt-1 text-xs text-zinc-600">
                  Commande passée le{" "}
                  {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-zinc-300">
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </div>

            {/* SUIVI VISUEL */}
            {!isCancelled ? (
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  {STATUS_STEPS.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;

                    return (
                      <div
                        key={step}
                        className="flex flex-1 flex-col items-center"
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                            isCompleted
                              ? "bg-blue-500 text-white"
                              : "bg-white/5 text-zinc-600"
                          }`}
                        >
                          {index + 1}
                        </div>

                        <p
                          className={`mt-2 text-center text-[10px] ${
                            isCompleted ? "text-zinc-300" : "text-zinc-600"
                          }`}
                        >
                          {STATUS_LABELS[step]}
                        </p>

                        {index < STATUS_STEPS.length - 1 && (
                          <div
                            className={`absolute mt-4 h-0.5 w-full translate-x-1/2 ${
                              index < currentStepIndex
                                ? "bg-blue-500"
                                : "bg-white/5"
                            }`}
                            style={{ zIndex: -1 }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <p className="text-sm text-red-400">
                  Cette commande a été annulée.
                </p>
              </div>
            )}

            {/* ARTICLES */}
            <div className="mt-8 divide-y divide-white/5 border-t border-white/5">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="text-zinc-400">
                    {item.quantity} × {item.name}
                  </span>

                  <span className="text-zinc-300">
                    {item.total.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-sm text-zinc-500">Total</span>
              <span className="text-lg font-bold">
                {order.total.toLocaleString("fr-FR")} FCFA
              </span>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-zinc-600">
              <ClipboardList className="h-3.5 w-3.5" />
              Paiement : {order.paymentStatus === "PAID" ? "Payé" : "En attente"}
            </div>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6 text-center">
          <Package className="mx-auto h-8 w-8 text-zinc-600" />

          <p className="mt-3 text-sm text-zinc-500">
            Vous avez un compte ?{" "}
            <Link href="/connexion" className="text-blue-400 hover:underline">
              Connectez-vous
            </Link>{" "}
            pour voir toutes vos commandes en un seul endroit.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
