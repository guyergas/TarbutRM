"use client";

import { useActionState, useState } from "react";
import { addTransactionAction } from "./actions";

const inputCls =
  "mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function AddTransactionForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const bound = addTransactionAction.bind(null, userId);
  const [result, action, pending] = useActionState(
    async (...args: Parameters<typeof bound>) => {
      const res = await bound(...args);
      if (res.ok) setOpen(false);
      return res;
    },
    null,
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-indigo-600 dark:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-600 transition"
      >
        + חדש
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-51 bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-sm shadow-2xl dark:shadow-2xl"
          >
            <h2 className="text-base font-semibold mb-5 text-gray-900 dark:text-white">
              עסקה חדשה
            </h2>

            <form action={action} className="space-y-4">
              {result && !result.ok && (
                <p className="rounded-md bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {result.message}
                </p>
              )}

              <div>
                <label className={labelCls}>סוג</label>
                <select name="type" className={inputCls}>
                  <option value="in">הפקדה (Cash In)</option>
                  <option value="back">החזר (Cash Back)</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>סכום (₪)</label>
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>הערה</label>
                <input name="note" placeholder="אופציונלי" className={inputCls} />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 rounded-md bg-indigo-600 dark:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 transition"
                >
                  {pending ? "שומר…" : "שמור"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
