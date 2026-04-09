import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import EditUserForm from "./EditUserForm";
import AddTransactionForm from "./AddTransactionForm";
import ResetPasswordDialog from "./ResetPasswordDialog";

export const metadata = { title: "עריכת משתמש – TarbutRM" };

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const { id } = await params;

  const [user, transactions] = await Promise.all([
    prisma.user.findUnique({ where: { id } }),
    prisma.budgetTransaction.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) notFound();

  const creatorIds = [...new Set(transactions.map((t) => t.createdBy))];
  const creators = await prisma.user.findMany({
    where: { id: { in: creatorIds } },
    select: { id: true, firstName: true, lastName: true, role: true },
  });
  const creatorMap = Object.fromEntries(creators.map((c) => [c.id, c]));

  const serialized = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    city: user.city,
    street: user.street,
    role: user.role,
    active: user.active,
    balance: user.balance.toFixed(2),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="text-sm text-indigo-400 hover:text-indigo-300"
        >
          ← חזרה לרשימה
        </Link>
        <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
        <span
          style={{
            padding: "2px 10px",
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            background: user.active ? "#dcfce7" : "#fee2e2",
            color: user.active ? "#166534" : "#991b1b",
          }}
        >
          {user.active ? "פעיל" : "מושבת"}
        </span>
        <span
          style={{
            marginRight: "auto",
            fontSize: 22,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            color: Number(user.balance) >= 0 ? "#4ade80" : "#f87171",
          }}
        >
          יתרה: {serialized.balance} ₪
        </span>
      </div>

      {/* Edit form */}
      <div className="rounded-xl bg-white px-8 py-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900">פרטי משתמש</h2>
        <EditUserForm user={serialized} />
        <div className="pt-1 border-t border-gray-100">
          <ResetPasswordDialog userId={user.id} />
        </div>
      </div>

      {/* Transaction history */}
      <div className="rounded-xl bg-white px-8 py-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">היסטוריית עסקאות</h2>
          <AddTransactionForm userId={user.id} />
        </div>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-400">אין עסקאות עדיין</p>
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
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th style={th}>תאריך</th>
                  <th style={th}>סוג</th>
                  <th style={th}>סכום</th>
                  <th style={th}>הערה</th>
                  <th style={th}>בוצע על ידי</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const amt = Number(tx.amount);
                  const isIn = amt > 0;
                  return (
                    <tr key={tx.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={td}>
                        {tx.createdAt.toLocaleDateString("he-IL", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td style={td}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 10,
                            fontSize: 12,
                            fontWeight: 600,
                            background: isIn ? "#dcfce7" : "#fee2e2",
                            color: isIn ? "#166534" : "#991b1b",
                          }}
                        >
                          {isIn ? "הפקדה" : "החזר"}
                        </span>
                      </td>
                      <td
                        style={{
                          ...td,
                          fontVariantNumeric: "tabular-nums",
                          fontWeight: 600,
                          color: isIn ? "#166534" : "#991b1b",
                        }}
                      >
                        {isIn ? "+" : ""}
                        {amt.toFixed(2)} ₪
                      </td>
                      <td style={{ ...td, color: "#6b7280" }}>{tx.note ?? "—"}</td>
                      <td style={{ ...td, color: "#6b7280" }}>
                        {(() => {
                          const c = creatorMap[tx.createdBy];
                          if (!c) return tx.createdBy;
                          const isSelf = c.id === user.id;
                          return (
                            <span style={{
                              padding: "2px 8px",
                              borderRadius: 10,
                              fontSize: 12,
                              fontWeight: 600,
                              background: isSelf ? "#eff6ff" : "#faf5ff",
                              color: isSelf ? "#1d4ed8" : "#7e22ce",
                            }}>
                              {isSelf ? "המשתמש" : `${c.firstName} ${c.lastName}`}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "10px 12px",
  textAlign: "right",
  fontWeight: 600,
  color: "#374151",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "10px 12px",
  color: "#374151",
};
