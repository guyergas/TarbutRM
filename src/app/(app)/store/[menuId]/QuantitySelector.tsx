"use client";

import { useState } from "react";

interface QuantitySelectorProps {
  onQuantityChange: (quantity: number) => void;
  initialQuantity?: number;
}

export function QuantitySelector({
  onQuantityChange,
  initialQuantity = 1,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleDecrease = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity);
    }
  };

  const handleIncrease = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onQuantityChange(newQuantity);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setQuantity(value);
    onQuantityChange(value);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <button
        onClick={handleDecrease}
        disabled={quantity <= 1}
        style={{
          width: "28px",
          height: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e5e7eb",
          border: "1px solid #d1d5db",
          borderRadius: "4px",
          cursor: quantity <= 1 ? "not-allowed" : "pointer",
          opacity: quantity <= 1 ? 0.5 : 1,
          fontSize: "16px",
          fontWeight: "600",
        }}
      >
        −
      </button>
      <input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        min="1"
        style={{
          width: "38px",
          textAlign: "center",
          border: "1px solid #d1d5db",
          borderRadius: "4px",
          padding: "4px 2px",
          fontSize: "14px",
        }}
      />
      <button
        onClick={handleIncrease}
        style={{
          width: "28px",
          height: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e5e7eb",
          border: "1px solid #d1d5db",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "600",
        }}
      >
        +
      </button>
    </div>
  );
}
