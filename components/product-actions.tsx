```tsx
"use client";

import { useState } from "react";

import ProductQuantity from "@/components/product-quantity";
import AddToCartButton from "@/components/add-to-cart-button";
import BuyNowButton from "@/components/buy-now-button";

type ProductActionsProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
  };
};

export default function ProductActions({
  product,
}: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);

  return (
    <>
      {/* QUANTITÉ */}
      <div className="mt-8">
        <p className="mb-3 text-sm font-medium text-white">
          Quantité
        </p>

        <ProductQuantity
          quantity={quantity}
          stock={product.stock}
          onChange={setQuantity}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <AddToCartButton
          product={product}
          quantity={quantity}
        />

        <BuyNowButton
          product={product}
          quantity={quantity}
        />
      </div>
    </>
  );
}
```
