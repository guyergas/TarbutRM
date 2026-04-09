"use client";

import { useState } from "react";
import ItemModal from "../ItemModal";
import {
  removeFromCartAction,
  updateQuantityAction,
  clearCartAction,
} from "@/app/(app)/store/[menuId]/cartActions";

interface CartItem {
  cartItemId: string;
  itemId: string;
  name: string;
  price: string | number;
  quantity: number;
  cost: string | number;
  archived: boolean;
  description?: string;
  image?: string;
}

interface CartData {
  items: CartItem[];
  totalCost: string | number;
  itemCount: number;
}

interface CartSummaryProps {
  cartData: CartData;
}

export default function CartSummary({ cartData }: CartSummaryProps) {
  const [items, setItems] = useState(cartData.items);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);

  const handleRemoveItem = async (itemId: string) => {
    setIsLoading(true);
    try {
      await removeFromCartAction(itemId);
      setItems(items.filter((item) => item.itemId !== itemId));
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
      setItems(
        items.map((item) =>
          item.itemId === itemId
            ? {
                ...item,
                quantity: newQuantity,
                cost: (item.price as number) * newQuantity,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Failed to update quantity:", error);
      alert("Failed to update quantity");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (confirm("Are you sure you want to clear the cart?")) {
      setIsLoading(true);
      try {
        await clearCartAction();
        setItems([]);
      } catch (error) {
        console.error("Failed to clear cart:", error);
        alert("Failed to clear cart");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const totalCost = items.reduce((sum, item) => {
    const cost = typeof item.cost === "string" ? parseFloat(item.cost) : item.cost;
    return sum + cost;
  }, 0);

  return (
    <div>
      {/* Warnings for archived items */}
      {items.some((item) => item.archived) && (
        <div
          style={{
            background: "#fef3c7",
            border: "1px solid #fcd34d",
            borderRadius: "4px",
            padding: "12px",
            marginBottom: "24px",
            color: "#92400e",
          }}
        >
          ⚠️ Some items in your cart are no longer available
        </div>
      )}

      {/* Items table */}
      <div
        style={{
          overflowX: "auto",
          marginBottom: "24px",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              <th
                style={{
                  textAlign: "right",
                  padding: "12px",
                  borderBottom: "1px solid #e5e7eb",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                פריט
              </th>
              <th
                style={{
                  textAlign: "center",
                  padding: "12px",
                  borderBottom: "1px solid #e5e7eb",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                מחיר
              </th>
              <th
                style={{
                  textAlign: "center",
                  padding: "12px",
                  borderBottom: "1px solid #e5e7eb",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                כמות
              </th>
              <th
                style={{
                  textAlign: "center",
                  padding: "12px",
                  borderBottom: "1px solid #e5e7eb",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                סכום
              </th>
              <th
                style={{
                  textAlign: "center",
                  padding: "12px",
                  borderBottom: "1px solid #e5e7eb",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                פעולות
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.itemId}
                style={{
                  borderBottom: "1px solid #e5e7eb",
                  opacity: item.archived ? 0.6 : 1,
                }}
              >
                <td
                  style={{
                    textAlign: "right",
                    padding: "12px",
                    color: "#1f2937",
                  }}
                >
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
                      fontSize: "inherit",
                    }}
                  >
                    {item.name}
                  </button>
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: "12px",
                    color: "#1f2937",
                  }}
                >
                  {item.price} ₪
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.itemId, item.quantity - 1)
                      }
                      disabled={isLoading || item.quantity <= 1}
                      style={{
                        width: "28px",
                        height: "28px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        background: "#fff",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        opacity: isLoading ? 0.5 : 1,
                      }}
                    >
                      −
                    </button>
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
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.itemId, item.quantity + 1)
                      }
                      disabled={isLoading}
                      style={{
                        width: "28px",
                        height: "28px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        background: "#fff",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        opacity: isLoading ? 0.5 : 1,
                      }}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: "12px",
                    color: "#1f2937",
                    fontWeight: "600",
                  }}
                >
                  {item.cost} ₪
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: "12px",
                  }}
                >
                  <button
                    onClick={() => handleRemoveItem(item.itemId)}
                    disabled={isLoading}
                    title="Delete item"
                    style={{
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#e5e7eb",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      opacity: isLoading ? 0.5 : 1,
                      fontSize: "16px",
                      margin: "0 auto",
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "24px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            background: "#f3f4f6",
            padding: "16px 24px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#1f2937",
              textAlign: "right",
            }}
          >
            Total: {totalCost.toFixed(2)} ₪
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <button
          onClick={handleClearCart}
          disabled={isLoading || items.length === 0}
          style={{
            padding: "10px 20px",
            background: "#6b7280",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          Clear Cart
        </button>
        <button
          disabled={isLoading || items.length === 0}
          style={{
            padding: "10px 20px",
            background: "#059669",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontWeight: "600",
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          לתשלום
        </button>
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
    </div>
  );
}
