"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  FolderTree,
  Image as ImageIcon,
  Loader2,
  Save,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function NouvelleCategoriePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [image, setImage] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError(
        "Le nom de la catégorie est obligatoire."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/categories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            description:
              description.trim() || null,
            image: image.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Impossible de créer la catégorie."
        );
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08090d]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-5xl items-center justify-between px-5 lg:px-8">
          <Link
            href="/admin"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600">
              <Zap className="h-5 w-5 fill-white" />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight">
                KOBAS
              </p>

              <p className="-mt-1 text-[9px] font-semibold tracking-[0.28em] text-blue-400">
                TECH ADMIN
              </p>
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux catégories
          </Link>
        </div>
      </header>

      {/* CONTENU */}
      <section className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
            Catalogue
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Nouvelle catégorie
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Créez une nouvelle catégorie pour
            organiser vos produits.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]"
        >
          {/* FORMULAIRE */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
            <div className="space-y-6">
              {/* NOM */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold"
                >
                  Nom de la catégorie
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Ex. Gaming"
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500 disabled:opacity-50"
                />

                <p className="mt-2 text-xs text-zinc-600">
                  Le slug sera généré automatiquement
                  à partir du nom.
                </p>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Décrivez cette catégorie..."
                  rows={5}
                  disabled={loading}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              {/* IMAGE */}
              <div>
                <label
                  htmlFor="image"
                  className="mb-2 block text-sm font-semibold"
                >
                  URL de l&apos;image
                </label>

                <div className="relative">
                  <ImageIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

                  <input
                    id="image"
                    type="url"
                    value={image}
                    onChange={(event) =>
                      setImage(
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500 disabled:opacity-50"
                  />
                </div>

                <p className="mt-2 text-xs text-zinc-600">
                  Vous pourrez remplacer cette image
                  ultérieurement.
                </p>
              </div>

              {/* ERREUR */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <p className="text-sm text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-white/5 pt-6 sm:flex-row sm:justify-end">
                <Link
                  href="/admin/categories"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
                >
                  Annuler
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-black transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Créer la catégorie
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* APERÇU */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
                Aperçu
              </p>

              <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e14]">
                <div className="flex aspect-video items-center justify-center overflow-hidden bg-gradient-to-br from-blue-950/40 to-violet-950/30">
                  {image.trim() ? (
                    <img
                      src={image}
                      alt="Aperçu"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FolderTree className="h-12 w-12 text-blue-400/50" />
                  )}
                </div>

                <div className="p-5">
                  <h2 className="font-bold">
                    {name.trim() ||
                      "Nom de la catégorie"}
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-zinc-600">
                    {description.trim() ||
                      "La description de la catégorie apparaîtra ici."}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">
                <p className="text-xs leading-5 text-zinc-500">
                  Cette catégorie sera immédiatement
                  disponible lors de la création ou de
                  la modification d&apos;un produit.
                </p>
              </div>
            </div>
          </aside>
        </form>
      </section>
    </main>
  );
}