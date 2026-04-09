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
        style={{
          width: "28px",
          height: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#10b981",
          border: "none",
          borderRadius: "4px",
          cursor: "not-allowed",
          color: "#fff",
          fontSize: "16px",
        }}
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
      style={{
        width: "28px",
        height: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#e5e7eb",
        border: "1px solid #d1d5db",
        borderRadius: "4px",
        cursor: isLoading ? "not-allowed" : "pointer",
        opacity: isLoading ? 0.5 : 1,
        fontSize: "16px",
      }}
      onMouseEnter={(e) => {
        if (!isLoading) (e.target as HTMLButtonElement).style.background = "#d1d5db";
      }}
      onMouseLeave={(e) => {
        if (!isLoading) (e.target as HTMLButtonElement).style.background = "#e5e7eb";
      }}
    >
      🛒
    </button>
  );
}
