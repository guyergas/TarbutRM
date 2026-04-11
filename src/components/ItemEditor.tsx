"use client";

import { useState, useEffect, useRef } from "react";
// Note: updateItemAction and toggleStockAction are not available in this context
// This component is only used for creating new items (isNew=true)
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

  // Set crop size and max to match the container size when cropper is shown
  useEffect(() => {
    if (showCropper && cropperContainerRef.current && uploadedImage) {
      const containerSize = cropperContainerRef.current.offsetWidth;
      if (containerSize > 0) {
        // Always set max to container size to limit slider to frame
        setMaxCropSize(containerSize);
        // Only set crop size if it's still the default 400
        if (cropSize === 400) {
          setCropSize(containerSize);
        }
      }
    }
  }, [showCropper, uploadedImage, cropSize]);

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

      // Read image dimensions to set default crop size
      const img = new Image();
      img.onload = () => {
        // Default crop size to min(width, height) of the uploaded image
        const minDimension = Math.min(img.width, img.height);
        setCropSize(minDimension);
        setMaxCropSize(minDimension);

        setShowCropper(true);
      };
      img.src = result;

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

      // Calculate max size: don't upscale, limited by actual image size
      const maxSafeSize = Math.min(imageW, imageH);
      setMaxCropSize(maxSafeSize);

      // Use the actual crop size in image coordinates, capped at max safe size
      const finalSize = Math.min(imageCropSize, maxSafeSize);

      const canvas = document.createElement("canvas");
      canvas.width = finalSize;
      canvas.height = finalSize;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Enable rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "medium";

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
        // Use JPEG with reduced quality (0.8) to reduce file size
        const croppedImage = canvas.toDataURL("image/jpeg", 0.8);
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

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await createItem(section.id, name, parseFloat(price), description, image);
      setSuccess("המוצר נוצר בהצלחה");
      // Close popup after successful save
      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה ביצירת המוצר");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {/* Image Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <h2 className="m-0 mb-4 text-lg font-bold text-gray-900 dark:text-white">
              חתוך את התמונה
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              הזז וגדל את הריבוע כדי לחתוך את התמונה לפורמט ריבועי
            </p>

            {/* Cropper Container */}
            <div
              ref={cropperContainerRef}
              className="relative w-full max-w-sm mx-auto mb-6 overflow-hidden rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 aspect-square"
            >
              <img
                src={uploadedImage}
                alt="Upload preview"
                className="absolute w-full h-full object-contain"
                style={{ imageRendering: "crisp-edges" }}
              />

              {/* Crop Box */}
              <div
                className="absolute border-4 border-blue-500 dark:border-blue-400 cursor-move bg-blue-500/10 dark:bg-blue-400/10 select-none"
                style={{
                  left: `${cropX}px`,
                  top: `${cropY}px`,
                  width: `${cropSize}px`,
                  height: `${cropSize}px`,
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
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                גודל החתיכה: {Math.min(cropSize, maxCropSize)}px (מקסימום: {maxCropSize}px)
              </label>
              <input
                type="range"
                min="50"
                max={maxCropSize}
                value={Math.min(cropSize, maxCropSize)}
                onChange={(e) => setCropSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCropImage}
                className="flex-1 py-2.5 px-4 bg-blue-500 dark:bg-blue-600 text-white border-none rounded font-medium cursor-pointer hover:bg-blue-600 dark:hover:bg-blue-700 transition"
              >
                חתוך ושמור
              </button>
              <button
                onClick={handleCropCancel}
                className="flex-1 py-2.5 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-none rounded font-medium cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div>
          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-900 dark:text-gray-100">
              שם המוצר
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-900 dark:text-gray-100">
              תיאור
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-24"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-900 dark:text-gray-100">
              מחיר (₪)
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-900 dark:text-gray-100">
              תמונה
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              תמונה JPG, PNG עד 5MB
            </p>
          </div>


          {/* Stock History */}
          {!isNew && stockHistory.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-sm text-gray-900 dark:text-gray-100">
                היסטוריית מלאי
              </h3>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-600">
                    <th className="p-2 text-right font-semibold text-gray-900 dark:text-gray-100">
                      סטטוס
                    </th>
                    <th className="p-2 text-right font-semibold text-gray-900 dark:text-gray-100">
                      בידי
                    </th>
                    <th className="p-2 text-right font-semibold text-gray-900 dark:text-gray-100">
                      תאריך
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stockHistory.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="p-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            record.inStock
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                          }`}
                        >
                          {record.inStock ? "במלאי" : "אזל"}
                        </span>
                      </td>
                      <td className="p-2 text-gray-900 dark:text-gray-100">
                        {record.changer.firstName} {record.changer.lastName}
                        <br />
                        <span className="text-gray-600 dark:text-gray-400 text-xs">
                          ({record.changer.role})
                        </span>
                      </td>
                      <td className="p-2 text-gray-900 dark:text-gray-100">
                        {new Date(typeof record.changedAt === 'string' ? record.changedAt : record.changedAt.toISOString()).toLocaleDateString("he-IL")}
                        <br />
                        <span className="text-gray-600 dark:text-gray-400 text-xs">
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
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-sm">
              {success}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-blue-500 dark:bg-blue-600 text-white border-none rounded font-medium cursor-pointer hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (isNew ? "יוצר..." : "שומר...") : (isNew ? "צור מוצר" : "שמור שינויים")}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-none rounded font-medium cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                סגור
              </button>
            )}
          </div>
      </div>
    </>
  );
}
