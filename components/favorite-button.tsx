"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";

type FavoriteButtonProps = {
  productId: string;
  variant?: "icon" | "full";
};

export default function FavoriteButton({
  productId,
  variant = "icon",
}: FavoriteButtonProps) {
  const { status } = useSession();
  const router = useRouter();

  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") {
      setChecking(false);
      return;
    }

    let cancelled = false;

    async function checkFavorite() {
      try {
        const response = await fetch("/api/favorites", {
          cache: "no-store",
        });

        const data = await response.json();

        if (cancelled) return;

        if (response.ok) {
          const favorited = data.favorites?.some(
            (fav: { productId: string }) => fav.productId === productId
          );
          setIsFavorite(Boolean(favorited));
        }
      } catch {
        // silencieux
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    checkFavorite();

    return () => {
      cancelled = true;
    };
  }, [status, productId]);

  async function toggleFavorite(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (status !== "authenticated") {
      router.push("/connexion");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsFavorite(data.favorited);
      }
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={toggleFavorite}
        disabled={loading || checking}
        className={`flex h-13 items-center justify-center gap-2 rounded-xl border px-6 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
          isFavorite
            ? "border-red-500/30 bg-red-500/10 text-red-400"
            : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
        }`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart
            className={`h-4 w-4 ${isFavorite ? "fill-red-400" : ""}`}
          />
        )}
        {isFavorite ? "Retiré des favoris" : "Ajouter aux favoris"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={loading || checking}
      aria-label={
        isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"
      }
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-zinc-300 backdrop-blur-xl transition hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={`h-4 w-4 transition ${
            isFavorite ? "fill-red-400 text-red-400" : ""
          }`}
        />
      )}
    </button>
  );
}
