import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import EditableUserForm from "./EditableUserForm";
import AddTransactionForm from "./AddTransactionForm";
import ResetPasswordDialog from "./ResetPasswordDialog";

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  // Check permissions
  const isOwnProfile = session.user.id === id;
  const isAdmin = session.user.role === "ADMIN";

  // Only allow viewing own profile or if admin
  if (!isOwnProfile && !isAdmin) {
    redirect("/");
  }

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
      <div className="flex items-center gap-4 flex-wrap">
        <Link
          href={isAdmin ? "/admin/users" : "/"}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition"
        >
          ← {isAdmin && !isOwnProfile ? "חזרה לרשימה" : "חזרה לעמוד הבית"}
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</h1>
        {isAdmin && (
          <span
            className={`px-2.5 py-1 rounded text-xs font-semibold ${
              user.active
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            }`}
          >
            {user.active ? "פעיל" : "מושבת"}
          </span>
        )}
        <span className={`ml-auto text-lg font-bold font-variant-numeric-tabular ${Number(user.balance) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          יתרה: {serialized.balance} ₪
        </span>
      </div>

      {/* Edit form */}
      <div className="rounded-lg bg-white dark:bg-gray-800 px-8 py-6 shadow-sm dark:shadow-lg space-y-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">פרטי משתמש</h2>
        <EditableUserForm user={serialized} isAdminEdit={isAdmin} />
        {isAdmin && (
          <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
            <ResetPasswordDialog userId={user.id} />
          </div>
        )}
      </div>

      {/* Transaction history */}
      <div className="rounded-lg bg-white dark:bg-gray-800 px-8 py-6 shadow-sm dark:shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">היסטוריית עסקאות</h2>
          {isAdmin && <AddTransactionForm userId={user.id} />}
        </div>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">אין עסקאות עדיין</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-3 py-2.5 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">תאריך</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">סוג</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">סכום</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">הערה</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">בוצע על ידי</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const amt = Number(tx.amount);
                  const isIn = amt > 0;
                  return (
                    <tr key={tx.id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">
                        {tx.createdAt.toLocaleDateString("he-IL", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                            isIn
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                          }`}
                        >
                          {isIn ? "הפקדה" : "החזר"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-variant-numeric-tabular font-semibold">
                        <span className={isIn ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                          {isIn ? "+" : ""}
                          {amt.toFixed(2)} ₪
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{tx.note ?? "—"}</td>
                      <td className="px-3 py-2.5">
                        {(() => {
                          const c = creatorMap[tx.createdBy];
                          if (!c) return tx.createdBy;
                          const isSelf = c.id === user.id;
                          return (
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                              isSelf
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                            }`}>
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
