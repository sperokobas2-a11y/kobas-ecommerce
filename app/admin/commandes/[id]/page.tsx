"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  User,
} from "lucide-react";

type OrderItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
};

type Payment = {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  phone: string | null;
  provider: string | null;
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
};

type Order = {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  payments: Payment[];
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  createdAt: string;
  updatedAt: string;
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "En attente" },
  { value: "CONFIRMED", label: "Confirmée" },
  { value: "PROCESSING", label: "En préparation" },
  { value: "SHIPPED", label: "Expédiée" },
  { value: "DELIVERED", label: "Livrée" },
  { value: "CANCELLED", label: "Annulée" },
];

const METHOD_LABELS: Record<string, string> = {
  MTN_MONEY: "MTN Money",
  MOOV_MONEY: "Moov Money",
  CARD: "Carte bancaire",
  CASH: "Espèces",
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/admin/orders/${orderId}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Impossible de charger la commande.");
        }

        if (cancelled) return;

        setOrder(data.order);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Une erreur est survenue."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (orderId) loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  async function updateStatus(newStatus: string) {
    if (!order) return;

    try {
      setUpdating(true);

      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible de mettre à jour le statut.");
      }

      setOrder(data.order);
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Une erreur est survenue."
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025]">
          <div className="flex items-center gap-3 text-sm text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
            Chargement de la commande...
          </div>
        </div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
        <Link
          href="/admin/commandes"
          className="flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux commandes
        </Link>

        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">
            {error || "Commande introuvable."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
      {/* RETOUR */}
      <Link
        href="/admin/commandes"
        className="flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux commandes
      </Link>

      {/* EN-TÊTE */}
      <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
            Commande
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            {order.orderNumber}
          </h1>

          <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
            <Calendar className="h-4 w-4" />
            Créée le{" "}
            {new Date(order.createdAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PaymentBadge status={order.paymentStatus} />

          <select
            value={order.status}
            disabled={updating}
            onChange={(e) => updateStatus(e.target.value)}
            className="h-11 rounded-xl border border-white/10 bg-[#111218] px-4 text-sm font-semibold text-zinc-300 outline-none focus:border-blue-500 disabled:opacity-50"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* COLONNE PRINCIPALE */}
        <div className="space-y-6 lg:col-span-2">
          {/* ARTICLES */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Articles commandés
              </h2>
            </div>

            <div className="mt-5 divide-y divide-white/5">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="mt-1 text-xs text-zinc-600">
                      {item.quantity} × {item.price.toLocaleString("fr-FR")}{" "}
                      FCFA
                    </p>
                  </div>

                  <p className="text-sm font-bold">
                    {item.total.toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Sous-total</span>
                <span className="text-zinc-300">
                  {order.subtotal.toLocaleString("fr-FR")} FCFA
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Livraison</span>
                <span className="text-zinc-300">
                  {order.shipping.toLocaleString("fr-FR")} FCFA
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-2 text-base font-bold">
                <span>Total</span>
                <span>{order.total.toLocaleString("fr-FR")} FCFA</span>
              </div>
            </div>
          </div>

          {/* PAIEMENTS */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Transactions de paiement
              </h2>
            </div>

            {order.payments.length === 0 ? (
              <p className="mt-5 text-sm text-zinc-600">
                Aucune transaction enregistrée pour cette commande.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {order.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {payment.transactionId}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        {METHOD_LABELS[payment.method] || payment.method}
                        {payment.phone ? ` • ${payment.phone}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-zinc-700">
                        {new Date(payment.createdAt).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {payment.amount.toLocaleString("fr-FR")}{" "}
                        {payment.currency}
                      </p>
                      <div className="mt-1">
                        <PaymentBadge status={payment.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLONNE LATÉRALE — CLIENT */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Client
              </h2>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-violet-600/20 text-sm font-bold text-blue-300">
                {order.customer.firstName?.[0]}
                {order.customer.lastName?.[0]}
              </div>

              <div>
                <p className="text-sm font-semibold">
                  {order.customer.firstName} {order.customer.lastName}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Phone className="h-4 w-4 shrink-0 text-zinc-600" />
                {order.customer.whatsapp}
              </div>

              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Mail className="h-4 w-4 shrink-0 text-zinc-600" />
                <span className="truncate">{order.customer.email}</span>
              </div>

              {(order.customer.address || order.customer.city) && (
                <div className="flex items-start gap-2 text-sm text-zinc-400">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
                  <span>
                    {order.customer.address && (
                      <>
                        {order.customer.address}
                        <br />
                      </>
                    )}
                    {order.customer.city || order.customer.country}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RÉSUMÉ STATUT */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Résumé
              </h2>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Statut commande</span>
                <span className="font-semibold">
                  {STATUS_OPTIONS.find((s) => s.value === order.status)
                    ?.label || order.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Paiement</span>
                <PaymentBadge status={order.paymentStatus} />
              </div>

              {order.paymentMethod && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Moyen</span>
                  <span className="font-semibold">
                    {METHOD_LABELS[order.paymentMethod] ||
                      order.paymentMethod}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-zinc-500">Dernière mise à jour</span>
                <span className="text-xs text-zinc-600">
                  {new Date(order.updatedAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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