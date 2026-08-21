"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Edit3,
  FolderTree,
  Loader2,
  Plus,
  Search,
  Trash2,
  Zap,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  createdAt: string;
  _count: {
    products: number;
  };
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<
    string | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/admin/categories",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Impossible de charger les catégories."
          );
        }

        if (!cancelled) {
          setCategories(data.categories || []);
        }
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

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  async function deleteCategory(
    category: Category
  ) {
    if (category._count.products > 0) {
      window.alert(
        `Impossible de supprimer "${category.name}" car elle contient ${category._count.products} produit(s).`
      );
      return;
    }

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer "${category.name}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(category.id);

      const response = await fetch(
        `/api/admin/categories/${category.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Impossible de supprimer la catégorie."
        );
      }

      setCategories((current) =>
        current.filter(
          (item) => item.id !== category.id
        )
      );
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer la catégorie."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter(
      (category) =>
        category.name
          .toLowerCase()
          .includes(query) ||
        category.slug
          .toLowerCase()
          .includes(query) ||
        Boolean(
          category.description
            ?.toLowerCase()
            .includes(query)
        )
    );
  }, [categories, search]);

  const totalProducts = categories.reduce(
    (total, category) =>
      total + category._count.products,
    0
  );

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08090d]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
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
            href="/admin"
            className="flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Tableau de bord
          </Link>
        </div>
      </header>

      {/* CONTENU */}
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        {/* TITRE */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
              Catalogue
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Catégories
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Organisez les produits de votre boutique.
            </p>
          </div>

          <Link
            href="/admin/categories/nouveau"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-black transition hover:bg-blue-400"
          >
            <Plus className="h-4 w-4" />
            Ajouter une catégorie
          </Link>
        </div>

        {/* STATISTIQUES */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <FolderTree className="h-5 w-5" />
              </div>

              <span className="text-2xl font-black">
                {categories.length}
              </span>
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Catégories
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <FolderTree className="h-5 w-5" />
              </div>

              <span className="text-2xl font-black">
                {totalProducts}
              </span>
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Produits classés
            </p>
          </div>
        </div>

        {/* RECHERCHE */}
        <div className="mt-8">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Rechercher une catégorie..."
              className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
            />
          </div>
        </div>

        {/* ERREUR */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* CONTENU */}
        {loading ? (
          <div className="mt-8 flex min-h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025]">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
              Chargement des catégories...
            </div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] px-6 py-20 text-center">
            <FolderTree className="mx-auto h-12 w-12 text-zinc-700" />

            <h2 className="mt-5 text-xl font-bold">
              Aucune catégorie trouvée
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">
              {categories.length === 0
                ? "Votre boutique ne possède encore aucune catégorie."
                : "Aucune catégorie ne correspond à votre recherche."}
            </p>

            {categories.length === 0 && (
              <Link
                href="/admin/categories/nouveau"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-black"
              >
                <Plus className="h-4 w-4" />
                Ajouter une catégorie
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="border-b border-white/10 bg-white/[0.025]">
                  <tr className="text-xs uppercase tracking-wider text-zinc-600">
                    <th className="px-5 py-4 font-semibold">
                      Catégorie
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Slug
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Produits
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Description
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Créée le
                    </th>

                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {filteredCategories.map(
                    (category) => (
                      <tr
                        key={category.id}
                        className="transition hover:bg-white/[0.02]"
                      >
                        {/* NOM */}
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-blue-500/10 text-blue-400">
                              {category.image ? (
                                <img
                                  src={category.image}
                                  alt={category.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <FolderTree className="h-5 w-5" />
                              )}
                            </div>

                            <div>
                              <p className="text-sm font-semibold">
                                {category.name}
                              </p>

                              <p className="mt-1 text-xs text-zinc-600">
                                ID :{" "}
                                {category.id.slice(
                                  -8
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* SLUG */}
                        <td className="px-5 py-5">
                          <code className="rounded-md bg-white/5 px-2 py-1 text-xs text-zinc-500">
                            {category.slug}
                          </code>
                        </td>

                        {/* PRODUITS */}
                        <td className="px-5 py-5">
                          <span className="inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                            {category._count.products}{" "}
                            produit
                            {category._count.products !==
                            1
                              ? "s"
                              : ""}
                          </span>
                        </td>

                        {/* DESCRIPTION */}
                        <td className="max-w-[260px] px-5 py-5">
                          <p className="truncate text-sm text-zinc-500">
                            {category.description ||
                              "Aucune description"}
                          </p>
                        </td>

                        {/* DATE */}
                        <td className="px-5 py-5">
                          <span className="text-xs text-zinc-600">
                            {new Date(
                              category.createdAt
                            ).toLocaleDateString(
                              "fr-FR"
                            )}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-5 py-5">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/categories/${category.id}`}
                              aria-label={`Modifier ${category.name}`}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-500 transition hover:bg-blue-500/10 hover:text-blue-400"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                deleteCategory(
                                  category
                                )
                              }
                              disabled={
                                deletingId ===
                                  category.id ||
                                category._count
                                  .products > 0
                              }
                              aria-label={`Supprimer ${category.name}`}
                              title={
                                category._count
                                  .products > 0
                                  ? "Cette catégorie contient des produits"
                                  : "Supprimer"
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              {deletingId ===
                              category.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-white/5 px-5 py-4">
              <p className="text-xs text-zinc-600">
                {filteredCategories.length} catégorie
                {filteredCategories.length !== 1
                  ? "s"
                  : ""}{" "}
                affichée
                {filteredCategories.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}