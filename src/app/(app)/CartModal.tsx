"use client";

import { useEffect, useState } from "react";
import ItemModal from "./ItemModal";
import { cartService } from "@/modules/cart";
import {
  removeFromCartAction,
  updateQuantityAction,
} from "./store/[menuId]/cartActions";

interface CartItem {
  cartItemId: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  cost: number;
  archived: boolean;
  description?: string;
  image?: string;
}

interface CartModalProps {
  onClose: () => void;
  onItemCountChange: (count: number) => void;
  initialData?: {
    items: CartItem[];
    totalCost: number;
    itemCount: number;
  } | null;
}

export default function CartModal({
  onClose,
  onItemCountChange,
  initialData,
}: CartModalProps) {
  const [items, setItems] = useState<CartItem[]>(initialData?.items || []);
  const [totalCost, setTotalCost] = useState(initialData?.totalCost || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);

  // Load cart on mount only if initialData not provided
  useEffect(() => {
    if (initialData) {
      onItemCountChange(initialData.items.length);
      return;
    }

    const loadCart = async () => {
      try {
        const response = await fetch("/api/cart", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          const data = await response.json();
          setItems(data.items);
          setTotalCost(data.totalCost);
          onItemCountChange(data.items.length);
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    };

    loadCart();
  }, [initialData, onItemCountChange]);

  const handleRemoveItem = async (itemId: string) => {
    setIsLoading(true);
    try {
      await removeFromCartAction(itemId);
      const updatedItems = items.filter((item) => item.itemId !== itemId);
      setItems(updatedItems);
      setTotalCost(
        updatedItems.reduce((sum, item) => sum + item.cost, 0)
      );
      onItemCountChange(updatedItems.length);
    } catch (error) {
      console.error("Failed to remove item:", error);
      alert("Failed to remove item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(itemId);
      return;
    }

    setIsLoading(true);
    try {
      await updateQuantityAction(itemId, newQuantity);
      const updatedItems = items.map((item) =>
        item.itemId === itemId
          ? {
              ...item,
              quantity: newQuantity,
              cost: item.price * newQuantity,
            }
          : item
      );
      setItems(updatedItems);
      setTotalCost(updatedItems.reduce((sum, item) => sum + item.cost, 0));
    } catch (error) {
      console.error("Failed to update quantity:", error);
      alert("Failed to update quantity");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
          zIndex: 100,
        }}
      />

      {/* Modal Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "100%",
          maxWidth: "480px",
          background: "#fff",
          boxShadow: "2px 0 12px rgba(0,0,0,0.15)",
          zIndex: 101,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          direction: "rtl",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 18 }}>סל קניות</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              cursor: "pointer",
              fontSize: 22,
              lineHeight: 1,
              color: "#374151",
              background: "none",
              border: "none",
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ flex: 1, padding: "16px 20px", overflowY: "auto" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", color: "#6b7280", paddingTop: "32px" }}>
              <p>סל הקניות שלך ריק</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {items.map((item) => (
                <div
                  key={item.itemId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    opacity: item.archived ? 0.6 : 1,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <button
                      onClick={() => setSelectedItem(item)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#3b82f6",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0,
                        fontWeight: "600",
                        marginBottom: "4px",
                        display: "block",
                        fontSize: "inherit",
                      }}
                    >
                      {item.name}
                    </button>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "12px",
                        color: "#6b7280",
                      }}
                    >
                      <span>{item.price} ₪</span>
                      <span>×</span>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          handleUpdateQuantity(item.itemId, val);
                        }}
                        min="1"
                        style={{
                          width: "40px",
                          textAlign: "center",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          padding: "4px",
                        }}
                      />
                      <span>=</span>
                      <span style={{ fontWeight: "600" }}>{item.cost} ₪</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.itemId)}
                    disabled={isLoading}
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
                      fontSize: "14px",
                      marginRight: "12px",
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) (e.target as HTMLButtonElement).style.background = "#d1d5db";
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) (e.target as HTMLButtonElement).style.background = "#e5e7eb";
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {items.length > 0 && (
          <div
            style={{
              padding: "16px 20px",
              borderTop: "1px solid #e5e7eb",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              <span>סה"כ:</span>
              <span>{totalCost.toFixed(2)} ₪</span>
            </div>
            <button
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                background: "#059669",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                textAlign: "center",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              לתשלום
            </button>
          </div>
        )}
      </div>

      {/* Item Modal */}
      {selectedItem && (
        <ItemModal
          item={{
            id: selectedItem.itemId,
            name: selectedItem.name,
            price: selectedItem.price,
            description: selectedItem.description,
            image: selectedItem.image,
          }}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
