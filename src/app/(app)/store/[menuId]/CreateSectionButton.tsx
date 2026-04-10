"use client";

import { createSection } from "./sectionActions";
import { useState } from "react";

interface CreateSectionButtonProps {
  menuId: string;
}

export default function CreateSectionButton({
  menuId,
}: CreateSectionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    const name = prompt("שם הקטגוריה החדשה:");
    if (!name || !name.trim()) return;

    setIsLoading(true);
    try {
      await createSection(menuId, name);
      window.location.reload();
    } catch (err) {
      alert("שגיאה ביצירת הקטגוריה");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCreate}
      disabled={isLoading}
      title="קטגוריה חדשה"
      style={{
        padding: "4px 8px",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: 4,
        cursor: isLoading ? "not-allowed" : "pointer",
        fontSize: 12,
        display: "flex",
        alignItems: "center",
        color: "var(--text-primary)",
        opacity: isLoading ? 0.6 : 1,
      }}
    >
      +
    </button>
  );
}
