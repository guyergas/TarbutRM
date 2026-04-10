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
        className="fixed inset-0 bg-black/30 z-100"
      />

      {/* Modal Drawer */}
      <div className="fixed top-0 left-0 h-screen max-h-[70vh] w-screen max-w-xs bg-white dark:bg-gray-800 shadow-xl dark:shadow-2xl z-101 flex flex-col overflow-y-auto rtl">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <span className="font-bold text-lg text-gray-900 dark:text-white">סל קניות</span>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-gray-600 dark:text-gray-400 bg-none border-none p-0 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 px-5 py-4 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 pt-8">
              <p>סל הקניות שלך ריק</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.itemId}
                  className={`flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-md ${
                    item.archived ? "opacity-60" : ""
                  } bg-white dark:bg-gray-700`}
                >
                  <div className="flex-1">
                    <button
                      onClick={() => handleItemClick(item)}
                      className="bg-none border-none text-blue-500 dark:text-blue-400 cursor-pointer underline p-0 font-semibold mb-1 block text-sm hover:text-blue-600 dark:hover:text-blue-300"
                    >
                      {item.name}
                    </button>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{item.price} ₪</span>
                      <span>×</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.itemId, item.quantity - 1)
                          }
                          disabled={isLoading || item.quantity <= 1}
                          className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                          className="w-9 text-center border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-xs"
                        />
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.itemId, item.quantity + 1)
                          }
                          disabled={isLoading}
                          className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          +
                        </button>
                      </div>
                      <span>=</span>
                      <span className="font-semibold">{item.cost} ₪</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.itemId)}
                    disabled={isLoading}
                    className="w-7 h-7 flex items-center justify-center bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm ml-3"
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
          <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex justify-between items-center mb-3 text-base font-semibold text-gray-900 dark:text-white">
              <span>סה"כ:</span>
              <span>{totalCost.toFixed(2)} ₪</span>
            </div>
            <button
              onClick={() => setShowCheckoutConfirm(true)}
              disabled={isLoading}
              className="block w-full py-2.5 bg-green-600 dark:bg-green-700 text-white border-none rounded-md text-center font-semibold cursor-pointer hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
            className="fixed inset-0 bg-black/30 z-102"
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-2xl z-103 p-6 max-w-sm w-11/12 rtl">
            <h2 className="m-0 mb-4 text-xl font-bold text-gray-900 dark:text-white">
              אישור הזמנה
            </h2>

            {checkoutError && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md mb-4 text-sm">
                {checkoutError}
              </div>
            )}

            <div className="mb-4 text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <div className="flex justify-between">
                <span>יתרה נוכחית:</span>
                <span className="font-semibold">₪{userBalance || "0"}</span>
              </div>
              <div className="flex justify-between">
                <span>סה"כ הזמנה:</span>
                <span className="font-semibold">₪{totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>פריטים:</span>
                <span>{items.length}</span>
              </div>
            </div>

            {userBalance &&
              Number(userBalance) - totalCost < 5 &&
              Number(userBalance) >= totalCost && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 p-3 rounded-md mb-4 text-xs">
                  התראה: היתרה שלך לאחר הרכישה תהיה נמוכה
                </div>
              )}

            <div className="flex gap-3">
              <button
                onClick={() => !isLoading && setShowCheckoutConfirm(false)}
                disabled={isLoading}
                className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white border-none rounded-md font-semibold cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ביטול
              </button>
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="flex-1 py-2.5 bg-green-600 dark:bg-green-700 text-white border-none rounded-md font-semibold cursor-pointer hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
