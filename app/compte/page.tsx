"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  Save,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";

import Header from "@/components/Header";

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  address: string | null;
  city: string | null;
  country: string;
  hasGoogleAccount: boolean;
  hasPassword: boolean;
};

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  total: number;
  downloadUrl: string | null;
};

type Order = {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export default function ComptePage() {
  const router = useRouter();
  const { status } = useSession();

  const [tab, setTab] = useState<"profil" | "commandes">("profil");

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [disconnectingGoogle, setDisconnectingGoogle] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [googleSuccess, setGoogleSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    whatsapp: "",
    address: "",
    city: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/connexion");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [profileResponse, ordersResponse] = await Promise.all([
          fetch("/api/customers/me", {
            cache: "no-store",
          }),
          fetch("/api/customers/me/orders", {
            cache: "no-store",
          }),
        ]);

        const profileData = await profileResponse.json();
        const ordersData = await ordersResponse.json();

        if (!profileResponse.ok) {
          throw new Error(
            profileData.error || "Impossible de charger le profil."
          );
        }

        if (!ordersResponse.ok) {
          throw new Error(
            ordersData.error || "Impossible de charger les commandes."
          );
        }

        if (cancelled) {
          return;
        }

        const profile = profileData.customer;

        setCustomer(profile);

        setFormData({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          whatsapp: profile.whatsapp || "",
          address: profile.address || "",
          city: profile.city || "",
        });

        setOrders(ordersData.orders || []);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [status]);

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setSuccess(false);

      const response = await fetch("/api/customers/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Impossible de mettre à jour le profil."
        );
      }

      setCustomer(data.customer);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleConnectGoogle() {
    try {
      setConnectingGoogle(true);
      setGoogleError("");
      setGoogleSuccess("");

      const response = await fetch(
        "/api/customers/me/google/link",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Impossible de préparer la liaison Google."
        );
      }

      await signIn("google", {
        callbackUrl: "/compte",
      });
    } catch (err) {
      console.error("Liaison Google:", err);

      setGoogleError(
        err instanceof Error
          ? err.message
          : "Impossible de connecter Google."
      );

      setConnectingGoogle(false);
    }
  }

  async function handleDisconnectGoogle() {
    if (!customer?.hasGoogleAccount) {
      return;
    }

    if (!customer.hasPassword) {
      setGoogleError(
        "Définissez d'abord un mot de passe avant de déconnecter Google."
      );
      return;
    }

    try {
      setDisconnectingGoogle(true);
      setGoogleError("");
      setGoogleSuccess("");

      const response = await fetch(
        "/api/customers/me/google/unlink",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Impossible de déconnecter le compte Google."
        );
      }

      setCustomer((previous) =>
        previous
          ? {
              ...previous,
              hasGoogleAccount: false,
            }
          : previous
      );

      setGoogleSuccess(
        "Compte Google déconnecté avec succès."
      );
    } catch (err) {
      console.error("Déconnexion Google:", err);

      setGoogleError(
        err instanceof Error
          ? err.message
          : "Impossible de déconnecter Google."
      );
    } finally {
      setDisconnectingGoogle(false);
    }
  }

  async function handleChangePassword() {
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword.length < 8) {
      setPasswordError(
        "Le nouveau mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (
      passwordData.newPassword !== passwordData.confirmPassword
    ) {
      setPasswordError(
        "Les deux nouveaux mots de passe ne correspondent pas."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response = await fetch(
        "/api/customers/me/password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(passwordData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Impossible de modifier le mot de passe."
        );
      }

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordSuccess(
        data.message ||
          "Mot de passe modifié avec succès."
      );

      setCustomer((previous) =>
        previous
          ? {
              ...previous,
              hasPassword: true,
            }
          : previous
      );
    } catch (err) {
      setPasswordError(
        err instanceof Error
          ? err.message
          : "Impossible de modifier le mot de passe."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-[#08090d] text-white">
        <Header />

        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        </div>
      </main>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <Header />

      <section className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
        {/* HEADER COMPTE */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
              Kobas Tech
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Mon compte
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Bonjour {customer.firstName}, bienvenue sur votre espace.
            </p>
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>

        {/* ONGLETS */}
        <div className="mt-8 flex gap-2 border-b border-white/10">
          <button
            type="button"
            onClick={() => setTab("profil")}
            className={
              "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition " +
              (tab === "profil"
                ? "border-blue-400 text-white"
                : "border-transparent text-zinc-500 hover:text-white")
            }
          >
            <User className="h-4 w-4" />
            Profil
          </button>

          <button
            type="button"
            onClick={() => setTab("commandes")}
            className={
              "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition " +
              (tab === "commandes"
                ? "border-blue-400 text-white"
                : "border-transparent text-zinc-500 hover:text-white")
            }
          >
            <ClipboardList className="h-4 w-4" />
            Mes commandes

            {orders.length > 0 && (
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-400">
                {orders.length}
              </span>
            )}
          </button>
        </div>

        {/* PROFIL */}
        {tab === "profil" && (
          <div className="mt-8 max-w-2xl space-y-6">
            {/* INFORMATIONS PERSONNELLES */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
                <Mail className="h-4 w-4" />

                {customer.email}

                <span className="text-xs text-zinc-700">
                  (non modifiable)
                </span>
              </div>

              <div className="space-y-5">
                {/* PRÉNOM / NOM */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-zinc-400">
                      Prénom
                    </label>

                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          firstName: e.target.value,
                        })
                      }
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-zinc-400">
                      Nom
                    </label>

                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lastName: e.target.value,
                        })
                      }
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* WHATSAPP */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-zinc-400">
                    Numéro WhatsApp
                  </label>

                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          whatsapp: e.target.value,
                        })
                      }
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm outline-none transition focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* ADRESSE */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-zinc-400">
                    Adresse
                  </label>

                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: e.target.value,
                        })
                      }
                      placeholder="Quartier, rue..."
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* VILLE */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-zinc-400">
                    Ville
                  </label>

                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        city: e.target.value,
                      })
                    }
                    placeholder="Cotonou, Porto-Novo..."
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
                  />
                </div>

                {/* ERREUR */}
                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                    <p className="text-sm text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                {/* SUCCÈS */}
                {success && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />

                    <p className="text-sm text-emerald-400">
                      Profil mis à jour avec succès.
                    </p>
                  </div>
                )}

                {/* SAUVEGARDE */}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-black transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Enregistrer les modifications
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* SÉCURITÉ */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-400" />

                  <h2 className="text-lg font-bold">
                    Sécurité
                  </h2>
                </div>

                <p className="mt-1 text-sm text-zinc-500">
                  Gérez les méthodes de connexion associées à votre compte.
                </p>
              </div>

              {/* GOOGLE */}
              <div className="border-b border-white/10 pb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-black">
                        G
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          Compte Google
                        </p>

                        {customer.hasGoogleAccount ? (
                          <p className="mt-0.5 text-xs text-emerald-400">
                            Connecté à votre compte Kobas Tech
                          </p>
                        ) : (
                          <p className="mt-0.5 text-xs text-zinc-600">
                            Aucun compte Google connecté
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {!customer.hasGoogleAccount ? (
                    <button
                      type="button"
                      onClick={handleConnectGoogle}
                      disabled={connectingGoogle}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {connectingGoogle ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Connexion...
                        </>
                      ) : (
                        "Connecter Google"
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDisconnectGoogle}
                      disabled={
                        disconnectingGoogle ||
                        !customer.hasPassword
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 text-xs font-bold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      title={
                        !customer.hasPassword
                          ? "Définissez d'abord un mot de passe"
                          : undefined
                      }
                    >
                      {disconnectingGoogle ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Déconnexion...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" />
                          Déconnecter Google
                        </>
                      )}
                    </button>
                  )}
                </div>

                {!customer.hasGoogleAccount && (
                  <p className="mt-3 text-xs leading-5 text-zinc-600">
                    Vous pourrez utiliser votre compte Google pour vous
                    connecter rapidement à Kobas Tech.
                  </p>
                )}

                {customer.hasGoogleAccount &&
                  !customer.hasPassword && (
                    <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                      <p className="text-xs leading-5 text-amber-400">
                        Définissez un mot de passe avant de pouvoir
                        déconnecter Google. Cela permet de conserver une
                        méthode de connexion à votre compte.
                      </p>
                    </div>
                  )}

                {googleError && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

                    <p className="text-xs leading-5 text-red-400">
                      {googleError}
                    </p>
                  </div>
                )}

                {googleSuccess && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />

                    <p className="text-xs leading-5 text-emerald-400">
                      {googleSuccess}
                    </p>
                  </div>
                )}
              </div>

              {/* MOT DE PASSE */}
              <div className="pt-6">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-zinc-500" />

                  <h3 className="text-sm font-semibold">
                    Mot de passe
                  </h3>
                </div>

                <p className="mt-1 text-xs text-zinc-600">
                  {customer.hasPassword
                    ? "Modifiez votre mot de passe pour sécuriser votre compte."
                    : "Ajoutez un mot de passe pour disposer d'une méthode de connexion supplémentaire."}
                </p>

                <div className="mt-5 space-y-4">
                  {/* ANCIEN MOT DE PASSE */}
                  {customer.hasPassword && (
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-zinc-400">
                        Mot de passe actuel
                      </label>

                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 pr-11 text-sm outline-none transition focus:border-blue-500"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(!showPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 transition hover:text-zinc-300"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* NOUVEAU MOT DE PASSE */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-zinc-400">
                      {customer.hasPassword
                        ? "Nouveau mot de passe"
                        : "Créer un mot de passe"}
                    </label>

                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Minimum 8 caractères"
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
                    />
                  </div>

                  {/* CONFIRMATION */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-zinc-400">
                      Confirmer le mot de passe
                    </label>

                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition focus:border-blue-500"
                    />
                  </div>

                  {passwordError && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                      <p className="text-xs leading-5 text-red-400">
                        {passwordError}
                      </p>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />

                      <p className="text-xs leading-5 text-emerald-400">
                        {passwordSuccess}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-bold text-black transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4" />
                        {customer.hasPassword
                          ? "Modifier le mot de passe"
                          : "Créer le mot de passe"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMMANDES */}
        {tab === "commandes" && (
          <div className="mt-8">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-6 py-20 text-center">
                <Package className="mx-auto h-12 w-12 text-zinc-700" />

                <h2 className="mt-5 text-xl font-bold">
                  Aucune commande pour le moment
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">
                  Vos commandes apparaîtront ici une fois passées.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"
                  >
                    {/* INFOS COMMANDE */}
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold">
                          {order.orderNumber}
                        </p>

                        <p className="mt-1 text-xs text-zinc-600">
                          {new Date(
                            order.createdAt
                          ).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <PaymentBadge
                          status={order.paymentStatus}
                        />

                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-zinc-300">
                          {STATUS_LABELS[order.status] ||
                            order.status}
                        </span>
                      </div>
                    </div>

                    {/* ARTICLES */}
                    <div className="mt-4 divide-y divide-white/5 border-t border-white/5">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="py-3"
                        >
                          <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-zinc-400">
                              {item.quantity} × {item.name}
                            </span>

                            <span className="whitespace-nowrap text-zinc-300">
                              {item.total.toLocaleString(
                                "fr-FR"
                              )}{" "}
                              FCFA
                            </span>
                          </div>

                          {/* TÉLÉCHARGEMENT */}
                          {item.downloadUrl &&
                            order.paymentStatus === "PAID" ? (
                            <a
                              href={item.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Télécharger le fichier
                            </a>
                          ) : null}
                        </div>
                      ))}
                    </div>

                    {/* TOTAL */}
                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="text-sm text-zinc-500">
                        Total
                      </span>

                      <span className="text-lg font-bold">
                        {order.total.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
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

  return (
    <span className="inline-flex rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
      En attente
    </span>
  );
}
