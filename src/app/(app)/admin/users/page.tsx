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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ניהול משתמשים</h1>
          <RegisterModal
            triggerLabel="+ חדש"
            triggerClassName="rounded-lg bg-indigo-600 dark:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-600 border-none cursor-pointer transition"
          />
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center shadow-sm">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">סה״כ תקציב</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white font-variant-numeric-tabular">
            {totalBalance.toFixed(2)} ₪
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">שם</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">אימייל</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">טלפון</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">תקציב</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">תפקיד</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr
                key={user.id}
                className={`border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                  i % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800/50"
                }`}
              >
                <td className="px-4 py-3 text-gray-900 dark:text-white">
                  <Link
                    href={`/user/${user.id}`}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  >
                    {user.firstName} {user.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{user.email}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{user.phone ?? "—"}</td>
                <td className="px-4 py-3 text-gray-900 dark:text-white font-variant-numeric-tabular">
                  {Number(user.balance).toFixed(2)} ₪
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{roleLabel(user.role)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      user.active
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {user.active ? "פעיל" : "מושבת"}
                  </span>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-3 text-center text-gray-400 dark:text-gray-500">
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

function roleLabel(role: string) {
  if (role === "ADMIN") return "מנהל";
  if (role === "STAFF") return "צוות";
  return "משתמש";
}
