```tsx
"use client";

import { Minus, Plus } from "lucide-react";

type ProductQuantityProps = {
  quantity: number;
  stock: number;
  onChange: (quantity: number) => void;
};

export default function ProductQuantity({
  quantity,
  stock,
  onChange,
}: ProductQuantityProps) {
  function decrease() {
    onChange(Math.max(1, quantity - 1));
  }

  function increase() {
    onChange(Math.min(stock, quantity + 1));
  }

  return (
    <div className="flex h-12 w-fit items-center rounded-xl border border-white/10 bg-zinc-900">
      <button
        type="button"
        onClick={decrease}
        disabled={quantity <= 1}
        className="flex h-full w-12 items-center justify-center text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Diminuer la quantité"
      >
        <Minus className="h-4 w-4" />
      </button>

      <span className="flex w-12 justify-center font-medium text-white">
        {quantity}
      </span>

      <button
        type="button"
        onClick={increase}
        disabled={quantity >= stock}
        className="flex h-full w-12 items-center justify-center text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Augmenter la quantité"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
```
