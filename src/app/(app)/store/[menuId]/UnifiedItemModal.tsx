"use client";

import { useState, useRef } from "react";
import { toggleStockFromModal, updateItemFromModal } from "./itemModalActions";

interface StockHistory {
  id: string;
  inStock: boolean;
  changedAt: string;
  changer: { firstName: string; lastName: string; role: string };
}

interface UnifiedItemModalProps {
  item: {
    id: string;
    name: string;
    description?: string;
    price: string | number;
    inStock: boolean;
    image?: string;
    archived?: boolean;
  };
  userRole: "USER" | "STAFF" | "ADMIN";
  onClose: () => void;
  onItemUpdated?: () => void;
  stockHistory?: StockHistory[];
}

export default function UnifiedItemModal({
  item,
  userRole,
  onClose,
  onItemUpdated,
  stockHistory = [],
}: UnifiedItemModalProps) {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description || "");
  const [price, setPrice] = useState(item.price.toString());
  const [image, setImage] = useState(item.image || "");
  const [imagePreview, setImagePreview] = useState<string>(item.image || "");
  const [inStock, setInStock] = useState(item.inStock);
  const [loading, setLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropSize, setCropSize] = useState(200);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, cropX: 0, cropY: 0 });
  const cropperContainerRef = useRef<HTMLDivElement>(null);

  const isReadOnly = userRole === "USER";
  const canEdit = userRole === "ADMIN";
  const canToggleStock = userRole === "ADMIN" || userRole === "STAFF";

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("בחר קובץ תמונה בלבד");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("גודל התמונה גדול מ-5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedImage(result);
      setShowCropper(true);
      setError(null);
    };
    reader.onerror = () => {
      setError("שגיאה בטעינת התמונה");
    };
    reader.readAsDataURL(file);
  };

  const handleCropImage = () => {
    if (!uploadedImage) return;

    const img = new Image();
    img.onload = () => {
      const cropperContainer = cropperContainerRef.current;
      if (!cropperContainer) return;

      const containerW = cropperContainer.offsetWidth;
      const containerH = cropperContainer.offsetHeight;
      const imageW = img.width;
      const imageH = img.height;
      const imageAspect = imageW / imageH;
      const containerAspect = containerW / containerH;

      let scale: number;
      let offsetX: number;
      let offsetY: number;

      if (imageAspect > containerAspect) {
        scale = containerH / imageH;
        const displayW = imageW * scale;
        offsetX = (containerW - displayW) / 2;
        offsetY = 0;
      } else {
        scale = containerW / imageW;
        const displayH = imageH * scale;
        offsetX = 0;
        offsetY = (containerH - displayH) / 2;
      }

      const imageX = (cropX - offsetX) / scale;
      const imageY = (cropY - offsetY) / scale;
      const imageCropSize = cropSize / scale;

      const finalSize = Math.min(cropSize, 200);

      const canvas = document.createElement("canvas");
      canvas.width = finalSize;
      canvas.height = finalSize;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, imageX, imageY, imageCropSize, imageCropSize, 0, 0, finalSize, finalSize);
        const croppedImage = canvas.toDataURL("image/jpeg", 0.9);
        setImage(croppedImage);
        setImagePreview(croppedImage);
        setShowCropper(false);
        setUploadedImage("");
      }
    };
    img.src = uploadedImage;
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setUploadedImage("");
    setCropX(0);
    setCropY(0);
  };

  const handleStockToggle = async () => {
    if (stockLoading) return;
    setStockLoading(true);
    setError(null);
    try {
      await toggleStockFromModal(item.id, !inStock);
      setInStock(!inStock);
      setSuccess(inStock ? "המוצר סומן כאזל" : "המוצר סומן כזמין");
      setTimeout(() => {
        setSuccess(null);
        if (onItemUpdated) onItemUpdated();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בעדכון המלאי");
    } finally {
      setStockLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await updateItemFromModal(item.id, {
        name,
        description,
        price: parseFloat(price),
        image,
      });
      setSuccess("המוצר עודכן בהצלחה");
      setTimeout(() => {
        if (onItemUpdated) onItemUpdated();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בעדכון המוצר");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showCropper && (
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
            }}
          >
            <h2 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 700 }}>
              חתוך את התמונה
            </h2>
            <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>
              הזז וגדל את הריבוע כדי לחתוך את התמונה לפורמט ריבועי
            </p>

            <div
              ref={cropperContainerRef}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 400,
                margin: "0 auto 24px",
                overflow: "hidden",
                borderRadius: 8,
                border: "2px solid #d1d5db",
                aspectRatio: "1",
                background: "#f3f4f6",
              }}
            >
              <img
                src={uploadedImage}
                alt="Upload preview"
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  left: `${cropX}px`,
                  top: `${cropY}px`,
                  width: `${cropSize}px`,
                  height: `${cropSize}px`,
                  border: "3px solid #3b82f6",
                  cursor: "move",
                  background: "rgba(59, 130, 246, 0.1)",
                  userSelect: "none",
                }}
                onPointerDown={(e) => {
                  dragStartRef.current = {
                    x: e.clientX,
                    y: e.clientY,
                    cropX: cropX,
                    cropY: cropY,
                  };
                  setIsDragging(true);
                  (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                }}
                onPointerMove={(e) => {
                  if (!isDragging) return;

                  const container = cropperContainerRef.current;
                  if (!container) return;

                  const containerRect = container.getBoundingClientRect();
                  const deltaX = e.clientX - dragStartRef.current.x;
                  const deltaY = e.clientY - dragStartRef.current.y;

                  const newX = dragStartRef.current.cropX + deltaX;
                  const newY = dragStartRef.current.cropY + deltaY;

                  setCropX(Math.max(0, Math.min(newX, containerRect.width - cropSize)));
                  setCropY(Math.max(0, Math.min(newY, containerRect.height - cropSize)));
                }}
                onPointerUp={(e) => {
                  setIsDragging(false);
                  (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                גודל החתיכה: {cropSize}px
              </label>
              <input
                type="range"
                min="50"
                max="400"
                value={cropSize}
                onChange={(e) => setCropSize(parseInt(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handleCropImage}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  background: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                חתוך ושמור
              </button>
              <button
                onClick={handleCropCancel}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  background: "#e5e7eb",
                  color: "#374151",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 100,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 20px 25px rgba(0,0,0,0.15)",
          zIndex: 101,
          maxWidth: "500px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          direction: "rtl",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: "#374151",
            zIndex: 10,
          }}
        >
          ✕
        </button>

        {/* Image */}
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            style={{
              width: "100%",
              height: "300px",
              objectFit: "contain",
              background: "#f3f4f6",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "300px",
              background: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
            }}
          >
            אין תמונה
          </div>
        )}

        {/* Content */}
        <div style={{ padding: "24px" }}>
          {/* Name and Price - Compact Layout */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#6b7280" }}>
                  שם המוצר
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isReadOnly}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    border: "1px solid #d1d5db",
                    borderRadius: 4,
                    fontSize: 13,
                    background: isReadOnly ? "#f3f4f6" : "#fff",
                    color: "#1f2937",
                  }}
                />
              </div>
              <div style={{ width: 70 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#6b7280" }}>
                  מחיר (₪)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isReadOnly}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    border: "1px solid #d1d5db",
                    borderRadius: 4,
                    fontSize: 13,
                    background: isReadOnly ? "#f3f4f6" : "#fff",
                    color: "#1f2937",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#6b7280" }}>
              תיאור
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isReadOnly}
              style={{
                width: "100%",
                padding: "6px 8px",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                fontSize: 13,
                minHeight: 60,
                fontFamily: "inherit",
                background: isReadOnly ? "#f3f4f6" : "#fff",
                color: "#1f2937",
              }}
            />
          </div>

          {/* Image Upload - Admin Only */}
          {canEdit && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#6b7280" }}>
                תמונה
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  border: "1px solid #d1d5db",
                  borderRadius: 4,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              />
              <p style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>
                JPG, PNG עד 5MB
              </p>

              {/* Image Preview */}
              {imagePreview && (
                <div style={{ marginTop: 8 }}>
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 4,
                      overflow: "hidden",
                      background: "#f3f4f6",
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt={name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stock History - Staff and Admin */}
          {(canToggleStock || userRole === "STAFF") && stockHistory.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 6, fontSize: 12, color: "#6b7280" }}>
                היסטוריית מלאי
              </h3>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: 4, textAlign: "right", fontWeight: 600, fontSize: 11 }}>
                      סטטוס
                    </th>
                    <th style={{ padding: 4, textAlign: "right", fontWeight: 600, fontSize: 11 }}>
                      בידי
                    </th>
                    <th style={{ padding: 4, textAlign: "right", fontWeight: 600, fontSize: 11 }}>
                      תאריך
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stockHistory.map((record) => (
                    <tr key={record.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: 4 }}>
                        <span
                          style={{
                            padding: "1px 4px",
                            borderRadius: 3,
                            background: record.inStock ? "#ecfdf5" : "#fef2f2",
                            color: record.inStock ? "#047857" : "#991b1b",
                            fontSize: 11,
                          }}
                        >
                          {record.inStock ? "במלאי" : "אזל"}
                        </span>
                      </td>
                      <td style={{ padding: 4, fontSize: 11 }}>
                        {record.changer.firstName} {record.changer.lastName}
                      </td>
                      <td style={{ padding: 4, fontSize: 11, color: "#6b7280" }}>
                        {new Date(record.changedAt).toLocaleDateString("he-IL")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div
              style={{
                marginBottom: 12,
                padding: 8,
                background: "#fee2e2",
                color: "#991b1b",
                borderRadius: 4,
                fontSize: 12,
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                marginBottom: 12,
                padding: 8,
                background: "#ecfdf5",
                color: "#047857",
                borderRadius: 4,
                fontSize: 12,
              }}
            >
              {success}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            {canToggleStock && (
              <button
                onClick={handleStockToggle}
                disabled={stockLoading}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  background: inStock ? "#ecfdf5" : "#fef2f2",
                  color: inStock ? "#047857" : "#991b1b",
                  border: "1px solid " + (inStock ? "#d1fae5" : "#fee2e2"),
                  borderRadius: 4,
                  fontWeight: 500,
                  fontSize: 12,
                  cursor: stockLoading ? "not-allowed" : "pointer",
                  opacity: stockLoading ? 0.6 : 1,
                }}
              >
                {stockLoading ? "עדכון..." : (inStock ? "✓ במלאי" : "✗ אזל")}
              </button>
            )}

            {canEdit && (
              <button
                onClick={handleSave}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  background: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  fontWeight: 500,
                  fontSize: 12,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "שומר..." : "שמור שינויים"}
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "8px 12px",
                background: "#e5e7eb",
                color: "#374151",
                border: "none",
                borderRadius: 4,
                fontWeight: 500,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
