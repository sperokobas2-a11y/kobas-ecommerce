"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Mail,
  MailOpen,
  MessageSquare,
  Phone,
  Search,
  Trash2,
} from "lucide-react";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [ccInput, setCcInput] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/messages", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Impossible de charger les messages.");
        }

        if (cancelled) return;

        setMessages(data.messages || []);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Une erreur est survenue."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, []);

  async function openMessage(message: ContactMessage) {
    setSelected(message);
    setCcInput("");

    if (!message.read) {
      try {
        const response = await fetch(`/api/admin/messages/${message.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true }),
        });

        if (response.ok) {
          setMessages((current) =>
            current.map((item) =>
              item.id === message.id ? { ...item, read: true } : item
            )
          );
        }
      } catch {
        // silencieux : la lecture visuelle ne doit pas bloquer l'affichage
      }
    }
  }

  async function deleteMessage(message: ContactMessage) {
    const confirmed = window.confirm(
      `Supprimer le message de "${message.name}" ?\n\nCette action est irréversible.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(message.id);

      const response = await fetch(`/api/admin/messages/${message.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible de supprimer le message.");
      }

      setMessages((current) =>
        current.filter((item) => item.id !== message.id)
      );

      if (selected?.id === message.id) {
        setSelected(null);
      }
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Une erreur est survenue."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredMessages = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return messages;

    return messages.filter((msg) => {
      return (
        msg.name.toLowerCase().includes(normalizedSearch) ||
        msg.email.toLowerCase().includes(normalizedSearch) ||
        (msg.subject || "").toLowerCase().includes(normalizedSearch) ||
        msg.message.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [messages, search]);

  const unreadCount = messages.filter((m) => !m.read).length;

  const replyHref = selected
    ? `mailto:${selected.email}?subject=${encodeURIComponent(
        `Re: ${selected.subject || "Votre message"}`
      )}${
        ccInput.trim()
          ? `&cc=${encodeURIComponent(
              ccInput
                .split(",")
                .map((email) => email.trim())
                .filter(Boolean)
                .join(",")
            )}`
          : ""
      }`
    : "#";

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
            Communication
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Messages
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            {unreadCount > 0
              ? `${unreadCount} message${unreadCount !== 1 ? "s" : ""} non lu${
                  unreadCount !== 1 ? "s" : ""
                }`
              : "Tous les messages ont été lus."}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un nom, email, sujet..."
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
            Chargement des messages...
          </div>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] px-6 py-20 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-zinc-700" />

          <h2 className="mt-5 text-xl font-bold">Aucun message</h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">
            {messages.length === 0
              ? "Vous n'avez encore reçu aucun message de contact."
              : "Aucun message ne correspond à votre recherche."}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
          {/* LISTE */}
          <div className="space-y-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-2">
            {filteredMessages.map((msg) => {
              const isSelected = selected?.id === msg.id;

              return (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => openMessage(msg)}
                  className={`w-full rounded-xl px-4 py-3 text-left transition ${
                    isSelected
                      ? "bg-blue-500/10 border border-blue-500/30"
                      : "border border-transparent hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {msg.read ? (
                        <MailOpen className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                      ) : (
                        <Mail className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                      )}

                      <p
                        className={`truncate text-sm ${
                          msg.read ? "font-medium text-zinc-300" : "font-bold"
                        }`}
                      >
                        {msg.name}
                      </p>
                    </div>

                    <span className="shrink-0 text-[10px] text-zinc-600">
                      {new Date(msg.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-xs text-zinc-500">
                    {msg.subject || "Sans sujet"}
                  </p>

                  <p className="mt-1 line-clamp-1 text-xs text-zinc-600">
                    {msg.message}
                  </p>
                </button>
              );
            })}
          </div>

          {/* DÉTAIL */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            {!selected ? (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <MessageSquare className="h-10 w-10 text-zinc-700" />
                <p className="mt-4 text-sm text-zinc-600">
                  Sélectionnez un message pour le lire.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">
                      {selected.subject || "Sans sujet"}
                    </h2>

                    <p className="mt-2 text-sm text-zinc-500">
                      {new Date(selected.createdAt).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteMessage(selected)}
                    disabled={deletingId === selected.id}
                    aria-label="Supprimer le message"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                  >
                    {deletingId === selected.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-sm font-semibold">{selected.name}</p>

                  <a
                    href={`mailto:${selected.email}`}
                    className="mt-1 flex items-center gap-2 text-xs text-blue-400 hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {selected.email}
                  </a>

                  {selected.phone && (
                    <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                      <Phone className="h-3.5 w-3.5" />
                      {selected.phone}
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    Message
                  </p>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                    {selected.message}
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-zinc-400">
                      Copie (CC) — optionnel, séparez plusieurs adresses par
                      une virgule
                    </label>

                    <input
                      type="text"
                      value={ccInput}
                      onChange={(e) => setCcInput(e.target.value)}
                      placeholder="collegue@exemple.com, autre@exemple.com"
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
                    />
                  </div>

                  <a
                    href={replyHref}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-blue-400"
                  >
                    <Mail className="h-4 w-4" />
                    Répondre par e-mail
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}