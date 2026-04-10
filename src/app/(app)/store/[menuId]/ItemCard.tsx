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
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        background: "#fff",
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        transition: "box-shadow 0.2s",
        boxShadow: isHovered ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
      }}
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
        style={{
          width: 200,
          height: 200,
          background: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          margin: "0 auto",
          position: "relative",
          zIndex: 0,
          cursor: "pointer",
        }}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <div style={{ color: "#9ca3af", fontSize: 12 }}>
            אין תמונה
          </div>
        )}
      </div>

      {/* Stock badge */}
      {!item.inStock && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "#fee2e2",
            color: "#991b1b",
            padding: "4px 8px",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 500,
            zIndex: 10,
          }}
        >
          אזל מהמלאי
        </div>
      )}


      {/* Content */}
      <div style={{ padding: "12px" }}>
        <h3
          style={{
            fontSize: 14,
            fontWeight: 600,
            margin: "0 0 4px 0",
            color: "#1f2937",
            wordBreak: "break-word",
          }}
        >
          {item.name}
        </h3>

        {item.description && (
          <p
            style={{
              fontSize: 12,
              color: "#6b7280",
              margin: "0 0 8px 0",
              lineHeight: 1.4,
            }}
          >
            {item.description}
          </p>
        )}

        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#1f2937",
            marginBottom: "12px",
          }}
        >
          {item.price} ₪
        </div>

        {/* Quantity selector and add to cart button - only show if in stock */}
        {item.inStock && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
