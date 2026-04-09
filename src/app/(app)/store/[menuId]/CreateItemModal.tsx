"use client";

import ItemEditor from "@/app/(app)/admin/items/[id]/ItemEditor";

interface CreateItemModalProps {
  section: {
    id: string;
    name: string;
    menuId: string;
    menu: { id: string; name: string };
  };
  userId: string;
  onClose: () => void;
}

export default function CreateItemModal({
  section,
  userId,
  onClose,
}: CreateItemModalProps) {
  const newItem = {
    id: "",
    name: "",
    description: "",
    price: 0,
    inStock: true,
    archived: false,
    image: "",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 24,
          maxWidth: 600,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h1 style={{ margin: "0 0 24px 0", fontSize: 28, fontWeight: 700, color: "#1f2937" }}>
          יצירת מוצר חדש
        </h1>

        <ItemEditor
          item={newItem}
          section={section}
          stockHistory={[]}
          userId={userId}
          onClose={onClose}
          isNew={true}
        />
      </div>
    </div>
  );
}
