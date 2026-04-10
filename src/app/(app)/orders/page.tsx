import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { orderService } from "@/modules/order";
import Link from "next/link";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const orders = await orderService.listUserOrders(session.user.id);

  const statusBadgeColors: Record<string, { bg: string; text: string; label: string }> = {
    NEW: { bg: "#fef3c7", text: "#92400e", label: "חדש" },
    IN_PROGRESS: { bg: "#dbeafe", text: "#0c4a6e", label: "בעיבוד" },
    COMPLETED: { bg: "#dcfce7", text: "#166534", label: "הושלם" },
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>ההזמנות שלי</h1>

      {orders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            color: "#6b7280",
          }}
        >
          <p style={{ marginBottom: 16 }}>אין לך הזמנות עדיין</p>
          <Link href="/store" style={{ color: "#3b82f6", textDecoration: "underline" }}>
            לחזור לחנות
          </Link>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  מס׳ הזמנה
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  תאריך
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  סך הכל
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  סטטוס
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const statusColors = statusBadgeColors[order.status] || statusBadgeColors.NEW;
                const date = new Date(order.createdAt).toLocaleDateString("he-IL");

                return (
                  <tr
                    key={order.id}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      background: index % 2 === 0 ? "#fff" : "#fafafa",
                    }}
                  >
                    <td style={{ padding: "12px", color: "#374151" }}>
                      <Link
                        href={`/orders/${order.id}`}
                        style={{
                          color: "#3b82f6",
                          textDecoration: "none",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLElement).style.textDecoration = "underline";
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLElement).style.textDecoration = "none";
                        }}
                      >
                        #{order.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td style={{ padding: "12px", color: "#374151" }}>{date}</td>
                    <td style={{ padding: "12px", color: "#374151", fontWeight: 600 }}>
                      ₪{Number(order.total).toFixed(2)}
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
      )}
    </div>
  );
}
