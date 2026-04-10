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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <h2 className="m-0 mb-4 text-lg font-bold text-gray-900 dark:text-white">
              חתוך את התמונה
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              הזז וגדל את הריבוע כדי לחתוך את התמונה לפורמט ריבועי
            </p>

            <div
              ref={cropperContainerRef}
              className="relative w-full max-w-sm mx-auto mb-6 overflow-hidden rounded-lg border-2 border-gray-300 dark:border-gray-600 aspect-square bg-gray-100 dark:bg-gray-700"
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
                  zIndex: 10,
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

            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                גודל החתיכה: {cropSize}px
              </label>
              <input
                type="range"
                min="50"
                max="400"
                value={cropSize}
                onChange={(e) => setCropSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCropImage}
                className="flex-1 py-2.5 px-4 bg-blue-600 dark:bg-blue-700 text-white border-none rounded-md font-medium cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-600 transition"
              >
                חתוך ושמור
              </button>
              <button
                onClick={handleCropCancel}
                className="flex-1 py-2.5 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white border-none rounded-md font-medium cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition"
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
        className="fixed inset-0 bg-black/50 z-100"
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl dark:shadow-2xl z-101 max-w-lg w-11/12 max-h-[90vh] overflow-y-auto rtl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 bg-none border-none text-2xl cursor-pointer text-gray-600 dark:text-gray-400 z-10 hover:text-gray-900 dark:hover:text-gray-200"
        >
          ✕
        </button>

        {/* Image */}
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-80 object-contain bg-gray-100 dark:bg-gray-700"
          />
        ) : (
          <div className="w-full h-80 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
            אין תמונה
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Name and Price - Compact Layout */}
          <div className="mb-4">
            <div className="flex gap-3 mb-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
                  שם המוצר
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs ${
                    isReadOnly
                      ? "bg-gray-100 dark:bg-gray-700"
                      : "bg-white dark:bg-gray-700"
                  } text-gray-900 dark:text-white disabled:opacity-50`}
                />
              </div>
              <div className="w-20">
                <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
                  מחיר (₪)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs ${
                    isReadOnly
                      ? "bg-gray-100 dark:bg-gray-700"
                      : "bg-white dark:bg-gray-700"
                  } text-gray-900 dark:text-white disabled:opacity-50`}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
              תיאור
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isReadOnly}
              className={`w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs min-h-[60px] font-family-inherit ${
                isReadOnly
                  ? "bg-gray-100 dark:bg-gray-700"
                  : "bg-white dark:bg-gray-700"
              } text-gray-900 dark:text-white disabled:opacity-50`}
            />
          </div>

          {/* Image Upload - Admin Only */}
          {canEdit && (
            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
                תמונה
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                JPG, PNG עד 5MB
              </p>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-2">
                  <div className="w-32 h-32 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={imagePreview}
                      alt={name}
                      className="w-full h-full object-cover"
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
          {canToggleStock && stockHistory.length > 0 && (
            <div className="mb-3">
              <h3 className="font-semibold mb-2 text-xs text-gray-600 dark:text-gray-400">
                היסטוריית מלאי
              </h3>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="p-1 text-right font-semibold text-xs text-gray-700 dark:text-gray-300">
                      סטטוס
                    </th>
                    <th className="p-1 text-right font-semibold text-xs text-gray-700 dark:text-gray-300">
                      בידי
                    </th>
                    <th className="p-1 text-right font-semibold text-xs text-gray-700 dark:text-gray-300">
                      תאריך
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stockHistory.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="p-1">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-xs font-semibold ${
                            record.inStock
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                          }`}
                        >
                          {record.inStock ? "במלאי" : "אזל"}
                        </span>
                      </td>
                      <td className="p-1 text-xs text-gray-700 dark:text-gray-300">
                        {record.changer.firstName} {record.changer.lastName}
                      </td>
                      <td className="p-1 text-xs text-gray-600 dark:text-gray-400">
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
            <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded text-xs">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-xs">
              {success}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {canToggleStock && (
              <button
                onClick={handleStockToggle}
                disabled={stockLoading}
                className={`flex-1 py-2 px-3 border rounded text-xs font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition ${
                  inStock
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                }`}
              >
                {stockLoading ? "עדכון..." : (inStock ? "✓ במלאי" : "✗ אזל")}
              </button>
            )}

            {canEdit && (
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-2 px-3 bg-blue-600 dark:bg-blue-700 text-white border-none rounded text-xs font-medium cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "שומר..." : "שמור שינויים"}
              </button>
            )}

            <button
              onClick={onClose}
              className="flex-1 py-2 px-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white border-none rounded text-xs font-medium cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
