"use client";

import { createMenu } from "./menuActions";
import { useState } from "react";

export default function CreateMenuButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    const name = prompt("שם התפריט החדש:");
    if (!name || !name.trim()) return;

    setIsLoading(true);
    try {
      await createMenu(name);
      window.location.reload();
    } catch (err) {
      alert("שגיאה ביצירת התפריט");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCreate}
      disabled={isLoading}
      title="תפריט חדש"
      style={{
        padding: "4px 8px",
        background: "#f3f4f6",
        border: "1px solid #d1d5db",
        borderRadius: 4,
        cursor: isLoading ? "not-allowed" : "pointer",
        fontSize: 12,
        display: "flex",
        alignItems: "center",
        color: "#374151",
        opacity: isLoading ? 0.6 : 1,
      }}
    >
      +
    </button>
  );
}
