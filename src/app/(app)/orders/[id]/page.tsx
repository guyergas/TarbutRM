import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { orderService } from "@/modules/order";
import Link from "next/link";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const order = await orderService.getOrder(id);

  if (!order) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: "#374151" }}>
          הזמנה לא נמצאה
        </h1>
        <Link href="/orders" style={{ color: "#3b82f6", textDecoration: "underline" }}>
          חזור להזמנות
        </Link>
      </div>
    );
  }

  // Verify user owns this order
  if (order.userId !== session.user.id) {
    redirect("/orders");
  }

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    NEW: { bg: "#fef3c7", text: "#92400e", label: "חדש" },
    IN_PROGRESS: { bg: "#dbeafe", text: "#0c4a6e", label: "בעיבוד" },
    COMPLETED: { bg: "#dcfce7", text: "#166534", label: "הושלם" },
  };

  const statusColor = statusColors[order.status] || statusColors.NEW;
  const createdDate = new Date(order.createdAt).toLocaleDateString("he-IL");

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link
          href="/orders"
          style={{
            display: "inline-block",
            marginBottom: 16,
            color: "#3b82f6",
            textDecoration: "underline",
            fontSize: 14,
          }}
        >
          ← חזור להזמנות
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
            הזמנה #{order.id.slice(0, 8)}
          </h1>
          <span
            style={{
              display: "inline-block",
              padding: "6px 16px",
              borderRadius: "4px",
              background: statusColor.bg,
              color: statusColor.text,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {statusColor.label}
          </span>
        </div>

        <p style={{ color: "#6b7280", margin: 0 }}>
          תאריך: {createdDate}
        </p>
      </div>

      {/* Items Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: 24,
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>פריטים</h2>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "12px", textAlign: "right", fontWeight: 600 }}>
                  שם פריט
                </th>
                <th style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>
                  כמות
                </th>
                <th style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>
                  מחיר יחידה
                </th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>
                  סך הכל
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    {item.item.name}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    ₪{Number(item.unitPrice).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>
                    ₪{Number(item.subtotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "16px 12px",
            borderTop: "2px solid #e5e7eb",
            marginTop: 16,
          }}
        >
          <div style={{ display: "flex", gap: 16, minWidth: 200 }}>
            <span style={{ fontWeight: 600 }}>סה"כ:</span>
            <span style={{ fontWeight: 700, fontSize: 18 }}>
              ₪{Number(order.total).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Status History */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div
          style={{
            background: "#fff",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            היסטוריית סטטוס
          </h2>
          <div style={{ fontSize: 14, color: "#374151" }}>
            {order.statusHistory.map((history, index) => {
              const date = new Date(history.changedAt).toLocaleDateString("he-IL");
              const time = new Date(history.changedAt).toLocaleTimeString("he-IL", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const changerName = `${history.changer.firstName} ${history.changer.lastName}`;

              return (
                <div
                  key={history.id}
                  style={{
                    display: "flex",
                    gap: 16,
                    paddingBottom: 16,
                    borderBottom: index < order.statusHistory!.length - 1 ? "1px solid #e5e7eb" : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: "#3b82f6",
                        marginBottom: 8,
                      }}
                    />
                    {index < order.statusHistory!.length - 1 && (
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
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      {statusColors[history.toStatus]?.label || history.toStatus}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                      {date} בשעה {time}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      על ידי: {changerName}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
