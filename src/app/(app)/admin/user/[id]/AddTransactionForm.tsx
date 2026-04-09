"use client";

import { useActionState, useState } from "react";
import { addTransactionAction } from "./actions";

const inputCls =
  "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";
const labelCls = "block text-sm font-medium text-gray-700";

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
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
      >
        + חדש
      </button>

      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              zIndex: 51,
              background: "#fff",
              borderRadius: 12,
              padding: "32px",
              width: "min(440px, 90vw)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: "#111827" }}>
              עסקה חדשה
            </h2>

            <form action={action} className="space-y-4">
              {result && !result.ok && (
                <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
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
                  className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
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
