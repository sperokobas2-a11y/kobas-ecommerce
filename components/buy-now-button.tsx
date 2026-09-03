"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";

import { useCartStore } from "@/lib/store/cart-store";

type BuyNowButtonProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
  };
};

export default function BuyNowButton({ product }: BuyNowButtonProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [loading, setLoading] = useState(false);

  function handleBuyNow() {
    setLoading(true);
    addItem(product);
    router.push("/commande");
  }

  return (
    <button
      type="button"
      onClick={handleBuyNow}
      disabled={product.stock <= 0 || loading}
      className="flex h-13 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          Acheter maintenant
          <ChevronRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}
