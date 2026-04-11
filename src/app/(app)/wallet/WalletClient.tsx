"use client";

import { useState } from "react";
import TopupModal from "./TopupModal";

interface User {
  balance: number;
  firstName: string;
  lastName: string;
}

interface Transaction {
  id: string;
  amount: number;
  note?: string;
  type: string;
  createdBy: string;
  createdAt: string;
}

interface Creator {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function WalletClient({
  user,
  transactions,
  creatorMap,
}: {
  user: User;
  transactions: Transaction[];
  creatorMap: Record<string, Creator>;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const getTransactionBadge = (type: string, isIn: boolean) => {
    if (type === "CARD_TOPUP") {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
          טעינת כרטיס
        </span>
      );
    }

    return (
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
          isIn
            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
        }`}
      >
        {isIn ? "הפקדה" : "החזר"}
      </span>
    );
  };

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          הארנק שלי
        </h1>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-lg shadow-lg dark:shadow-2xl p-8 text-white mb-8">
          <p className="text-sm font-medium opacity-90 mb-2">היתרה שלך</p>
          <p className="text-5xl font-bold mb-6">₪{user.balance.toFixed(2)}</p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium text-sm transition"
          >
            טעינת חשבון
          </button>
        </div>

        {/* Transaction History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              היסטוריית עסקאות
            </h2>
          </div>

          {transactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              אין עסקאות עדיין
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
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
                    const amt = tx.amount;
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
                          {getTransactionBadge(tx.type, isIn)}
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          <span
                            className={
                              isIn
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }
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

      <TopupModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
