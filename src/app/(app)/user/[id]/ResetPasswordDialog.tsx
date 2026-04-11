"use client";

import { useState, useActionState } from "react";
import { resetPasswordAction } from "./actions";

const INPUT =
  "mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

function strength(pw: string): { score: number; label: string; ok: boolean } {
  if (!pw) return { score: 0, label: "", ok: false };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  s = Math.min(s, 4);
  const labels = ["", "חלשה מדי", "בינונית", "טובה", "חזקה"];
  return { score: s, label: labels[s], ok: s >= 2 };
}

function ResetForm({ userId, onClose }: { userId: string; onClose: () => void }) {
  const bound = resetPasswordAction.bind(null, userId);
  const [result, action, pending] = useActionState(bound, null);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  const str = strength(pw);
  const matches = pw === confirm;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!str.ok) { e.preventDefault(); setClientError("הסיסמא חלשה מדי."); return; }
    if (!matches) { e.preventDefault(); setClientError("הסיסמאות אינן תואמות."); return; }
    setClientError(null);
  }

  if (result?.ok) {
    return (
      <div className="space-y-4">
        <p className="rounded-md bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">{result.message}</p>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-md bg-indigo-600 dark:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50"
        >
          סגור
        </button>
      </div>
    );
  }

  return (
    <form action={action} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">סיסמא חדשה</label>
        <input
          name="password"
          type="password"
          required
          autoComplete="new-password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className={INPUT}
        />
        <p className={`mt-1 text-sm font-medium ${str.ok ? "text-green-600" : "text-red-500"}`}>
          {str.ok
            ? `✓ סיסמא ${str.label}`
            : pw.length === 0
              ? "לפחות 8 תווים, אותיות גדולות ומספרים"
              : "✗ חלשה — הוסף אותיות גדולות, מספרים או תווים מיוחדים"}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">אימות סיסמא</label>
        <input
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={INPUT}
        />
        {confirm.length > 0 && (
          <p className={`mt-1 text-sm font-medium ${matches ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
            {matches ? "✓ הסיסמאות תואמות" : "✗ הסיסמאות אינן תואמות"}
          </p>
        )}
      </div>

      {(clientError || result?.message) && (
        <p className="rounded-md bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {clientError ?? result?.message}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onClose}
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
  );
}

export default function ResetPasswordDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
      >
        איפוס סיסמא
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-51 bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-sm shadow-2xl dark:shadow-2xl">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">
              איפוס סיסמא
            </h2>
            <ResetForm userId={userId} onClose={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
