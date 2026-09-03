"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

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

type Order = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items?: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
};

export default function ComptePage() {
  const router = useRouter();
  const { status } = useSession();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);
  const [showNewPassword, setShowNewPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [connectingGoogle, setConnectingGoogle] =
    useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/connexion");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    async function loadAccount() {
      try {
        setLoading(true);

        const [customerResponse, ordersResponse] =
          await Promise.all([
            fetch("/api/customers/me"),
            fetch("/api/customers/me/orders"),
          ]);

        if (!customerResponse.ok) {
          throw new Error(
            "Impossible de charger le profil."
          );
        }

        const customerData =
          await customerResponse.json();

        setCustomer(customerData.customer);

        setFirstName(customerData.customer.firstName || "");
        setLastName(customerData.customer.lastName || "");
        setWhatsapp(customerData.customer.whatsapp || "");
        setAddress(customerData.customer.address || "");
        setCity(customerData.customer.city || "");

        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();

          setOrders(ordersData.orders || []);
        }
      } catch (error) {
        console.error("Chargement du compte:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, [status]);

  async function handleSaveProfile(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSavingProfile(true);

      const response = await fetch(
        "/api/customers/me",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName,
            lastName,
            whatsapp,
            address,
            city,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Impossible de mettre à jour le profil."
        );
        return;
      }

      setCustomer(data.customer);

      alert("Profil mis à jour avec succès.");
    } catch (error) {
      console.error("Mise à jour du profil:", error);

      alert(
        "Une erreur est survenue lors de la mise à jour du profil."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (newPassword.length < 8) {
      alert(
        "Le nouveau mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Les deux nouveaux mots de passe ne correspondent pas.");
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
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Impossible de modifier le mot de passe."
        );
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setCustomer((previous) =>
        previous
          ? {
              ...previous,
              hasPassword: true,
            }
          : previous
      );

      alert("Mot de passe modifié avec succès.");
    } catch (error) {
      console.error(
        "Modification du mot de passe:",
        error
      );

      alert(
        "Une erreur est survenue lors de la modification du mot de passe."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleConnectGoogle() {
    try {
      setConnectingGoogle(true);

      const response = await fetch(
        "/api/customers/me/google/link",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Impossible de préparer la connexion Google."
        );

        setConnectingGoogle(false);
        return;
      }

      await signIn("google", {
        callbackUrl: "/compte",
      });
    } catch (error) {
      console.error("Liaison Google:", error);

      alert(
        "Une erreur est survenue lors de la liaison du compte Google."
      );

      setConnectingGoogle(false);
    }
  }

  async function handleDisconnectGoogle() {
    if (!customer?.hasGoogleAccount) {
      return;
    }

    if (!customer.hasPassword) {
      alert(
        "Définissez d'abord un mot de passe avant de déconnecter votre compte Google."
      );
      return;
    }

    const confirmed = window.confirm(
      "Voulez-vous vraiment déconnecter votre compte Google ?\n\nVous pourrez toujours vous connecter avec votre adresse e-mail et votre mot de passe."
    );

    if (!confirmed) {
      return;
    }

    try {
      setConnectingGoogle(true);

      const response = await fetch(
        "/api/customers/me/google/unlink",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Impossible de déconnecter le compte Google."
        );
        return;
      }

      const customerResponse = await fetch(
        "/api/customers/me"
      );

      if (customerResponse.ok) {
        const customerData =
          await customerResponse.json();

        setCustomer(customerData.customer);
      }

      alert("Compte Google déconnecté avec succès.");
    } catch (error) {
      console.error(
        "Déconnexion Google:",
        error
      );

      alert(
        "Une erreur est survenue lors de la déconnexion du compte Google."
      );
    } finally {
      setConnectingGoogle(false);
    }
  }

  async function handleLogout() {
    await signOut({
      callbackUrl: "/",
    });
  }

  if (
    status === "loading" ||
    loading
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement de votre compte...</span>
        </div>
      </main>
    );
  }

  if (!customer) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />

          <h1 className="text-xl font-bold text-slate-900">
            Impossible de charger votre compte
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Veuillez vous reconnecter puis réessayer.
          </p>

          <button
            type="button"
            onClick={() => router.push("/connexion")}
            className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Se connecter
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Kobas Tech
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Mon compte
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Gérez votre profil, votre sécurité et vos commandes.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Colonne principale */}
          <div className="space-y-6 lg:col-span-2">
            {/* Profil */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <User className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Informations personnelles
                  </h2>

                  <p className="text-sm text-slate-500">
                    Modifiez vos informations de contact.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSaveProfile}
                className="space-y-5"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Prénom
                    </label>

                    <input
                      type="text"
                      value={firstName}
                      onChange={(event) =>
                        setFirstName(event.target.value)
                      }
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Nom
                    </label>

                    <input
                      type="text"
                      value={lastName}
                      onChange={(event) =>
                        setLastName(event.target.value)
                      }
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Mail className="h-4 w-4" />
                    Adresse e-mail
                  </label>

                  <input
                    type="email"
                    value={customer.email}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Phone className="h-4 w-4" />
                    WhatsApp
                  </label>

                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(event) =>
                      setWhatsapp(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <MapPin className="h-4 w-4" />
                    Adresse
                  </label>

                  <input
                    type="text"
                    value={address}
                    onChange={(event) =>
                      setAddress(event.target.value)
                    }
                    placeholder="Votre adresse"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Ville
                  </label>

                  <input
                    type="text"
                    value={city}
                    onChange={(event) =>
                      setCity(event.target.value)
                    }
                    placeholder="Votre ville"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingProfile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}

                  {savingProfile
                    ? "Enregistrement..."
                    : "Enregistrer les modifications"}
                </button>
              </form>
            </section>

            {/* Sécurité */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Sécurité
                  </h2>

                  <p className="text-sm text-slate-500">
                    Gérez les méthodes d'accès à votre compte.
                  </p>
                </div>
              </div>

              {/* Mot de passe */}
              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="mb-5 flex items-start gap-3">
                  <KeyRound className="mt-0.5 h-5 w-5 text-slate-600" />

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {customer.hasPassword
                        ? "Modifier mon mot de passe"
                        : "Créer mon mot de passe"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {customer.hasPassword
                        ? "Utilisez un mot de passe unique et difficile à deviner."
                        : "Ajoutez un mot de passe pour disposer d'une méthode de connexion supplémentaire."}
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleChangePassword}
                  className="space-y-4"
                >
                  {customer.hasPassword && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Ancien mot de passe
                      </label>

                      <div className="relative">
                        <input
                          type={
                            showCurrentPassword
                              ? "text"
                              : "password"
                          }
                          value={currentPassword}
                          onChange={(event) =>
                            setCurrentPassword(
                              event.target.value
                            )
                          }
                          required
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(
                              !showCurrentPassword
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Nouveau mot de passe
                    </label>

                    <div className="relative">
                      <input
                        type={
                          showNewPassword
                            ? "text"
                            : "password"
                        }
                        value={newPassword}
                        onChange={(event) =>
                          setNewPassword(
                            event.target.value
                          )
                        }
                        minLength={8}
                        required
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowNewPassword(
                            !showNewPassword
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Confirmer le nouveau mot de passe
                    </label>

                    <div className="relative">
                      <input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(
                            event.target.value
                          )
                        }
                        minLength={8}
                        required
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {changingPassword ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="h-4 w-4" />
                    )}

                    {changingPassword
                      ? "Enregistrement..."
                      : customer.hasPassword
                        ? "Modifier le mot de passe"
                        : "Créer mon mot de passe"}
                  </button>
                </form>
              </div>

              {/* Google */}
              <div className="mt-5 rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <path
                        fill="#4285F4"
                        d="M21.35 12.27c0-.79-.07-1.55-.22-2.27H12v4.3h5.22a4.46 4.46 0 0 1-1.94 2.93v2.44h3.14c1.84-1.69 2.93-4.18 2.93-7.4Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.29v2.52A9.74 9.74 0 0 0 12 21.5Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M6.54 13.6A5.86 5.86 0 0 1 6.23 12c0-.56.11-1.1.31-1.6V7.88H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.12l3.25-2.52Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 6.38c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.45 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.71 5.38l3.25 2.52C7.31 8.1 9.46 6.38 12 6.38Z"
                      />
                    </svg>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">
                      Compte Google
                    </h3>

                    {customer.hasGoogleAccount ? (
                      <>
                        <div className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Compte Google connecté
                        </div>

                        <p className="mt-2 break-all text-sm text-slate-500">
                          {customer.email}
                        </p>

                        {customer.hasPassword ? (
                          <p className="mt-3 text-sm text-slate-500">
                            Votre compte possède un mot de passe
                            et un compte Google. Vous pouvez
                            utiliser l'une ou l'autre méthode
                            pour vous connecter.
                          </p>
                        ) : (
                          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <p className="text-sm font-medium text-amber-800">
                              Ajoutez un mot de passe avant de
                              déconnecter Google.
                            </p>

                            <p className="mt-1 text-sm text-amber-700">
                              Cela garantit que vous conservez
                              un moyen d'accéder à votre compte.
                            </p>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleDisconnectGoogle}
                          disabled={
                            connectingGoogle ||
                            !customer.hasPassword
                          }
                          className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {connectingGoogle ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <LogOut className="h-4 w-4" />
                          )}

                          Déconnecter Google
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                          <XCircle className="h-4 w-4" />
                          Aucun compte Google connecté
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          Connectez votre compte Google pour
                          disposer d'une méthode de connexion
                          supplémentaire.
                        </p>

                        <button
                          type="button"
                          onClick={handleConnectGoogle}
                          disabled={connectingGoogle}
                          className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {connectingGoogle ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              aria-hidden="true"
                            >
                              <path
                                fill="#4285F4"
                                d="M21.35 12.27c0-.79-.07-1.55-.22-2.27H12v4.3h5.22a4.46 4.46 0 0 1-1.94 2.93v2.44h3.14c1.84-1.69 2.93-4.18 2.93-7.4Z"
                              />
                              <path
                                fill="#34A853"
                                d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.29v2.52A9.74 9.74 0 0 0 12 21.5Z"
                              />
                              <path
                                fill="#FBBC05"
                                d="M6.54 13.6A5.86 5.86 0 0 1 6.23 12c0-.56.11-1.1.31-1.6V7.88H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.12l3.25-2.52Z"
                              />
                              <path
                                fill="#EA4335"
                                d="M12 6.38c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.45 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.71 5.38l3.25 2.52C7.31 8.1 9.46 6.38 12 6.38Z"
                              />
                            </svg>
                          )}

                          {connectingGoogle
                            ? "Connexion..."
                            : "Connecter Google"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Colonne droite */}
          <div className="space-y-6">
            {/* Résumé */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <User className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Mon profil
                  </h2>

                  <p className="text-sm text-slate-500">
                    Résumé du compte
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Nom
                  </p>

                  <p className="mt-1 font-medium text-slate-800">
                    {customer.firstName} {customer.lastName}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    E-mail
                  </p>

                  <p className="mt-1 break-all text-sm text-slate-700">
                    {customer.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    WhatsApp
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {customer.whatsapp}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Localisation
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {[customer.city, customer.country]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            </section>

            {/* Commandes */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Package className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Mes commandes
                    </h2>

                    <p className="text-sm text-slate-500">
                      {orders.length} commande
                      {orders.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-5 text-center">
                  <ClipboardList className="mx-auto h-8 w-8 text-slate-400" />

                  <p className="mt-3 text-sm font-medium text-slate-700">
                    Aucune commande pour le moment.
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Vos futures commandes apparaîtront ici.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            Commande #{order.id}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(
                              order.createdAt
                            ).toLocaleDateString("fr-FR")}
                          </p>
                        </div>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {order.status}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          Total
                        </span>

                        <span className="font-bold text-slate-900">
                          {Number(order.total).toLocaleString(
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
          </div>
        </div>
      </div>
    </main>
  );
}
