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
    <div className="flex items-center gap-1">
      <button
        onClick={handleDecrease}
        disabled={quantity <= 1}
        className={`w-7 h-7 flex items-center justify-center bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-base font-semibold text-gray-600 dark:text-gray-400 transition-colors ${
          quantity <= 1
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
        }`}
      >
        −
      </button>
      <input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        min="1"
        className="w-9 text-center border border-gray-300 dark:border-gray-600 rounded text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <button
        onClick={handleIncrease}
        className="w-7 h-7 flex items-center justify-center bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-base font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        +
      </button>
    </div>
  );
}
