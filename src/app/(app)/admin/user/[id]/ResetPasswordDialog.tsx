"use client";

import { useState, useActionState } from "react";
import { resetPasswordAction } from "./actions";

const INPUT =
  "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

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
        <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">{result.message}</p>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
        >
          סגור
        </button>
      </div>
    );
  }

  return (
    <form action={action} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">סיסמא חדשה</label>
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
        <label className="block text-sm font-medium text-gray-700">אימות סיסמא</label>
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
          <p className={`mt-1 text-sm font-medium ${matches ? "text-green-600" : "text-red-500"}`}>
            {matches ? "✓ הסיסמאות תואמות" : "✗ הסיסמאות אינן תואמות"}
          </p>
        )}
      </div>

      {(clientError || result?.message) && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {clientError ?? result?.message}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onClose}
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
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50 }}
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
              width: "min(400px, 90vw)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 20 }}>
              איפוס סיסמא
            </h2>
            <ResetForm userId={userId} onClose={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
