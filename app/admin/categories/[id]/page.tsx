"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FolderTree,
  Image as ImageIcon,
  Loader2,
  Save,
  Zap,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
  };
};

export default function ModifierCategoriePage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [category, setCategory] =
    useState<Category | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [image, setImage] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCategory() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/categories/${id}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Impossible de charger la catégorie."
          );
        }

        if (cancelled) {
          return;
        }

        setCategory(data.category);
        setName(data.category.name || "");
        setDescription(
          data.category.description || ""
        );
        setImage(data.category.image || "");
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Une erreur est survenue."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadCategory();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

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
      setSaving(true);

      const response = await fetch(
        `/api/admin/categories/${id}`,
        {
          method: "PUT",
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
            "Impossible de modifier la catégorie."
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
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08090d] text-white">
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
          Chargement de la catégorie...
        </div>
      </main>
    );
  }

  if (error && !category) {
    return (
      <main className="min-h-screen bg-[#08090d] px-5 py-20 text-white">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <p className="text-sm text-red-400">
            {error}
          </p>

          <Link
            href="/admin/categories"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux catégories
          </Link>
        </div>
      </main>
    );
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
            Modifier la catégorie
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Modifiez les informations de votre
            catégorie.
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
                  disabled={saving}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition focus:border-blue-500 disabled:opacity-50"
                />

                <p className="mt-2 text-xs text-zinc-600">
                  Le slug sera automatiquement
                  recalculé à partir du nom.
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
                  rows={5}
                  disabled={saving}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:opacity-50"
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
                    disabled={saving}
                    placeholder="https://..."
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500 disabled:opacity-50"
                  />
                </div>
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
                  disabled={saving}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-black transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Enregistrer
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
                      alt={name || "Catégorie"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FolderTree className="h-12 w-12 text-blue-400/50" />
                  )}
                </div>

                <div className="p-5">
                  <h2 className="font-bold">
                    {name ||
                      "Nom de la catégorie"}
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-zinc-600">
                    {description ||
                      "La description apparaîtra ici."}
                  </p>

                  {category && (
                    <div className="mt-4 border-t border-white/5 pt-4">
                      <p className="text-xs text-zinc-600">
                        Produits associés
                      </p>

                      <p className="mt-1 text-lg font-bold text-blue-400">
                        {category._count.products}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </form>
      </section>
    </main>
  );
}