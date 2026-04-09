import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import RegisterModal from "@/components/RegisterModal";

export const metadata = { title: "ניהול משתמשים – TarbutRM" };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      balance: true,
      role: true,
      active: true,
    },
  });

  const totalBalance = users.reduce((sum, u) => sum + Number(u.balance), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <h1 className="text-2xl font-bold">ניהול משתמשים</h1>
          <RegisterModal
            triggerLabel="+ חדש"
            triggerClassName="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 border-none cursor-pointer"
          />
        </div>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>סה״כ תקציב</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111827", fontVariantNumeric: "tabular-nums" }}>
            {totalBalance.toFixed(2)} ₪
          </div>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
            background: "#fff",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={th}>שם</th>
              <th style={th}>אימייל</th>
              <th style={th}>טלפון</th>
              <th style={th}>תקציב</th>
              <th style={th}>תפקיד</th>
              <th style={th}>סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr
                key={user.id}
                style={{
                  borderBottom: "1px solid #f3f4f6",
                  background: i % 2 === 0 ? "#fff" : "#fafafa",
                  cursor: "pointer",
                }}
              >
                <td style={td}>
                  <Link
                    href={`/admin/user/${user.id}`}
                    style={{ color: "inherit", textDecoration: "none", display: "block" }}
                  >
                    {user.firstName} {user.lastName}
                  </Link>
                </td>
                <td style={td}>{user.email}</td>
                <td style={td}>{user.phone ?? "—"}</td>
                <td style={{ ...td, fontVariantNumeric: "tabular-nums" }}>
                  {Number(user.balance).toFixed(2)} ₪
                </td>
                <td style={td}>{roleLabel(user.role)}</td>
                <td style={td}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      background: user.active ? "#dcfce7" : "#fee2e2",
                      color: user.active ? "#166534" : "#991b1b",
                    }}
                  >
                    {user.active ? "פעיל" : "מושבת"}
                  </span>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} style={{ ...td, textAlign: "center", color: "#9ca3af" }}>
                  אין משתמשים במערכת
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "right",
  fontWeight: 600,
  color: "#374151",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "12px 16px",
  color: "#374151",
};

function roleLabel(role: string) {
  if (role === "ADMIN") return "מנהל";
  if (role === "STAFF") return "צוות";
  return "משתמש";
}
