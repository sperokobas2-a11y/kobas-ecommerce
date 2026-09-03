"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Download,
  ImagePlus,
  Loader2,
  Package,
  Save,
  Zap,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
};

export default function NouveauProduitPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [stock, setStock] = useState("0");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(
          "/api/admin/categories"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Impossible de charger les catégories."
          );
        }

        setCategories(data.categories);

        if (data.categories.length > 0) {
          setCategoryId(data.categories[0].id);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les catégories."
        );
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      if (!categoryId) {
        throw new Error(
          "Veuillez sélectionner une catégorie."
        );
      }

      const response = await fetch(
        "/api/admin/products",
        {
          method: "POST",
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
            downloadUrl: downloadUrl || null,
            featured,
            active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Impossible de créer le produit."
        );
      }

      window.location.href = "/admin/produits";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );

      setSaving(false);
    }
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
            Ajouter un produit
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Ajoutez un nouveau produit à votre boutique.
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
                  Informations principales affichées
                  dans la boutique.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <Field
                label="Nom du produit"
                required
                value={name}
                onChange={setName}
                placeholder="Ex. Pack Télé Premium"
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
                  placeholder="Décrivez votre produit..."
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
                  placeholder="40000"
                />

                <Field
                  label="Prix avant réduction"
                  type="number"
                  min="0"
                  value={comparePrice}
                  onChange={setComparePrice}
                  placeholder="50000"
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
                placeholder="10"
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
                  disabled={loadingCategories}
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#111218] px-4 text-sm text-white outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  {loadingCategories ? (
                    <option>
                      Chargement...
                    </option>
                  ) : categories.length === 0 ? (
                    <option value="">
                      Aucune catégorie
                    </option>
                  ) : (
                    categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))
                  )}
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
                  Pour l&apos;instant, utilisez l&apos;URL d&apos;une
                  image.
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
            </div>
          </section>

          {/* TÉLÉCHARGEMENT */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-emerald-400" />

              <div>
                <h2 className="font-bold">
                  Fichier téléchargeable (optionnel)
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  Pour un produit numérique. Le client recevra ce lien
                  après confirmation du paiement.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Field
                label="Lien de téléchargement"
                value={downloadUrl}
                onChange={setDownloadUrl}
                placeholder="https://gofile.io/d/..."
              />
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
                description="Le produit sera visible dans la boutique."
              />

              <Toggle
                checked={featured}
                onChange={setFeatured}
                title="Produit mis en avant"
                description="Le produit pourra apparaître dans les produits recommandés."
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
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/produits"
              className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={saving || loadingCategories}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-black transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Créer le produit
                </>
              )}
            </button>
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
          <span className="ml-1 text-blue-400">*</span>
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
    <label className="flex cursor-pointer items-center justify-between gap-5 rounded-xl border border-white/5 bg-white/[0.02] p-4">
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
    </label>
  );
}
