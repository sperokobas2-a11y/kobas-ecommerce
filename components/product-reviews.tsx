"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Star } from "lucide-react";

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
  };
};

type ProductReviewsProps = {
  productId: string;
};

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { status } = useSession();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  async function loadReviews() {
    try {
      setLoading(true);

      const response = await fetch(`/api/products/${productId}/reviews`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
      }
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    setError("");
    setSuccess(false);

    if (rating === 0) {
      setError("Veuillez choisir une note.");
      return;
    }

    if (!comment.trim()) {
      setError("Veuillez écrire un commentaire.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible d'enregistrer l'avis.");
      }

      setSuccess(true);
      setRating(0);
      setComment("");
      loadReviews();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-16 border-t border-white/10 pt-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Avis clients</h2>

        {totalReviews > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-zinc-700"
                  }`}
                />
              ))}
            </div>

            <span className="text-sm font-semibold">
              {averageRating.toFixed(1)}
            </span>

            <span className="text-sm text-zinc-500">
              ({totalReviews} avis)
            </span>
          </div>
        )}
      </div>

      {/* FORMULAIRE */}
      {status === "authenticated" ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
          <h3 className="text-sm font-bold">Laisser un avis</h3>

          <div className="mt-4 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
              >
                <Star
                  className={`h-7 w-7 transition ${
                    star <= (hoverRating || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-zinc-700"
                  }`}
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience avec ce produit..."
            rows={3}
            className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-zinc-700 focus:border-blue-500"
          />

          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}

          {success && (
            <p className="mt-3 text-sm text-emerald-400">
              Merci pour votre avis !
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-black transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Publier l'avis"
            )}
          </button>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-6 text-center">
          <p className="text-sm text-zinc-500">
            <a href="/connexion" className="text-blue-400 hover:underline">
              Connectez-vous
            </a>{" "}
            pour laisser un avis sur ce produit.
          </p>
        </div>
      )}

      {/* LISTE DES AVIS */}
      <div className="mt-8 space-y-5">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-zinc-600">
            Aucun avis pour ce produit pour le moment. Soyez le premier à en
            laisser un !
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-violet-600/20 text-xs font-bold text-blue-300">
                    {review.customer.firstName?.[0]}
                    {review.customer.lastName?.[0]}
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      {review.customer.firstName}{" "}
                      {review.customer.lastName?.[0]}.
                    </p>

                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-zinc-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <span className="text-xs text-zinc-600">
                  {new Date(review.createdAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {review.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
