"use client";

import { useState } from "react";
import { advanceStatusAction } from "./actions";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  itemName: string;
}

interface OrderStatusHistory {
  id: string;
  toStatus: string;
  changedAt: string;
  changedAtTime: string;
  changerName: string;
}

interface SerializedOrder {
  id: string;
  orderNumber: number;
  status: string;
  total: string;
  itemCount: number;
  createdAt: string;
  createdAtFull: string;
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
}

const statusBadgeClasses: Record<string, { bgClassName: string; textClassName: string; label: string }> = {
  NEW: { bgClassName: "bg-yellow-100 dark:bg-yellow-900/30", textClassName: "text-yellow-800 dark:text-yellow-400", label: "חדש" },
  IN_PROGRESS: { bgClassName: "bg-blue-100 dark:bg-blue-900/30", textClassName: "text-blue-800 dark:text-blue-400", label: "בעיבוד" },
  COMPLETED: { bgClassName: "bg-green-100 dark:bg-green-900/30", textClassName: "text-green-800 dark:text-green-400", label: "הושלם" },
};

export default function StaffOrderDetailClient({ order: initialOrder }: { order: SerializedOrder }) {
  const [order, setOrder] = useState<SerializedOrder>(initialOrder);
  const [advancingToStatus, setAdvancingToStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAdvanceStatus = async (targetStatus?: string) => {
    setAdvancingToStatus(targetStatus || null);
    setError(null);
    setSuccessMessage(null);

    console.log("DEBUG: handleAdvanceStatus called with targetStatus=", targetStatus);
    const result = await advanceStatusAction(order.id, targetStatus);
    console.log("DEBUG: advanceStatusAction returned:", result);

    if (result.success && result.order) {
      // Serialize the updated order
      const items = result.order.items.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice).toFixed(2),
        subtotal: Number(item.subtotal).toFixed(2),
        itemName: item.item?.name || "Unknown Item",
      }));

      const updatedOrder: SerializedOrder = {
        id: result.order.id,
        orderNumber: result.order.orderNumber,
        status: result.order.status,
        total: Number(result.order.total).toFixed(2),
        itemCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
        createdAt: new Date(result.order.createdAt).toLocaleDateString("he-IL"),
        createdAtFull: new Date(result.order.createdAt).toLocaleTimeString("he-IL", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        items,
        statusHistory: result.order.statusHistory.map((history: any) => {
          const changerName = history.changer
            ? `${history.changer.firstName} ${history.changer.lastName}`
            : "Unknown";
          return {
            id: history.id,
            toStatus: history.toStatus,
            changedAt: new Date(history.changedAt).toLocaleDateString("he-IL"),
            changedAtTime: new Date(history.changedAt).toLocaleTimeString("he-IL", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            changerName,
          };
        }),
      };

      setOrder(updatedOrder);
      setSuccessMessage(`Status advanced to ${statusBadgeClasses[updatedOrder.status]?.label}`);
    } else {
      setError(result.error || "Failed to advance status");
    }

    setAdvancingToStatus(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl max-h-[90vh] overflow-auto w-full shadow-xl dark:shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-300 dark:border-gray-700 flex justify-between items-center gap-4">
          <h1 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">
            הזמנה {order.orderNumber}
          </h1>
          <span className={`inline-block px-4 py-1.5 rounded text-xs font-semibold whitespace-nowrap ${statusBadgeClasses[order.status]?.bgClassName} ${statusBadgeClasses[order.status]?.textClassName}`}>
            {statusBadgeClasses[order.status]?.label}
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="pb-4 border-b border-gray-300 dark:border-gray-700 mb-5 text-sm text-gray-600 dark:text-gray-400">
            <p className="m-2 m-t-0 m-b-0">
              <strong className="text-gray-700 dark:text-gray-300">תאריך וזמן:</strong> {order.createdAt} בשעה {order.createdAtFull}
            </p>
            <p className="m-2 m-t-0 m-b-0">
              <strong className="text-gray-700 dark:text-gray-300">סך הכל:</strong>{" "}
              <span className="font-bold text-base text-gray-900 dark:text-white">
                ₪{order.total}
              </span>
            </p>
          </div>

          {/* Items */}
          <div className="mb-5">
            <h2 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">
              פריטים בהזמנה
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-700">
                    <th className="p-2.5 text-right font-semibold text-gray-700 dark:text-gray-300">
                      שם פריט
                    </th>
                    <th className="p-2.5 text-center font-semibold text-gray-700 dark:text-gray-300">
                      כמות
                    </th>
                    <th className="p-2.5 text-center font-semibold text-gray-700 dark:text-gray-300">
                      מחיר
                    </th>
                    <th className="p-2.5 text-left font-semibold text-gray-700 dark:text-gray-300">
                      סה"כ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="p-2.5 text-right text-gray-700 dark:text-gray-300">
                        {item.itemName}
                      </td>
                      <td className="p-2.5 text-center text-gray-700 dark:text-gray-300">
                        {item.quantity}
                      </td>
                      <td className="p-2.5 text-center text-gray-700 dark:text-gray-300">
                        ₪{item.unitPrice}
                      </td>
                      <td className="p-2.5 text-left font-semibold text-gray-900 dark:text-white">
                        ₪{item.subtotal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="pt-4 border-t border-gray-300 dark:border-gray-700 mb-5">
              <h2 className="text-base font-semibold mb-4 text-gray-900 dark:text-white">
                היסטוריית סטטוס
              </h2>
              <div className="text-xs text-gray-700 dark:text-gray-300">
                {order.statusHistory.map((history, index) => (
                  <div
                    key={history.id}
                    className={`flex gap-4 pb-4 ${index < order.statusHistory.length - 1 ? "border-b border-gray-300 dark:border-gray-700" : ""}`}
                  >
                    <div className="flex flex-col items-center pt-0.5">
                      <div className="w-3 h-3 rounded-full bg-indigo-500 dark:bg-indigo-400 mb-2" />
                      {index < order.statusHistory.length - 1 && (
                        <div className="w-0.5 h-10 bg-gray-300 dark:bg-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold mb-1 text-gray-900 dark:text-white">
                        {statusBadgeClasses[history.toStatus]?.label || history.toStatus}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {history.changedAt} בשעה {history.changedAtTime}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        על ידי: {history.changerName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded text-xs mb-4">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-3 rounded text-xs mb-4">
              {successMessage}
            </div>
          )}

          {/* Status Advancement Buttons */}
          <div className="flex gap-3 justify-end flex-row-reverse">
            {order.status === "NEW" && (
              <>
                <button
                  onClick={() => handleAdvanceStatus("IN_PROGRESS")}
                  disabled={advancingToStatus !== null}
                  className="bg-indigo-500 dark:bg-indigo-600 text-white border-none px-4 py-2 rounded font-semibold cursor-pointer hover:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition text-sm"
                >
                  {advancingToStatus !== null ? "מעדכן..." : "העבר לעיבוד"}
                </button>
                <button
                  onClick={() => handleAdvanceStatus("COMPLETED")}
                  disabled={advancingToStatus !== null}
                  className="bg-green-600 dark:bg-green-700 text-white border-none px-4 py-2 rounded font-semibold cursor-pointer hover:bg-green-700 dark:hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed transition text-sm"
                >
                  {advancingToStatus !== null ? "מעדכן..." : "העבר להושלם"}
                </button>
              </>
            )}

            {order.status === "IN_PROGRESS" && (
              <button
                onClick={() => handleAdvanceStatus("COMPLETED")}
                disabled={advancingToStatus !== null}
                className="bg-green-600 dark:bg-green-700 text-white border-none px-4 py-2 rounded font-semibold cursor-pointer hover:bg-green-700 dark:hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed transition text-sm"
              >
                {advancingToStatus !== null ? "מעדכן..." : "העבר להושלם"}
              </button>
            )}

            {order.status === "COMPLETED" && (
              <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                ✓ הזמנה הושלמה
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
