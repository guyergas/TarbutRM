import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "הארנק שלי — TarbutRM" };

export default async function WalletPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch user and transactions
  const [user, transactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        balance: true,
        firstName: true,
        lastName: true,
      },
    }),
    prisma.budgetTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  // Fetch creators of transactions for display
  const creatorIds = [...new Set(transactions.map((t) => t.createdBy))];
  const creators = await prisma.user.findMany({
    where: { id: { in: creatorIds } },
    select: { id: true, firstName: true, lastName: true, role: true },
  });
  const creatorMap = Object.fromEntries(creators.map((c) => [c.id, c]));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        הארנק שלי
      </h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white mb-8">
        <p className="text-sm font-medium opacity-90 mb-2">היתרה שלך</p>
        <p className="text-4xl font-bold">₪{Number(user.balance).toFixed(2)}</p>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">היסטוריית עסקאות</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">אין עסקאות עדיין</div>
        ) : (
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
                {transactions.map((tx) => {
                  const amt = Number(tx.amount);
                  const isIn = amt > 0;
                  return (
                    <tr
                      key={tx.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4">
                        {new Date(tx.createdAt).toLocaleDateString("he-IL", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
                            {creatorMap[tx.createdBy]
                              ? `${creatorMap[tx.createdBy].firstName} ${creatorMap[tx.createdBy].lastName}`
                              : "מערכת"}
                          </p>
                        </div>
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
