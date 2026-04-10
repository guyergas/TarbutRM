"use client";

import { useState, useEffect, useRef } from "react";
import { updateItemAction, toggleStockAction } from "./actions";
import { createItem } from "@/app/(app)/store/[menuId]/itemActions";

interface Item {
  id: string;
  name: string;
  description?: string;
  price: string | number;
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
  changedAt: string | Date;
  changer: { firstName: string; lastName: string; role: string };
}

interface ItemEditorProps {
  item: Item;
  section: Section;
  stockHistory: StockHistory[];
  userId: string;
  onClose?: () => void;
  isNew?: boolean;
}

export default function ItemEditor({
  item,
  section,
  stockHistory,
  userId,
  onClose,
  isNew = false,
}: ItemEditorProps) {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description || "");
  const [price, setPrice] = useState(item.price.toString());
  const [image, setImage] = useState(item.image || "");
  const [inStock, setInStock] = useState(item.inStock);
  const [loading, setLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropSize, setCropSize] = useState(400);
  const [maxCropSize, setMaxCropSize] = useState(400);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, cropX: 0, cropY: 0 });
  const cropperContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showCropper) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showCropper]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("בחר קובץ תמונה בלבד");
      return;
    }

    // Validate file size (max 5MB)
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
      // Get the cropper container to calculate display dimensions
      const cropperContainer = cropperContainerRef.current;
      if (!cropperContainer) return;

      const containerW = cropperContainer.offsetWidth;
      const containerH = cropperContainer.offsetHeight;
      const imageW = img.width;
      const imageH = img.height;
      const imageAspect = imageW / imageH;
      const containerAspect = containerW / containerH;

      // Calculate how image is scaled with objectFit: contain
      let scale: number;
      let offsetX: number;
      let offsetY: number;

      if (imageAspect > containerAspect) {
        // Image is wider, scaled by height
        scale = containerH / imageH;
        const displayW = imageW * scale;
        offsetX = (containerW - displayW) / 2;
        offsetY = 0;
      } else {
        // Image is taller, scaled by width
        scale = containerW / imageW;
        const displayH = imageH * scale;
        offsetX = 0;
        offsetY = (containerH - displayH) / 2;
      }

      // Convert display coordinates to image coordinates
      const imageX = (cropX - offsetX) / scale;
      const imageY = (cropY - offsetY) / scale;
      const imageCropSize = cropSize / scale;

      // Calculate max size: don't upscale, max 400px, and limited by actual image size
      const maxSafeSize = Math.min(imageW, imageH, 400);
      setMaxCropSize(maxSafeSize);

      // Use the actual crop size in image coordinates, capped at max safe size
      const finalSize = Math.min(imageCropSize, maxSafeSize);

      const canvas = document.createElement("canvas");
      canvas.width = finalSize;
      canvas.height = finalSize;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw the selected crop area from the actual image, scaled to finalSize
        ctx.drawImage(
          img,
          imageX,
          imageY,
          imageCropSize,
          imageCropSize,
          0,
          0,
          finalSize,
          finalSize
        );
        // Try WebP first (better quality), fallback to PNG
        const croppedImage = canvas.toDataURL("image/webp") || canvas.toDataURL("image/png");
        setImage(croppedImage);
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
    if (stockLoading || isNew) return;
    setStockLoading(true);
    setError(null);
    try {
      await toggleStockAction(item.id, !inStock);
      setInStock(!inStock);
      setSuccess(inStock ? "המוצר סומן כאזל" : "המוצר סומן כזמין");
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
      if (isNew) {
        await createItem(section.id, name, parseFloat(price), description, image);
        setSuccess("המוצר נוצר בהצלחה");
      } else {
        await updateItemAction(item.id, {
          name,
          description,
          price: parseFloat(price),
          image,
        });
        setSuccess("המוצר עודכן בהצלחה");
      }
      // Close popup after successful save
      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : (isNew ? "שגיאה ביצירת המוצר" : "שגיאה בעדכון המוצר"));
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {/* Image Cropper Modal */}
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

            {/* Cropper Container */}
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
                  imageRendering: "crisp-edges",
                }}
              />

              {/* Crop Box */}
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

            {/* Size Control */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                גודל החתיכה: {Math.min(cropSize, maxCropSize)}px (מקסימום: {maxCropSize}px)
              </label>
              <input
                type="range"
                min="50"
                max={maxCropSize}
                value={Math.min(cropSize, maxCropSize)}
                onChange={(e) => setCropSize(parseInt(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            {/* Buttons */}
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

      {/* Form */}
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
              תמונה
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: 14,
                cursor: "pointer",
              }}
            />
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              תמונה JPG, PNG עד 5MB
            </p>
          </div>


          {/* Stock History */}
          {!isNew && stockHistory.length > 0 && (
            <div style={{ marginBottom: 24 }}>
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
                        {new Date(typeof record.changedAt === 'string' ? record.changedAt : record.changedAt.toISOString()).toLocaleDateString("he-IL")}
                        <br />
                        <span style={{ color: "#6b7280", fontSize: 12 }}>
                          {new Date(typeof record.changedAt === 'string' ? record.changedAt : record.changedAt.toISOString()).toLocaleTimeString("he-IL")}
                        </span>
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
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                flex: 1,
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
              {loading ? (isNew ? "יוצר..." : "שומר...") : (isNew ? "צור מוצר" : "שמור שינויים")}
            </button>
            {!isNew && (
              <button
                onClick={handleStockToggle}
                disabled={stockLoading}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  background: inStock ? "#ecfdf5" : "#fef2f2",
                  color: inStock ? "#047857" : "#991b1b",
                  border: "1px solid " + (inStock ? "#d1fae5" : "#fee2e2"),
                  borderRadius: 6,
                  fontWeight: 500,
                  fontSize: 14,
                  cursor: stockLoading ? "not-allowed" : "pointer",
                  opacity: stockLoading ? 0.6 : 1,
                }}
              >
                {stockLoading ? "עדכון..." : (inStock ? "✓ במלאי" : "✗ אזל")}
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
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
                סגור
              </button>
            )}
          </div>
      </div>
    </>
  );
}
