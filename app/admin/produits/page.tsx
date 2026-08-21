"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Eye,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
  Zap,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  sku: string | null;
  images: string[];
  featured: boolean;
  active: boolean;
  categoryId: string;
  category: Category;
  createdAt: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch("/api/admin/products", { cache: "no-store" }),
          fetch("/api/admin/categories", { cache: "no-store" }),
        ]);

        const productsData = await productsResponse.json();
        const categoriesData = await categoriesResponse.json();

        if (!productsResponse.ok) {
          throw new Error(
            productsData.error || "Impossible de charger les produits."
          );
        }

        if (!categoriesResponse.ok) {
          throw new Error(
            categoriesData.error || "Impossible de charger les catégories."
          );
        }

        if (cancelled) return;

        setProducts(productsData.products || []);
        setCategories(categoriesData.categories || []);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Une erreur est survenue."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer "${product.name}" ?\n\nCette action est irréversible.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(product.id);

      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Impossible de supprimer le produit."
        );
      }

      setProducts((current) =>
        current.filter((item) => item.id !== product.id)
      );
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer le produit."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.slug.toLowerCase().includes(normalizedSearch) ||
        Boolean(product.sku?.toLowerCase().includes(normalizedSearch));

      const matchesCategory =
        categoryFilter === "all" ||
        product.categoryId === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) => product.active
  ).length;

  const lowStockProducts = products.filter(
    (product) => product.stock > 0 && product.stock <= 5
  ).length;

  const outOfStockProducts = products.filter(
    (product) => product.stock <= 0
  ).length;

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      {/* TITRE */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
            Catalogue
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Produits
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Gérez les produits disponibles dans votre boutique.
          </p>
        </div>

        <Link
          href="/admin/produits/nouveau"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-black transition hover:bg-blue-400"
        >
          <Plus className="h-4 w-4" />
          Ajouter un produit
        </Link>
      </div>

      {/* STATISTIQUES */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Produits"
          value={totalProducts}
          icon={<Package className="h-5 w-5" />}
        />

        <StatCard
          label="Actifs"
          value={activeProducts}
          icon={<Eye className="h-5 w-5" />}
        />

        <StatCard
          label="Stock faible"
          value={lowStockProducts}
          icon={<Package className="h-5 w-5" />}
        />

        <StatCard
          label="Rupture"
          value={outOfStockProducts}
          icon={<Package className="h-5 w-5" />}
        />
      </div>

      {/* RECHERCHE */}
      <div className="mt-8 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un produit, un SKU..."
            className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="h-12 rounded-xl border border-white/10 bg-[#111218] px-4 text-sm text-zinc-300 outline-none focus:border-blue-500 md:w-64"
        >
          <option value="all">Toutes les catégories</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* CHARGEMENT */}
      {loading ? (
        <div className="mt-8 flex min-h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025]">
          <div className="flex items-center gap-3 text-sm text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
            Chargement des produits...
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] px-6 py-20 text-center">
          <Package className="mx-auto h-12 w-12 text-zinc-700" />

          <h2 className="mt-5 text-xl font-bold">Aucun produit trouvé</h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">
            {products.length === 0
              ? "Votre catalogue ne contient encore aucun produit."
              : "Aucun produit ne correspond à votre recherche."}
          </p>

          {products.length === 0 && (
            <Link
              href="/admin/produits/nouveau"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-black"
            >
              <Plus className="h-4 w-4" />
              Ajouter un produit
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.025]">
                <tr className="text-xs uppercase tracking-wider text-zinc-600">
                  <th className="px-5 py-4 font-semibold">Produit</th>
                  <th className="px-5 py-4 font-semibold">Catégorie</th>
                  <th className="px-5 py-4 font-semibold">Prix</th>
                  <th className="px-5 py-4 font-semibold">Stock</th>
                  <th className="px-5 py-4 font-semibold">Statut</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="transition hover:bg-white/[0.02]"
                  >
                    {/* PRODUIT */}
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900 to-blue-950/40">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Zap className="h-6 w-6 text-blue-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="max-w-[260px] truncate text-sm font-semibold">
                              {product.name}
                            </p>

                            {product.featured && (
                              <span className="rounded-md bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-400">
                                Vedette
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-zinc-600">
                            {product.sku
                              ? `SKU : ${product.sku}`
                              : `ID : ${product.id.slice(-8)}`}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CATÉGORIE */}
                    <td className="px-5 py-5">
                      <span className="text-sm text-zinc-400">
                        {product.category?.name || "Sans catégorie"}
                      </span>
                    </td>

                    {/* PRIX */}
                    <td className="px-5 py-5">
                      <p className="text-sm font-bold">
                        {product.price.toLocaleString("fr-FR")} FCFA
                      </p>

                      {product.comparePrice !== null && (
                        <p className="mt-1 text-xs text-zinc-600 line-through">
                          {product.comparePrice.toLocaleString("fr-FR")}{" "}
                          FCFA
                        </p>
                      )}
                    </td>

                    {/* STOCK */}
                    <td className="px-5 py-5">
                      <StockBadge stock={product.stock} />
                    </td>

                    {/* STATUT */}
                    <td className="px-5 py-5">
                      {product.active ? (
                        <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-zinc-500/10 px-3 py-1 text-xs font-semibold text-zinc-500">
                          Inactif
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-5">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/produit/${product.slug}`}
                          target="_blank"
                          aria-label={`Voir ${product.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-500 transition hover:bg-white/5 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        <Link
                          href={`/admin/produits/${product.id}`}
                          aria-label={`Modifier ${product.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-500 transition hover:bg-blue-500/10 hover:text-blue-400"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => deleteProduct(product)}
                          disabled={deletingId === product.id}
                          aria-label={`Supprimer ${product.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {deletingId === product.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-white/5 px-5 py-4">
            <p className="text-xs text-zinc-600">
              {filteredProducts.length} produit
              {filteredProducts.length !== 1 ? "s" : ""} affiché
              {filteredProducts.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          {icon}
        </div>

        <span className="text-2xl font-black">{value}</span>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-600">
        {label}
      </p>
    </div>
  );
}

/* =========================
   STOCK BADGE
========================= */

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
        Rupture
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span className="inline-flex rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
        {stock} restant{stock !== 1 ? "s" : ""}
      </span>
    );
  }

  return (
    <span className="text-sm font-medium text-zinc-400">
      {stock} en stock
    </span>
  );
}