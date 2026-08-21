"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Check,
  Loader2,
  MapPin,
  Phone,
  ShoppingBag,
  User,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { useCartStore } from "@/lib/store/cart-store";
import Header from "@/components/Header";

export default function CommandePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const items = useCartStore((state) => state.items);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("MTN_MONEY");

  const [loading, setLoading] = useState(false);
  const [prefilling, setPrefilling] = useState(false);
  const [error, setError] = useState("");

  const isCustomerLoggedIn =
    status === "authenticated" &&
    (session?.user as { role?: string })?.role === "customer";

  // Pré-remplissage automatique si le client est connecté
  useEffect(() => {
    if (!isCustomerLoggedIn) return;

    let cancelled = false;

    async function loadProfile() {
      try {
        setPrefilling(true);

        const response = await fetch("/api/customers/me", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || cancelled) return;

        setFirstName(data.customer.firstName || "");
        setLastName(data.customer.lastName || "");
        setEmail(data.customer.email || "");
        setWhatsapp(data.customer.whatsapp || "");
        setAddress(data.customer.address || "");
        setCity(data.customer.city || "");
      } catch {
        // silencieux : le client peut toujours remplir manuellement
      } finally {
        if (!cancelled) setPrefilling(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [isCustomerLoggedIn]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (items.length === 0) {
      setError("Votre panier est vide.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          whatsapp,
          address,
          city,
          paymentMethod,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            name: item.name,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible de créer la commande.");
      }

      if (!data.orderNumber) {
        throw new Error(
          "La commande a été créée mais son numéro est introuvable."
        );
      }

      router.push(
        `/commande/confirmation?order=${encodeURIComponent(
          data.orderNumber
        )}`
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      );

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <Header />

      {/* CONTENU */}
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        {/* TITRE */}
        <div className="mb-10">
          <Link
            href="/panier"
            className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-zinc-500 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour au panier
          </Link>

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
            Kobas Tech
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            Finaliser ma commande
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Renseignez vos informations pour confirmer votre commande.
          </p>

          {isCustomerLoggedIn && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-400/5 px-3 py-1.5 text-xs font-medium text-blue-300">
              <User className="h-3.5 w-3.5" />
              {prefilling
                ? "Chargement de vos informations..."
                : `Connecté en tant que ${session?.user?.name}`}
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-20 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-zinc-700" />

            <h2 className="mt-6 text-2xl font-bold">
              Votre panier est vide
            </h2>

            <p className="mt-3 text-sm text-zinc-500">
              Ajoutez au moins un produit avant de passer commande.
            </p>

            <Link
              href="/boutique"
              className="mt-8 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-blue-400"
            >
              Découvrir la boutique
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid gap-8 lg:grid-cols-[1fr_380px]"
          >
            {/* FORMULAIRE */}
            <div className="space-y-6">
              {/* INFORMATIONS PERSONNELLES */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <User className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-bold">Informations personnelles</h2>

                    <p className="text-xs text-zinc-600">
                      Ces informations servent au traitement de votre
                      commande.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-zinc-400">
                      Prénom *
                    </label>

                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(event) =>
                        setFirstName(event.target.value)
                      }
                      placeholder="Votre prénom"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-zinc-400">
                      Nom *
                    </label>

                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(event) =>
                        setLastName(event.target.value)
                      }
                      placeholder="Votre nom"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-zinc-400">
                      Email *
                    </label>

                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="exemple@email.com"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-zinc-400">
                      WhatsApp *
                    </label>

                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

                      <input
                        type="tel"
                        required
                        value={whatsapp}
                        onChange={(event) =>
                          setWhatsapp(event.target.value)
                        }
                        placeholder="+229 XX XX XX XX"
                        className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* LIVRAISON */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                    <MapPin className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-bold">Adresse</h2>

                    <p className="text-xs text-zinc-600">
                      Où devons-nous vous contacter ?
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-zinc-400">
                      Adresse *
                    </label>

                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(event) =>
                        setAddress(event.target.value)
                      }
                      placeholder="Quartier, rue, maison..."
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-zinc-400">
                      Ville *
                    </label>

                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      placeholder="Cotonou"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* PAIEMENT */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Wallet className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-bold">Méthode de paiement</h2>

                    <p className="text-xs text-zinc-600">
                      Choisissez votre moyen de paiement.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("MTN_MONEY")}
                    className={`rounded-xl border p-4 text-left transition ${
                      paymentMethod === "MTN_MONEY"
                        ? "border-yellow-400/50 bg-yellow-400/10"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                    }`}
                  >
                    <p className="font-bold">MTN Money</p>

                    <p className="mt-1 text-xs text-zinc-500">
                      Paiement mobile
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("MOOV_MONEY")}
                    className={`rounded-xl border p-4 text-left transition ${
                      paymentMethod === "MOOV_MONEY"
                        ? "border-green-400/50 bg-green-400/10"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                    }`}
                  >
                    <p className="font-bold">Moov Money</p>

                    <p className="mt-1 text-xs text-zinc-500">
                      Paiement mobile
                    </p>
                  </button>
                </div>
              </div>

              {/* ERREUR */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-sm font-medium text-red-400">{error}</p>
                </div>
              )}
            </div>

            {/* RÉSUMÉ */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <h2 className="text-lg font-bold">Votre commande</h2>

                <div className="mt-6 space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-zinc-600">
                          Quantité : {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-semibold">
                        {(item.price * item.quantity).toLocaleString(
                          "fr-FR"
                        )}{" "}
                        FCFA
                      </p>
                    </div>
                  ))}
                </div>

                <div className="my-6 h-px bg-white/10" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">Sous-total</span>

                  <span className="font-medium">
                    {total.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-zinc-500">Livraison</span>

                  <span className="text-sm text-emerald-400">
                    À définir
                  </span>
                </div>

                <div className="my-6 h-px bg-white/10" />

                <div className="flex items-end justify-between">
                  <span className="font-semibold">Total</span>

                  <span className="text-2xl font-black">
                    {total.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-black transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Création de la commande...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Confirmer la commande
                    </>
                  )}
                </button>

                <p className="mt-5 text-center text-xs leading-5 text-zinc-600">
                  En confirmant votre commande, vous acceptez que vos
                  informations soient utilisées pour traiter votre achat.
                </p>
              </div>
            </aside>
          </form>
        )}
      </section>
    </main>
  );
}