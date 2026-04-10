"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UnifiedItemModal from "./store/[menuId]/UnifiedItemModal";
import { cartService } from "@/modules/cart";
import {
  removeFromCartAction,
  updateQuantityAction,
  clearCartAction,
} from "./store/[menuId]/cartActions";
import { createOrderAction } from "./store/[menuId]/orderActions";

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

interface FullItemData {
  id: string;
  name: string;
  description?: string;
  price: number;
  inStock: boolean;
  image?: string;
  archived?: boolean;
}

interface StockHistory {
  id: string;
  inStock: boolean;
  changedAt: string;
  changer: { firstName: string; lastName: string; role: string };
}

interface CartModalProps {
  initialItems: CartItem[];
  initialTotalCost: number;
  userRole: "USER" | "STAFF" | "ADMIN";
  userBalance?: string | null;
  onClose: () => void;
  onItemCountChange: (count: number) => void;
  onCartUpdate: (items: CartItem[], totalCost: number) => void;
}

export default function CartModal({
  initialItems,
  initialTotalCost,
  userRole,
  userBalance,
  onClose,
  onItemCountChange,
  onCartUpdate,
}: CartModalProps) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [totalCost, setTotalCost] = useState(initialTotalCost);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [selectedItemFull, setSelectedItemFull] = useState<FullItemData | null>(null);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleRemoveItem = async (itemId: string) => {
    setIsLoading(true);
    try {
      await removeFromCartAction(itemId);
      const updatedItems = items.filter((item) => item.itemId !== itemId);
      const newTotal = updatedItems.reduce((sum, item) => sum + item.cost, 0);
      setItems(updatedItems);
      setTotalCost(newTotal);
      onItemCountChange(updatedItems.length);
      onCartUpdate(updatedItems, newTotal);
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
      const newTotal = updatedItems.reduce((sum, item) => sum + item.cost, 0);
      setItems(updatedItems);
      setTotalCost(newTotal);
      onCartUpdate(updatedItems, newTotal);
    } catch (error) {
      console.error("Failed to update quantity:", error);
      alert("Failed to update quantity");
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = async (item: CartItem) => {
    try {
      const response = await fetch(`/api/items/${item.itemId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedItemFull(data.item);
        setStockHistory(data.stockHistory || []);
      }
    } catch (error) {
      console.error("Failed to fetch item details:", error);
    }
  };

  const handleCheckout = async () => {
    setCheckoutError(null);
    setIsLoading(true);
    try {
      const itemsForOrder = items.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
      }));

      const order = await createOrderAction(itemsForOrder);

      // Clear cart
      await clearCartAction();

      // Redirect to order detail page (shows orders list with modal open)
      router.push(`/orders/${order.id}`);

      // Reset UI
      setShowCheckoutConfirm(false);
      onClose();
    } catch (error) {
      console.error("Checkout failed:", error);
      setCheckoutError(
        error instanceof Error ? error.message : "Checkout failed. Please try again."
      );
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
          maxHeight: "70vh",
          width: "100%",
          maxWidth: "300px",
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
          <span style={{ fontWeight: 700, fontSize: 18, color: "#000" }}>סל קניות</span>
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
                      onClick={() => handleItemClick(item)}
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.itemId, item.quantity - 1)
                          }
                          disabled={isLoading || item.quantity <= 1}
                          style={{
                            width: "24px",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#f3f4f6",
                            border: "1px solid #d1d5db",
                            borderRadius: "3px",
                            cursor:
                              isLoading || item.quantity <= 1
                                ? "not-allowed"
                                : "pointer",
                            opacity: isLoading || item.quantity <= 1 ? 0.5 : 1,
                            fontSize: "14px",
                            padding: 0,
                          }}
                          onMouseEnter={(e) => {
                            if (!isLoading && item.quantity > 1)
                              (e.target as HTMLButtonElement).style.background =
                                "#e5e7eb";
                          }}
                          onMouseLeave={(e) => {
                            if (!isLoading && item.quantity > 1)
                              (e.target as HTMLButtonElement).style.background =
                                "#f3f4f6";
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
                            width: "36px",
                            textAlign: "center",
                            border: "1px solid #d1d5db",
                            borderRadius: "3px",
                            padding: "4px",
                          }}
                        />
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.itemId, item.quantity + 1)
                          }
                          disabled={isLoading}
                          style={{
                            width: "24px",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#f3f4f6",
                            border: "1px solid #d1d5db",
                            borderRadius: "3px",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            opacity: isLoading ? 0.5 : 1,
                            fontSize: "14px",
                            padding: 0,
                          }}
                          onMouseEnter={(e) => {
                            if (!isLoading)
                              (e.target as HTMLButtonElement).style.background =
                                "#e5e7eb";
                          }}
                          onMouseLeave={(e) => {
                            if (!isLoading)
                              (e.target as HTMLButtonElement).style.background =
                                "#f3f4f6";
                          }}
                        >
                          +
                        </button>
                      </div>
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
              onClick={() => setShowCheckoutConfirm(true)}
              disabled={isLoading}
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
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              {isLoading ? "מעבד..." : "לתשלום"}
            </button>
          </div>
        )}
      </div>

      {/* Item Modal */}
      {selectedItemFull && (
        <UnifiedItemModal
          item={selectedItemFull}
          userRole={userRole}
          onClose={() => {
            setSelectedItemFull(null);
            setStockHistory([]);
          }}
          stockHistory={stockHistory}
        />
      )}

      {/* Checkout Confirmation Dialog */}
      {showCheckoutConfirm && (
        <>
          <div
            onClick={() => !isLoading && setShowCheckoutConfirm(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.3)",
              zIndex: 102,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#fff",
              borderRadius: "8px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              zIndex: 103,
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
              direction: "rtl",
            }}
          >
            <h2 style={{ margin: "0 0 16px 0", fontSize: "20px", fontWeight: "700" }}>
              אישור הזמנה
            </h2>

            {checkoutError && (
              <div
                style={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "16px",
                  fontSize: "14px",
                }}
              >
                {checkoutError}
              </div>
            )}

            <div style={{ marginBottom: "16px", fontSize: "14px", color: "#374151" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span>יתרה נוכחית:</span>
                <span style={{ fontWeight: "600" }}>₪{userBalance || "0"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span>סה"כ הזמנה:</span>
                <span style={{ fontWeight: "600" }}>₪{totalCost.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>פריטים:</span>
                <span>{items.length}</span>
              </div>
            </div>

            {userBalance &&
              Number(userBalance) - totalCost < 5 &&
              Number(userBalance) >= totalCost && (
                <div
                  style={{
                    background: "#fef3c7",
                    color: "#92400e",
                    padding: "12px",
                    borderRadius: "6px",
                    marginBottom: "16px",
                    fontSize: "13px",
                  }}
                >
                  התראה: היתרה שלך לאחר הרכישה תהיה נמוכה
                </div>
              )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => !isLoading && setShowCheckoutConfirm(false)}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#e5e7eb",
                  color: "#374151",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                ביטול
              </button>
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#059669",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                {isLoading ? "מעבד..." : "אישור"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
