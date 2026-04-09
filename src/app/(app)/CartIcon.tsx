"use client";

import { useState } from "react";
import CartModal from "./CartModal";

interface CartIconProps {
  initialCount: number;
}

export default function CartIcon({ initialCount }: CartIconProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [itemCount, setItemCount] = useState(initialCount);

  return (
    <>
      {/* Cart Icon Button */}
      <button
        onClick={() => setIsOpen(true)}
        title="Cart"
        style={{
          display: "flex",
          alignItems: "center",
          position: "relative",
          color: "#374151",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {itemCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              background: "#ef4444",
              color: "#fff",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "700",
            }}
          >
            {itemCount}
          </span>
        )}
      </button>

      {/* Cart Modal */}
      {isOpen && (
        <CartModal
          onClose={() => setIsOpen(false)}
          onItemCountChange={setItemCount}
        />
      )}
    </>
  );
}
