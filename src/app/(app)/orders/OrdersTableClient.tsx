"use client";

import { useState } from "react";

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

const statusBadgeColors: Record<string, { bg: string; text: string; label: string }> = {
  NEW: { bg: "#fef3c7", text: "#92400e", label: "חדש" },
  IN_PROGRESS: { bg: "#dbeafe", text: "#0c4a6e", label: "בעיבוד" },
  COMPLETED: { bg: "#dcfce7", text: "#166534", label: "הושלם" },
};

export default function OrdersTableClient({
  orders: initialOrders,
  initialOpenOrderId,
  showCustomerName = false,
  allowStatusAdvance = false,
  isUserView = false,
}: {
  orders: SerializedOrder[];
  initialOpenOrderId?: string;
  showCustomerName?: boolean;
  allowStatusAdvance?: boolean;
  isUserView?: boolean;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initialOpenOrderId || null);
  const [advancingOrderId, setAdvancingOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const handleAdvanceStatus = async (orderId: string) => {
    if (!allowStatusAdvance) return;

    setAdvancingOrderId(orderId);
    setError(null);
    setSuccessMessage(null);

    try {
      // Dynamic import to avoid circular dependencies
      const { advanceStatusAction } = await import("../staff/orders/actions");
      const result = await advanceStatusAction(orderId);

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
          customerName: (result.order as any).customerName,
        };

        // Update the orders list
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? updatedOrder : o))
        );

        setSuccessMessage(`Status advanced to ${statusBadgeColors[updatedOrder.status]?.label}`);
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
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
              <th style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: "#374151" }}>
                מס׳ הזמנה
              </th>
              {showCustomerName && (
                <th style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: "#374151" }}>
                  שם הלקוח
                </th>
              )}
              <th style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: "#374151" }}>
                תאריך
              </th>
              <th style={{ padding: "12px", textAlign: "center", fontWeight: 600, color: "#374151" }}>
                כמות פריטים
              </th>
              <th style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: "#374151" }}>
                סך הכל
              </th>
              <th style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: "#374151" }}>
                סטטוס
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => {
              const statusColors = statusBadgeColors[order.status] || statusBadgeColors.NEW;

              return (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    background: index % 2 === 0 ? "#fff" : "#fafafa",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      index % 2 === 0 ? "#f9fafb" : "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      index % 2 === 0 ? "#fff" : "#fafafa";
                  }}
                >
                  <td style={{ padding: "12px", color: "#4f46e5", fontWeight: 600 }}>
                    {order.orderNumber}
                  </td>
                  {showCustomerName && (
                    <td style={{ padding: "12px", color: "#374151" }}>
                      {order.customerName}
                    </td>
                  )}
                  <td style={{ padding: "12px", color: "#374151" }}>
                    {order.createdAt} {order.createdAtFull}
                  </td>
                  <td style={{ padding: "12px", color: "#374151", fontWeight: 600, textAlign: "center" }}>
                    {order.itemCount}
                  </td>
                  <td style={{ padding: "12px", color: "#374151", fontWeight: 600 }}>
                    ₪{order.total}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        borderRadius: "4px",
                        background: statusColors.bg,
                        color: statusColors.text,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {statusColors.label}
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
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "16px",
          }}
          onClick={() => setSelectedOrderId(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflow: "auto",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: "24px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#1f2937" }}>
                הזמנה {selectedOrder.orderNumber}
              </h1>
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 16px",
                  borderRadius: "6px",
                  background: statusBadgeColors[selectedOrder.status]?.bg,
                  color: statusBadgeColors[selectedOrder.status]?.text,
                  fontWeight: 600,
                  fontSize: 13,
                  whiteSpace: "nowrap",
                }}
              >
                {statusBadgeColors[selectedOrder.status]?.label}
              </span>
              <button
                onClick={() => setSelectedOrderId(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#6b7280",
                  padding: "0",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: "24px" }}>
              <div
                style={{
                  paddingBottom: 16,
                  borderBottom: "1px solid #e5e7eb",
                  marginBottom: 20,
                  fontSize: 14,
                  color: "#6b7280",
                }}
              >
                <p style={{ margin: "8px 0" }}>
                  <strong style={{ color: "#374151" }}>תאריך וזמן:</strong> {selectedOrder.createdAt} בשעה{" "}
                  {selectedOrder.createdAtFull}
                </p>
                <p style={{ margin: "8px 0" }}>
                  <strong style={{ color: "#374151" }}>סך הכל:</strong>{" "}
                  <span style={{ fontWeight: 700, fontSize: 16, color: "#1f2937" }}>
                    ₪{selectedOrder.total}
                  </span>
                </p>
              </div>

              {/* Items */}
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "#1f2937" }}>
                  פריטים בהזמנה
                </h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <th
                          style={{
                            padding: "10px 12px",
                            textAlign: "right",
                            fontWeight: 600,
                            color: "#374151",
                          }}
                        >
                          שם פריט
                        </th>
                        <th
                          style={{
                            padding: "10px 12px",
                            textAlign: "center",
                            fontWeight: 600,
                            color: "#374151",
                          }}
                        >
                          כמות
                        </th>
                        <th
                          style={{
                            padding: "10px 12px",
                            textAlign: "center",
                            fontWeight: 600,
                            color: "#374151",
                          }}
                        >
                          מחיר
                        </th>
                        <th
                          style={{
                            padding: "10px 12px",
                            textAlign: "left",
                            fontWeight: 600,
                            color: "#374151",
                          }}
                        >
                          סה"כ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "10px 12px", textAlign: "right", color: "#374151" }}>
                            {item.itemName}
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "center", color: "#374151" }}>
                            {item.quantity}
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "center", color: "#374151" }}>
                            ₪{item.unitPrice}
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#1f2937" }}>
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
                <div style={{ paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#1f2937" }}>
                    היסטוריית סטטוס
                  </h2>
                  <div style={{ fontSize: 13, color: "#374151" }}>
                    {selectedOrder.statusHistory.map((history, index) => (
                      <div
                        key={history.id}
                        style={{
                          display: "flex",
                          gap: 16,
                          paddingBottom: 16,
                          borderBottom:
                            index < selectedOrder.statusHistory.length - 1
                              ? "1px solid #e5e7eb"
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            paddingTop: 2,
                          }}
                        >
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              background: "#4f46e5",
                              marginBottom: 8,
                            }}
                          />
                          {index < selectedOrder.statusHistory.length - 1 && (
                            <div
                              style={{
                                width: 2,
                                height: 40,
                                background: "#e5e7eb",
                              }}
                            />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, marginBottom: 4, color: "#1f2937" }}>
                            {statusBadgeColors[history.toStatus]?.label || history.toStatus}
                          </div>
                          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                            {history.changedAt} בשעה {history.changedAtTime}
                          </div>
                          <div style={{ fontSize: 12, color: "#6b7280" }}>
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
                <div
                  style={{
                    background: "#fee2e2",
                    color: "#7f1d1d",
                    padding: "12px 16px",
                    borderRadius: "6px",
                    marginBottom: 16,
                    fontSize: 13,
                  }}
                >
                  {error}
                </div>
              )}

              {successMessage && (
                <div
                  style={{
                    background: "#dcfce7",
                    color: "#166534",
                    padding: "12px 16px",
                    borderRadius: "6px",
                    marginBottom: 16,
                    fontSize: 13,
                  }}
                >
                  {successMessage}
                </div>
              )}

              {/* Status Advancement Buttons */}
              {allowStatusAdvance && (
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  {/* Both User and Staff View: Show "העבר לטופל" for NEW or IN_PROGRESS */}
                  {(selectedOrder.status === "NEW" || selectedOrder.status === "IN_PROGRESS") && (
                    <button
                      onClick={() => handleAdvanceStatus(selectedOrder.id)}
                      disabled={advancingOrderId !== null}
                      style={{
                        background: "#4f46e5",
                        color: "#fff",
                        border: "none",
                        padding: "10px 16px",
                        borderRadius: "6px",
                        fontWeight: 600,
                        cursor: advancingOrderId !== null ? "not-allowed" : "pointer",
                        opacity: advancingOrderId !== null ? 0.6 : 1,
                        fontSize: 14,
                      }}
                    >
                      {advancingOrderId !== null ? "מעדכן..." : "העבר לטופל"}
                    </button>
                  )}

                  {selectedOrder.status === "COMPLETED" && (
                    <span style={{ fontSize: 14, color: "#9ca3af", fontWeight: 600 }}>
                      ✓ הזמנה הושלמה
                    </span>
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
