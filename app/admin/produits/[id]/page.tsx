"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Package,
  Save,
  Trash2,
  Zap,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
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
};

export default function ModifierProduitPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id as string;

  const [product, setProduct] =
    useState<Product | null>(null);

  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [stock, setStock] = useState("0");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState("");
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [productResponse, categoriesResponse] =
          await Promise.all([
            fetch(`/api/admin/products/${productId}`),
            fetch("/api/admin/categories"),
          ]);

        const productData =
          await productResponse.json();

        const categoriesData =
          await categoriesResponse.json();

        if (!productResponse.ok) {
          throw new Error(
            productData.error ||
              "Impossible de charger le produit."
          );
        }

        if (!categoriesResponse.ok) {
          throw new Error(
            categoriesData.error ||
              "Impossible de charger les catégories."
          );
        }

        const currentProduct: Product =
          productData.product;

        setProduct(currentProduct);

        setCategories(
          categoriesData.categories
        );

        setName(currentProduct.name);
        setDescription(currentProduct.description);
        setPrice(String(currentProduct.price));

        setComparePrice(
          currentProduct.comparePrice !== null
            ? String(currentProduct.comparePrice)
            : ""
        );

        setStock(String(currentProduct.stock));

        setSku(currentProduct.sku || "");

        setCategoryId(
          currentProduct.categoryId
        );

        setImage(
          currentProduct.images?.[0] || ""
        );

        setFeatured(
          currentProduct.featured
        );

        setActive(currentProduct.active);
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

    if (productId) {
      loadData();
    }
  }, [productId]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      if (!name.trim()) {
        throw new Error(
          "Le nom du produit est obligatoire."
        );
      }

      if (!description.trim()) {
        throw new Error(
          "La description est obligatoire."
        );
      }

      if (!categoryId) {
        throw new Error(
          "Veuillez sélectionner une catégorie."
        );
      }

      const response = await fetch(
        `/api/admin/products/${productId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            price: Number(price),
            comparePrice: comparePrice
              ? Number(comparePrice)
              : null,
            stock: Number(stock),
            sku: sku || null,
            categoryId,
            images: image ? [image] : [],
            featured,
            active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Impossible de modifier le produit."
        );
      }

      router.push("/admin/produits");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );

      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer "${name}" ?\n\nCette action est irréversible.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(
        `/api/admin/products/${productId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Impossible de supprimer le produit."
        );
      }

      router.push("/admin/produits");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer le produit."
      );

      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08090d] text-white">
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
          Chargement du produit...
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#08090d] px-5 py-20 text-white">
        <div className="mx-auto max-w-xl text-center">
          <Package className="mx-auto h-12 w-12 text-zinc-700" />

          <h1 className="mt-5 text-2xl font-bold">
            Produit introuvable
          </h1>

          <p className="mt-2 text-sm text-zinc-600">
            Le produit demandé n&lsqo;existe pas ou a été supprimé.
          </p>

          <Link
            href="/admin/produits"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux produits
          </Link>
        </div>
      </main>
    );
  }

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
              <p className="text-lg font-bold">
                KOBAS
              </p>

              <p className="-mt-1 text-[9px] font-semibold tracking-[0.28em] text-blue-400">
                TECH ADMIN
              </p>
            </div>
          </Link>

          <Link
            href="/admin/produits"
            className="flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Produits
          </Link>
        </div>
      </header>

      {/* CONTENU */}
      <section className="mx-auto max-w-4xl px-5 py-10 lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
            Catalogue
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Modifier le produit
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Modifiez les informations de votre produit.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6"
        >
          {/* INFORMATIONS */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-blue-400" />

              <div>
                <h2 className="font-bold">
                  Informations du produit
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  Informations principales du produit.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <Field
                label="Nom du produit"
                required
                value={name}
                onChange={setName}
                placeholder="Nom du produit"
              />

              <div>
                <label className="mb-2 block text-xs font-semibold text-zinc-400">
                  Description
                </label>

                <textarea
                  required
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  rows={5}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Prix (FCFA)"
                  required
                  type="number"
                  min="0"
                  value={price}
                  onChange={setPrice}
                />

                <Field
                  label="Prix avant réduction"
                  type="number"
                  min="0"
                  value={comparePrice}
                  onChange={setComparePrice}
                />
              </div>
            </div>
          </section>

          {/* STOCK */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <h2 className="font-bold">
              Stock et identification
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              <Field
                label="Stock"
                required
                type="number"
                min="0"
                value={stock}
                onChange={setStock}
              />

              <Field
                label="SKU"
                value={sku}
                onChange={setSku}
                placeholder="KOB-001"
              />

              <div>
                <label className="mb-2 block text-xs font-semibold text-zinc-400">
                  Catégorie
                </label>

                <select
                  required
                  value={categoryId}
                  onChange={(event) =>
                    setCategoryId(event.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#111218] px-4 text-sm text-white outline-none focus:border-blue-500"
                >
                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* IMAGE */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="flex items-center gap-3">
              <ImagePlus className="h-5 w-5 text-violet-400" />

              <div>
                <h2 className="font-bold">
                  Image du produit
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  URL de l&apos;image principale.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Field
                label="URL de l'image"
                value={image}
                onChange={setImage}
                placeholder="https://..."
              />

              {image && (
                <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                  <img
                    src={image}
                    alt={name}
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}
            </div>
          </section>

          {/* OPTIONS */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <h2 className="font-bold">
              Options
            </h2>

            <div className="mt-6 space-y-4">
              <Toggle
                checked={active}
                onChange={setActive}
                title="Produit actif"
                description="Le produit est visible dans la boutique."
              />

              <Toggle
                checked={featured}
                onChange={setFeatured}
                title="Produit mis en avant"
                description="Le produit peut apparaître dans les recommandations."
              />
            </div>
          </section>

          {/* ERREUR */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}

              Supprimer
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin/produits"
                className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
              >
                Annuler
              </Link>

              <button
                type="submit"
                disabled={saving || deleting}
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
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}

/* =========================
   FIELD
========================= */

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  min?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-zinc-400">
        {label}
        {required && (
          <span className="ml-1 text-blue-400">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        min={min}
        required={required}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
      />
    </div>
  );
}

/* =========================
   TOGGLE
========================= */

function Toggle({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div>
        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="mt-1 text-xs text-zinc-600">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-blue-500"
            : "bg-zinc-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}