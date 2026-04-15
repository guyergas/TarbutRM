"use client";

import { useState, useEffect } from "react";

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
  customerName?: string;
}

const statusBadgeConfig: Record<string, { bgClass: string; textClass: string; label: string }> = {
  NEW: { bgClass: "bg-yellow-100 dark:bg-yellow-900/30", textClass: "text-yellow-700 dark:text-yellow-400", label: "חדש" },
  IN_PROGRESS: { bgClass: "bg-blue-100 dark:bg-blue-900/30", textClass: "text-blue-700 dark:text-blue-400", label: "בעיבוד" },
  COMPLETED: { bgClass: "bg-green-100 dark:bg-green-900/30", textClass: "text-green-700 dark:text-green-400", label: "הושלם" },
};

export default function OrdersTableClient({
  orders: initialOrders,
  initialOpenOrderId,
  showCustomerName = false,
  allowStatusAdvance = false,
  isUserView = false,
  isStaffQueue = false,
  onStatusUpdated,
  selectedOrderId: externalSelectedOrderId,
  onSelectedOrderIdChange,
  allOrders,
}: {
  orders: SerializedOrder[];
  initialOpenOrderId?: string;
  showCustomerName?: boolean;
  allowStatusAdvance?: boolean;
  isUserView?: boolean;
  isStaffQueue?: boolean;
  onStatusUpdated?: (updatedOrder: SerializedOrder) => void;
  selectedOrderId?: string | null;
  onSelectedOrderIdChange?: (id: string | null) => void;
  allOrders?: SerializedOrder[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [internalSelectedOrderId, setInternalSelectedOrderId] = useState<string | null>(initialOpenOrderId || null);
  const isControlled = externalSelectedOrderId !== undefined;
  const selectedOrderId = isControlled ? externalSelectedOrderId : internalSelectedOrderId;
  const setSelectedOrderId = (id: string | null) => {
    if (!isControlled) setInternalSelectedOrderId(id);
    onSelectedOrderIdChange?.(id);
  };

  // Sync orders from parent without closing the popup
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const [advancingOrderId, setAdvancingOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Look up selected order from allOrders (full list) so popup stays open when order moves between sections
  const lookupOrders = allOrders ?? orders;
  const selectedOrder = lookupOrders.find((o) => o.id === selectedOrderId);

  const handleAdvanceStatus = async (orderId: string, targetStatus?: string) => {
    if (!allowStatusAdvance) return;

    setAdvancingOrderId(orderId);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log("DEBUG OrdersTableClient: handleAdvanceStatus called with targetStatus=", targetStatus);
      // Dynamic import to avoid circular dependencies
      const { advanceStatusAction } = await import("../staff/orders/actions");
      const result = await advanceStatusAction(orderId, targetStatus);
      console.log("DEBUG OrdersTableClient: result=", result);

      if (result.success && result.order) {
        // Serialize the updated order
        const items = result.order!.items.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice).toFixed(2),
          subtotal: Number(item.subtotal).toFixed(2),
          itemName: item.item?.name || "Unknown Item",
        }));

        const updatedOrder: SerializedOrder = {
          id: result.order!.id,
          orderNumber: result.order!.orderNumber,
          status: result.order!.status,
          total: Number(result.order!.total).toFixed(2),
          itemCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
          createdAt: new Date(result.order!.createdAt).toLocaleDateString("he-IL"),
          createdAtFull: new Date(result.order!.createdAt).toLocaleTimeString("he-IL", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          items,
          statusHistory: result.order!.statusHistory.map((history: any) => {
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
          customerName: (result.order! as any).customerName ?? orders.find((o) => o.id === orderId)?.customerName,
        };

        // Update the orders list
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? updatedOrder : o))
        );

        // Call the callback to notify parent of the status update
        if (onStatusUpdated) {
          onStatusUpdated(updatedOrder);
        }

        setSuccessMessage(`Status advanced to ${statusBadgeConfig[updatedOrder.status]?.label}`);
      } else {
        setError(result.error || "Failed to advance status");
      }
    } catch (err) {
      setError("Failed to advance status");
    } finally {
      setAdvancingOrderId(null);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th className="px-3 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                מס׳ הזמנה
              </th>
              {showCustomerName && (
                <th className="px-3 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                  שם הלקוח
                </th>
              )}
              <th className="px-3 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                תאריך
              </th>
              <th className="px-3 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                כמות פריטים
              </th>
              <th className="px-3 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                סך הכל
              </th>
              <th className="px-3 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                סטטוס
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => {
              const config = statusBadgeConfig[order.status] || statusBadgeConfig.NEW;
              const isEven = index % 2 === 0;

              return (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`border-b border-gray-200 dark:border-gray-700 cursor-pointer transition ${
                    isEven
                      ? "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                      : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <td className="px-3 py-3 text-indigo-600 dark:text-indigo-400 font-semibold">
                    {order.orderNumber}
                  </td>
                  {showCustomerName && (
                    <td className="px-3 py-3 text-gray-700 dark:text-gray-300">
                      {order.customerName}
                    </td>
                  )}
                  <td className="px-3 py-3 text-gray-700 dark:text-gray-300">
                    {order.createdAt} {order.createdAtFull}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-700 dark:text-gray-300 font-semibold">
                    {order.itemCount}
                  </td>
                  <td className="px-3 py-3 text-gray-700 dark:text-gray-300 font-semibold">
                    ₪{order.total}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${config.bgClass} ${config.textClass}`}>
                      {config.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOrderId(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto w-full shadow-xl dark:shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">
                  הזמנה {selectedOrder.orderNumber}
                </h1>
                {selectedOrder.customerName && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    לקוח: <span className="font-semibold text-gray-900 dark:text-white">{selectedOrder.customerName}</span>
                  </p>
                )}
              </div>
              <span className={`inline-block px-4 py-1.5 rounded text-sm font-semibold whitespace-nowrap ${statusBadgeConfig[selectedOrder.status]?.bgClass} ${statusBadgeConfig[selectedOrder.status]?.textClass}`}>
                {statusBadgeConfig[selectedOrder.status]?.label}
              </span>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="bg-none border-none text-2xl cursor-pointer text-gray-500 dark:text-gray-400 p-0 w-8 h-8 flex items-center justify-center hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="pb-4 border-b border-gray-200 dark:border-gray-700 mb-5 text-sm text-gray-600 dark:text-gray-400">
                <p className="my-2">
                  <strong className="text-gray-900 dark:text-white">תאריך וזמן:</strong> {selectedOrder.createdAt} בשעה {selectedOrder.createdAtFull}
                </p>
                <p className="my-2">
                  <strong className="text-gray-900 dark:text-white">סך הכל:</strong>{" "}
                  <span className="font-bold text-lg text-gray-900 dark:text-white">
                    ₪{selectedOrder.total}
                  </span>
                </p>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  פריטים בהזמנה
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-3 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">
                          שם פריט
                        </th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-700 dark:text-gray-300">
                          כמות
                        </th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-700 dark:text-gray-300">
                          מחיר
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                          סה"כ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">
                            {item.itemName}
                          </td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">
                            {item.quantity}
                          </td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">
                            ₪{item.unitPrice}
                          </td>
                          <td className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white">
                            ₪{item.subtotal}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status History */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    היסטוריית סטטוס
                  </h2>
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    {selectedOrder.statusHistory.map((history, index) => (
                      <div
                        key={history.id}
                        className={`flex gap-4 pb-4 ${
                          index < selectedOrder.statusHistory.length - 1
                            ? "border-b border-gray-200 dark:border-gray-700"
                            : ""
                        }`}
                      >
                        <div className="flex flex-col items-center pt-0.5">
                          <div className="w-3 h-3 rounded-full bg-indigo-600 dark:bg-indigo-500 mb-2" />
                          {index < selectedOrder.statusHistory.length - 1 && (
                            <div className="w-0.5 h-10 bg-gray-200 dark:bg-gray-700" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1 text-gray-900 dark:text-white">
                            {statusBadgeConfig[history.toStatus]?.label || history.toStatus}
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

              {/* Error/Success Messages */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded text-xs mb-4">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-3 rounded text-xs mb-4">
                  {successMessage}
                </div>
              )}

              {/* Status Advancement Buttons */}
              {allowStatusAdvance && (
                <div className="flex gap-3 justify-end">
                  {isStaffQueue ? (
                    /* Staff Queue View: Show both buttons - can skip בעיבוד if needed */
                    <>
                      {selectedOrder.status === "NEW" && (
                        <>
                          <button
                            onClick={() => handleAdvanceStatus(selectedOrder.id, "IN_PROGRESS")}
                            disabled={advancingOrderId !== null}
                            className="bg-indigo-600 dark:bg-indigo-700 text-white border-none px-4 py-2 rounded font-semibold cursor-pointer hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition"
                          >
                            {advancingOrderId !== null ? "מעדכן..." : "העבר לעיבוד"}
                          </button>
                          <button
                            onClick={() => handleAdvanceStatus(selectedOrder.id, "COMPLETED")}
                            disabled={advancingOrderId !== null}
                            className="bg-green-600 dark:bg-green-700 text-white border-none px-4 py-2 rounded font-semibold cursor-pointer hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition"
                          >
                            {advancingOrderId !== null ? "מעדכן..." : "העבר להושלם"}
                          </button>
                        </>
                      )}

                      {selectedOrder.status === "IN_PROGRESS" && (
                        <button
                          onClick={() => handleAdvanceStatus(selectedOrder.id)}
                          disabled={advancingOrderId !== null}
                          className="bg-green-600 dark:bg-green-700 text-white border-none px-4 py-2 rounded font-semibold cursor-pointer hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition"
                        >
                          {advancingOrderId !== null ? "מעדכן..." : "העבר להושלם"}
                        </button>
                      )}

                      {selectedOrder.status === "COMPLETED" && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold">
                          ✓ הזמנה הושלמה
                        </span>
                      )}
                    </>
                  ) : (
                    /* User View: Show only "העבר להושלם" */
                    <>
                      {(selectedOrder.status === "NEW" || selectedOrder.status === "IN_PROGRESS") && (
                        <button
                          onClick={() => handleAdvanceStatus(selectedOrder.id, "COMPLETED")}
                          disabled={advancingOrderId !== null}
                          className="bg-green-600 dark:bg-green-700 text-white border-none px-4 py-2 rounded font-semibold cursor-pointer hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition"
                        >
                          {advancingOrderId !== null ? "מעדכן..." : "העבר להושלם"}
                        </button>
                      )}

                      {selectedOrder.status === "COMPLETED" && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold">
                          ✓ הזמנה הושלמה
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
