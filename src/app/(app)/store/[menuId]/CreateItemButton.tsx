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
          border: "2px dashed var(--border-color)",
          background: "var(--bg-primary)",
          cursor: "pointer",
          fontSize: 32,
          color: "var(--text-tertiary)",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--text-secondary)";
          (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
          (e.currentTarget as HTMLElement).style.background = "var(--bg-secondary)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-color)";
          (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
          (e.currentTarget as HTMLElement).style.background = "var(--bg-primary)";
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
