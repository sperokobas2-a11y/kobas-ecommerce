"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";

type AddToCartButtonProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
  };
};

export default function AddToCartButton({
  product,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);

  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    console.log("Produit ajouté :", product);

    addItem(product);
    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={product.stock <= 0}
      className={`flex h-13 flex-1 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold transition ${
        added
          ? "bg-emerald-500 text-white"
          : "bg-white text-black hover:bg-blue-400"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" />
          Ajouté au panier
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          {product.stock > 0
            ? "Ajouter au panier"
            : "Indisponible"}
        </>
      )}
    </button>
  );
}