"use client";

import { useState } from "react";
import CreateItemModal from "./CreateItemModal";

interface CreateItemButtonProps {
  sectionId: string;
  section: {
    id: string;
    name: string;
    menuId: string;
    menu: { id: string; name: string };
  };
  userId: string;
}

export default function CreateItemButton({
  sectionId,
  section,
  userId,
}: CreateItemButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => {
    setShowModal(false);
    window.location.reload();
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 220,
          padding: 16,
          borderRadius: 8,
          border: "2px dashed #d1d5db",
          background: "#f9fafb",
          cursor: "pointer",
          fontSize: 32,
          color: "#9ca3af",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "#6b7280";
          (e.currentTarget as HTMLElement).style.color = "#6b7280";
          (e.currentTarget as HTMLElement).style.background = "#f3f4f6";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "#d1d5db";
          (e.currentTarget as HTMLElement).style.color = "#9ca3af";
          (e.currentTarget as HTMLElement).style.background = "#f9fafb";
        }}
      >
        +
      </button>
      {showModal && (
        <CreateItemModal
          section={section}
          userId={userId}
          onClose={handleClose}
        />
      )}
    </>
  );
}
