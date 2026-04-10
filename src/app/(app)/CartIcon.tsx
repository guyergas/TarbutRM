"use client";

import { useState, useEffect } from "react";
import CartModal from "./CartModal";

interface CartItem {
  cartItemId: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  cost: number;
  archived: boolean;
}

interface CartIconProps {
  initialCount: number;
  userRole: "USER" | "STAFF" | "ADMIN";
}

export default function CartIcon({ initialCount, userRole }: CartIconProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [itemCount, setItemCount] = useState(initialCount);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalCost, setTotalCost] = useState(0);

  // Load cart data from API
  const loadCart = async () => {
    try {
      const response = await fetch("/api/cart", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items);
        setTotalCost(data.totalCost);
        setItemCount(data.items.length);
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    }
  };

  // Preload cart data on component mount
  useEffect(() => {
    loadCart();
  }, []);

  // Refetch cart when items are added to keep data in sync
  useEffect(() => {
    const handleCartItemAdded = () => {
      loadCart();
    };

    window.addEventListener("cartItemAdded", handleCartItemAdded);
    return () => window.removeEventListener("cartItemAdded", handleCartItemAdded);
  }, []);

  const handleCartUpdate = (items: CartItem[], total: number) => {
    setCartItems(items);
    setTotalCost(total);
    setItemCount(items.length);
  };

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
          color: "var(--text-secondary)",
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
          initialItems={cartItems}
          initialTotalCost={totalCost}
          userRole={userRole}
          onClose={() => setIsOpen(false)}
          onItemCountChange={setItemCount}
          onCartUpdate={handleCartUpdate}
        />
      )}
    </>
  );
}
