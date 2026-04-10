"use client";

import { useState } from "react";
import Link from "next/link";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "USER" | "STAFF" | "ADMIN";
  balance: string;
  city: string;
  phone?: string;
  street?: string;
  createdAt: string;
}

interface Transaction {
  id: string;
  userId: string;
  amount: string;
  note?: string;
  createdBy: string;
  createdAt: string;
  creatorName?: string;
  creatorRole?: string;
}

interface Order {
  id: string;
  orderNumber: number;
  status: "NEW" | "IN_PROGRESS" | "COMPLETED";
  total: string;
  itemCount: number;
  createdAt: string;
  createdAtFull: string;
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
    itemName: string;
  }>;
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "מנהל",
  STAFF: "צוות",
  USER: "לקוח",
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  NEW: { label: "חדש", color: "#fbbf24" },
  IN_PROGRESS: { label: "בעיבוד", color: "#3b82f6" },
  COMPLETED: { label: "הושלם", color: "#10b981" },
};

type Tab = "profile" | "wallet" | "orders";

export default function PersonalAreaClient({
  user,
  transactions,
  orders,
}: {
  user: User;
  transactions: Transaction[];
  orders: Order[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const joined = new Intl.DateTimeFormat("he-IL", { dateStyle: "long" }).format(
    new Date(user.createdAt)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          האזור האישי שלי
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {user.firstName} {user.lastName}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
        {(["profile", "wallet", "orders"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className={`pb-2 px-1 font-medium text-sm transition ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            {tab === "profile" && "הפרופיל שלי"}
            {tab === "wallet" && "הארנק שלי"}
            {tab === "orders" && "ההזמנות שלי"}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <Row label="שם" value={`${user.firstName} ${user.lastName}`} />
          <Row label="אימייל" value={user.email} />
          <Row label="תפקיד" value={ROLE_LABEL[user.role] ?? user.role} />
          <Row label="עיר" value={user.city} />
          {user.phone && <Row label="טלפון" value={user.phone} />}
          {user.street && <Row label="רחוב ומספר בית" value={user.street} />}
          <Row
            label="יתרה"
            value={`₪${Number(user.balance).toFixed(2)}`}
            highlight={true}
          />
          <Row label="חבר מאז" value={joined} />
        </div>
      )}

      {/* Wallet Tab */}
      {activeTab === "wallet" && (
        <div className="space-y-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
            <p className="text-sm font-medium opacity-90 mb-2">היתרה שלך</p>
            <p className="text-4xl font-bold">₪{Number(user.balance).toFixed(2)}</p>
          </div>

          {/* Transaction History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">היסטוריית עסקאות</h2>
            </div>

            {transactions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                אין עסקאות עדיין
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                          תאריך
                        </th>
                        <th className="px-6 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                          סוג
                        </th>
                        <th className="px-6 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                          סכום
                        </th>
                        <th className="px-6 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                          הערה
                        </th>
                        <th className="px-6 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                          בוצע על ידי
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTransactions.map((tx) => {
                        const amt = Number(tx.amount);
                        const isIn = amt > 0;
                        return (
                          <tr
                            key={tx.id}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="px-6 py-4">
                              {new Date(tx.createdAt).toLocaleDateString(
                                "he-IL",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                                style={{
                                  background: isIn ? "#dcfce7" : "#fee2e2",
                                  color: isIn ? "#166534" : "#991b1b",
                                }}
                              >
                                {isIn ? "הפקדה" : "החזר"}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-semibold">
                              <span
                                style={{
                                  color: isIn ? "#10b981" : "#ef4444",
                                }}
                              >
                                {isIn ? "+" : ""}₪{Math.abs(amt).toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                              {tx.note || "—"}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs">
                                <p className="font-medium">
                                  {tx.creatorName || "מערכת"}
                                </p>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      ←
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="mb-4">אין לך הזמנות עדיין</p>
              <Link
                href="/store"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                לחזור לחנות
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                      מספר הזמנה
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                      תאריך
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                      פריטים
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                      סה״כ
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                      סטטוס
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                      פעולה
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 font-semibold">#{order.orderNumber}</td>
                      <td className="px-6 py-4">{order.createdAt}</td>
                      <td className="px-6 py-4">{order.itemCount}</td>
                      <td className="px-6 py-4 font-semibold">
                        ₪{order.total}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background:
                              STATUS_LABEL[order.status]?.color || "#e5e7eb",
                            color: "#fff",
                          }}
                        >
                          {STATUS_LABEL[order.status]?.label || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-700 underline text-xs"
                        >
                          צפה
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
      <dt className="font-medium text-gray-600 dark:text-gray-400">{label}</dt>
      <dd
        className={`${
          highlight
            ? "text-lg font-semibold text-blue-600 dark:text-blue-400"
            : "text-gray-900 dark:text-gray-100"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
