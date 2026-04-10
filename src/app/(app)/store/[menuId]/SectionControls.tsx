"use client";

import { updateSectionName, reorderSections } from "./sectionActions";
import { useState } from "react";

interface Section {
  id: string;
  name: string;
}

interface SectionControlsProps {
  section: Section;
  sections: Section[];
  menuId: string;
}

export default function SectionControls({
  section,
  sections,
  menuId,
}: SectionControlsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const sectionIndex = sections.findIndex((s) => s.id === section.id);
  const canMoveUp = sectionIndex > 0;
  const canMoveDown = sectionIndex < sections.length - 1;

  const handleEdit = async () => {
    const newName = prompt("שם הקטגוריה החדשה:", section.name);
    if (newName && newName !== section.name) {
      setIsLoading(true);
      try {
        await updateSectionName(section.id, newName.trim());
        window.location.reload();
      } catch (err) {
        alert("שגיאה בעדכון הקטגוריה");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleMoveUp = async () => {
    if (!canMoveUp) return;
    setIsLoading(true);
    try {
      const newOrder = [...sections];
      [newOrder[sectionIndex - 1], newOrder[sectionIndex]] = [
        newOrder[sectionIndex],
        newOrder[sectionIndex - 1],
      ];
      await reorderSections(menuId, newOrder.map((s) => s.id));
      window.location.reload();
    } catch (err) {
      alert("שגיאה בהעברת הקטגוריה");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveDown = async () => {
    if (!canMoveDown) return;
    setIsLoading(true);
    try {
      const newOrder = [...sections];
      [newOrder[sectionIndex], newOrder[sectionIndex + 1]] = [
        newOrder[sectionIndex + 1],
        newOrder[sectionIndex],
      ];
      await reorderSections(menuId, newOrder.map((s) => s.id));
      window.location.reload();
    } catch (err) {
      alert("שגיאה בהעברת הקטגוריה");
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
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      <button
        onClick={handleEdit}
        disabled={isLoading}
        title="עריכה"
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
        ✎
      </button>

      <button
        onClick={handleMoveUp}
        disabled={!canMoveUp || isLoading}
        title="הזז למעלה"
        style={{
          padding: "4px 8px",
          background: canMoveUp && !isLoading ? "var(--bg-secondary)" : "var(--bg-primary)",
          border: "1px solid var(--border-color)",
          borderRadius: 4,
          cursor:
            canMoveUp && !isLoading ? "pointer" : "not-allowed",
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          color: canMoveUp && !isLoading ? "var(--text-primary)" : "var(--border-color)",
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        ↑
      </button>

      <button
        onClick={handleMoveDown}
        disabled={!canMoveDown || isLoading}
        title="הזז למטה"
        style={{
          padding: "4px 8px",
          background:
            canMoveDown && !isLoading ? "var(--bg-secondary)" : "var(--bg-primary)",
          border: "1px solid var(--border-color)",
          borderRadius: 4,
          cursor:
            canMoveDown && !isLoading ? "pointer" : "not-allowed",
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          color: canMoveDown && !isLoading ? "var(--text-primary)" : "var(--border-color)",
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        ↓
      </button>
    </div>
  );
}
