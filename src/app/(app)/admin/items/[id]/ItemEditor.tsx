"use client";

import { useState } from "react";
import { updateItemAction, toggleStockAction, archiveItemAction, duplicateItemAction } from "./actions";

interface Item {
  id: string;
  name: string;
  description?: string;
  price: number;
  inStock: boolean;
  image?: string;
  archived: boolean;
}

interface Section {
  id: string;
  name: string;
  menuId: string;
  menu: { id: string; name: string };
}

interface StockHistory {
  id: string;
  inStock: boolean;
  changedAt: Date;
  changer: { firstName: string; lastName: string; role: string };
}

interface ItemEditorProps {
  item: Item;
  section: Section;
  stockHistory: StockHistory[];
  sections: Section[];
  userId: string;
}

export default function ItemEditor({
  item,
  section,
  stockHistory,
  sections,
  userId,
}: ItemEditorProps) {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description || "");
  const [price, setPrice] = useState(item.price.toString());
  const [image, setImage] = useState(item.image || "");
  const [inStock, setInStock] = useState(item.inStock);
  const [duplicateTargetId, setDuplicateTargetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await updateItemAction(item.id, {
        name,
        description,
        price: parseFloat(price),
        image,
      });
      setSuccess("המוצר עודכן בהצלחה");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בעדכון המוצר");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStock = async () => {
    setLoading(true);
    setError(null);
    try {
      setInStock(!inStock);
      await toggleStockAction(item.id, !inStock);
      setSuccess("סטטוס המלאי עודכן");
    } catch (err) {
      setInStock(inStock);
      setError(err instanceof Error ? err.message : "שגיאה בעדכון המלאי");
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm("האם אתה בטוח שברצונך לארכיון את המוצר?")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await archiveItemAction(item.id);
      setSuccess("המוצר הועבר לארכיון");
      setTimeout(() => window.history.back(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בארכיון המוצר");
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    if (!duplicateTargetId) {
      setError("בחר קטגוריה לשיכפול");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await duplicateItemAction(item.id, duplicateTargetId);
      setSuccess("המוצר שוכפל בהצלחה");
      setTimeout(() => {
        window.location.href = `/admin/items/${result.id}`;
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשיכפול המוצר");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
      {/* Left: Form */}
      <div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
            שם המוצר
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: 14,
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
            תיאור
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: 14,
              minHeight: 100,
              fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
            מחיר (₪)
          </label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: 14,
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
            כתובת תמונה (URL)
          </label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: 14,
            }}
          />
        </div>

        {/* Messages */}
        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              background: "#fee2e2",
              color: "#991b1b",
              borderRadius: 6,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              background: "#ecfdf5",
              color: "#047857",
              borderRadius: 6,
              fontSize: 14,
            }}
          >
            {success}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "grid", gap: 12 }}>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: "10px 16px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "שומר..." : "שמור שינויים"}
          </button>

          <button
            onClick={handleToggleStock}
            disabled={loading}
            style={{
              padding: "10px 16px",
              background: inStock ? "#fca5a5" : "#86efac",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {inStock ? "סמן כאזל מהמלאי" : "סמן כבמלאי"}
          </button>

          <button
            onClick={handleArchive}
            disabled={loading}
            style={{
              padding: "10px 16px",
              background: "#9ca3af",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            ארכיון
          </button>

          <div style={{ marginTop: 8 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500, fontSize: 14 }}>
              שיכפול לקטגוריה
            </label>
            <select
              value={duplicateTargetId || ""}
              onChange={(e) => setDuplicateTargetId(e.target.value || null)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: 14,
                marginBottom: 8,
              }}
            >
              <option value="">בחר קטגוריה...</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.menu.name} › {sec.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleDuplicate}
              disabled={loading || !duplicateTargetId}
              style={{
                width: "100%",
                padding: "10px 16px",
                background: duplicateTargetId ? "#8b5cf6" : "#d1d5db",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontWeight: 500,
                cursor: loading || !duplicateTargetId ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              שכפל
            </button>
          </div>
        </div>
      </div>

      {/* Right: Stock History & Preview */}
      <div>
        {/* Image Preview */}
        {image && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
              תצוגה מקדימה
            </h3>
            <img
              src={image}
              alt={name}
              style={{
                width: "100%",
                maxHeight: 240,
                objectFit: "cover",
                borderRadius: 6,
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* Stock History */}
        <div>
          <h3 style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>
            היסטוריית מלאי
          </h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: 8, textAlign: "right", fontWeight: 600 }}>
                  סטטוס
                </th>
                <th style={{ padding: 8, textAlign: "right", fontWeight: 600 }}>
                  בידי
                </th>
                <th style={{ padding: 8, textAlign: "right", fontWeight: 600 }}>
                  תאריך
                </th>
              </tr>
            </thead>
            <tbody>
              {stockHistory.map((record) => (
                <tr
                  key={record.id}
                  style={{ borderBottom: "1px solid #f3f4f6" }}
                >
                  <td style={{ padding: 8 }}>
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: 3,
                        background: record.inStock ? "#ecfdf5" : "#fef2f2",
                        color: record.inStock ? "#047857" : "#991b1b",
                      }}
                    >
                      {record.inStock ? "במלאי" : "אזל"}
                    </span>
                  </td>
                  <td style={{ padding: 8 }}>
                    {record.changer.firstName} {record.changer.lastName}
                    <br />
                    <span style={{ color: "#6b7280", fontSize: 12 }}>
                      ({record.changer.role})
                    </span>
                  </td>
                  <td style={{ padding: 8 }}>
                    {new Date(record.changedAt).toLocaleDateString("he-IL")}
                    <br />
                    <span style={{ color: "#6b7280", fontSize: 12 }}>
                      {new Date(record.changedAt).toLocaleTimeString("he-IL")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
