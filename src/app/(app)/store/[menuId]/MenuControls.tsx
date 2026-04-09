"use client";

import { updateMenuName, reorderMenus, toggleArchiveMenu } from "./menuActions";
import { useState } from "react";

interface Menu {
  id: string;
  name: string;
  archived?: boolean;
}

interface MenuControlsProps {
  menu: Menu;
  allMenus: Menu[];
}

export default function MenuControls({
  menu,
  allMenus,
}: MenuControlsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const menuIndex = allMenus.findIndex((m) => m.id === menu.id);
  const canMoveLeft = menuIndex > 0;
  const canMoveRight = menuIndex < allMenus.length - 1;

  const handleEdit = async () => {
    const newName = prompt("שם התפריט החדש:", menu.name);
    if (newName && newName !== menu.name) {
      setIsLoading(true);
      try {
        await updateMenuName(menu.id, newName.trim());
        window.location.reload();
      } catch (err) {
        alert("שגיאה בעדכון התפריט");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleMoveLeft = async () => {
    if (!canMoveLeft) return;
    setIsLoading(true);
    try {
      const newOrder = [...allMenus];
      [newOrder[menuIndex - 1], newOrder[menuIndex]] = [
        newOrder[menuIndex],
        newOrder[menuIndex - 1],
      ];
      await reorderMenus(newOrder.map((m) => m.id));
      window.location.reload();
    } catch (err) {
      alert("שגיאה בהעברת התפריט");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveRight = async () => {
    if (!canMoveRight) return;
    setIsLoading(true);
    try {
      const newOrder = [...allMenus];
      [newOrder[menuIndex], newOrder[menuIndex + 1]] = [
        newOrder[menuIndex + 1],
        newOrder[menuIndex],
      ];
      await reorderMenus(newOrder.map((m) => m.id));
      window.location.reload();
    } catch (err) {
      alert("שגיאה בהעברת התפריט");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleArchive = async () => {
    setIsLoading(true);
    try {
      await toggleArchiveMenu(menu.id);
      window.location.reload();
    } catch (err) {
      alert("שגיאה בארכיווציה התפריט");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 2,
        alignItems: "center",
      }}
    >
      <button
        onClick={handleEdit}
        disabled={isLoading}
        title="עריכה"
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
        ✎
      </button>

      <button
        onClick={handleMoveLeft}
        disabled={!canMoveLeft || isLoading}
        title="הזז לשמאל"
        style={{
          padding: "4px 8px",
          background:
            canMoveLeft && !isLoading ? "#f3f4f6" : "#f9fafb",
          border: "1px solid #d1d5db",
          borderRadius: 4,
          cursor:
            canMoveLeft && !isLoading ? "pointer" : "not-allowed",
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          color: canMoveLeft && !isLoading ? "#374151" : "#d1d5db",
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        →
      </button>

      <button
        onClick={handleMoveRight}
        disabled={!canMoveRight || isLoading}
        title="הזז לימין"
        style={{
          padding: "4px 8px",
          background:
            canMoveRight && !isLoading ? "#f3f4f6" : "#f9fafb",
          border: "1px solid #d1d5db",
          borderRadius: 4,
          cursor:
            canMoveRight && !isLoading ? "pointer" : "not-allowed",
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          color: canMoveRight && !isLoading ? "#374151" : "#d1d5db",
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        ←
      </button>

      <button
        onClick={handleToggleArchive}
        disabled={isLoading}
        title={menu.archived ? "שחזור" : "ארכיווציה"}
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
        {menu.archived ? "☑" : "☐"}
      </button>
    </div>
  );
}
