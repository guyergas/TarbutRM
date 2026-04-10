"use client";

import { useState } from "react";
import { addToCartAction } from "./cartActions";

interface AddToCartButtonProps {
  itemId: string;
  quantity: number;
  onSuccess?: () => void;
}

export function AddToCartButton({
  itemId,
  quantity,
  onSuccess,
}: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await addToCartAction(itemId, quantity);
      setIsAdded(true);
      onSuccess?.();
      // Dispatch custom event to notify cart icon
      window.dispatchEvent(new CustomEvent("cartItemAdded", { detail: { quantity } }));
      // Reset "added" state after 2 seconds
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Failed to add item to cart");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAdded) {
    return (
      <button
        disabled
        title="Added to cart"
        className="w-7 h-7 flex items-center justify-center bg-green-600 dark:bg-green-700 border-none rounded text-white text-base cursor-not-allowed"
      >
        ✓
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading}
      title="Add to cart"
      className={`w-7 h-7 flex items-center justify-center bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-base text-gray-600 dark:text-gray-400 transition-colors ${
        isLoading
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:bg-gray-900 dark:hover:bg-gray-900"
      }`}
    >
      🛒
    </button>
  );
}
