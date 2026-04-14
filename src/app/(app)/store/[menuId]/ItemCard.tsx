"use client";

import { useState } from "react";
import { QuantitySelector } from "./QuantitySelector";
import { AddToCartButton } from "./AddToCartButton";
import UnifiedItemModal from "./UnifiedItemModal";

interface StockHistory {
  id: string;
  inStock: boolean;
  changedAt: string;
  changer: { firstName: string; lastName: string; role: string };
}

interface ItemCardProps {
  item: {
    id: string;
    name: string;
    description?: string;
    price: string | number;
    inStock: boolean;
    image?: string;
  };
  userRole: "USER" | "STAFF" | "ADMIN";
  userId: string;
}

export default function ItemCard({ item: initialItem, userRole, userId }: ItemCardProps) {
  const [item, setItem] = useState(initialItem);
  const [isHovered, setIsHovered] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);

  const handleItemUpdated = async () => {
    try {
      const { fetchItem } = await import("./itemModalActions");
      const updatedItem = await fetchItem(item.id);
      if (updatedItem) {
        setItem({
          ...updatedItem,
          price: updatedItem.price.toString(),
          description: updatedItem.description ?? undefined,
          image: updatedItem.image ?? undefined,
        });
      }
    } catch (err) {
      console.error("Failed to refresh item:", err);
    }
  };

  return (
    <div className={`border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 overflow-hidden relative cursor-pointer transition-shadow duration-200 ${isHovered ? "shadow-lg" : "shadow-sm"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div
        onClick={async () => {
          setShowModal(true);
          // Fetch stock history if user is staff or admin
          if (userRole === "STAFF" || userRole === "ADMIN") {
            try {
              const { getStockHistory } = await import("./itemModalActions");
              const history = await getStockHistory(item.id);
              const serialized = (history || []).map((h: any) => ({
                ...h,
                changedAt: h.changedAt instanceof Date ? h.changedAt.toISOString() : h.changedAt,
              }));
              setStockHistory(serialized);
            } catch (err) {
              console.error("Failed to fetch stock history:", err);
            }
          }
        }}
        className="w-32 h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden mx-auto relative z-0 cursor-pointer"
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-gray-400 dark:text-gray-500 text-xs">
            אין תמונה
          </div>
        )}
      </div>

      {/* Stock badge */}
      {!item.inStock && (
        <div className="absolute top-2 right-2 bg-red-900 dark:bg-red-800 text-red-200 dark:text-red-300 px-2 py-1 rounded text-xs font-medium z-10">
          אזל מהמלאי
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-semibold m-0 mb-1 text-gray-700 dark:text-gray-300 break-words">
          {item.name}
        </h3>

        {item.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 m-0 mb-2 leading-relaxed">
            {item.description}
          </p>
        )}

        <div className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3">
          {item.price} ₪
        </div>

        {/* Quantity selector and add to cart button - only show if in stock */}
        {item.inStock && (
          <div className="flex items-center gap-2">
            <QuantitySelector
              initialQuantity={1}
              onQuantityChange={setQuantity}
            />
            <AddToCartButton itemId={item.id} quantity={quantity} />
          </div>
        )}
      </div>

      {/* Item Modal */}
      {showModal && (
        <UnifiedItemModal
          item={item}
          userRole={userRole}
          onClose={() => setShowModal(false)}
          onItemUpdated={handleItemUpdated}
          stockHistory={stockHistory}
        />
      )}
    </div>
  );
}
