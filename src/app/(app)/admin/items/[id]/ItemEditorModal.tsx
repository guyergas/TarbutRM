"use client";

import { useRouter } from "next/navigation";
import ItemEditor from "./ItemEditor";

interface StockHistory {
  id: string;
  inStock: boolean;
  changedAt: string;
  changer: { firstName: string; lastName: string; role: string };
}

interface ItemEditorModalProps {
  item: {
    id: string;
    name: string;
    description?: string;
    price: string | number;
    inStock: boolean;
    image?: string;
    archived: boolean;
  };
  section: {
    id: string;
    name: string;
    menuId: string;
    menu: { id: string; name: string };
  };
  stockHistory: StockHistory[];
  userId: string;
}

export default function ItemEditorModal({
  item,
  section,
  stockHistory,
  userId,
}: ItemEditorModalProps) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
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
      >
        <h1 style={{ margin: "0 0 24px 0", fontSize: 28, fontWeight: 700, color: "#1f2937" }}>
          עריכת מוצר
        </h1>

        <ItemEditor
          item={item}
          section={section}
          stockHistory={stockHistory}
          userId={userId}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}
