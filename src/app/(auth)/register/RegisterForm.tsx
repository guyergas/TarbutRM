"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

const KNOWN_CITY = "רמות מנשה";

function fmtPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 10);
  return d.length <= 3 ? d : `${d.slice(0, 3)}-${d.slice(3)}`;
}

export default function RegisterForm({
  redirectTo = "/login",
  onSuccess,
  onCancel,
}: {
  redirectTo?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [cityChoice, setCityChoice] = useState<"known" | "other">("known");
  const [cityText, setCityText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const str = strength(pw);
  const matches = pw === confirm;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!str.ok) { setError("הסיסמא חלשה מדי."); return; }
    if (!matches) { setError("הסיסמאות אינן תואמות."); return; }
    if (phone && !/^\d{3}-\d{7}$/.test(phone)) { setError("מספר הטלפון אינו תקין — פורמט נדרש: 050-0000000"); return; }
    if (cityChoice === "other" && !cityText.trim()) { setError("יש להזין עיר."); return; }
    setError(null);
    setPending(true);
    const res = await fetch("/api/register", { method: "POST", body: new FormData(e.currentTarget) });
    const data = await res.json();
    setPending(false);
    if (data.error) { setError(data.error); return; }
    if (onSuccess) { onSuccess(); return; }
    router.push(redirectTo);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">שם פרטי</label>
        <input id="firstName" name="firstName" type="text" required autoComplete="given-name" className={INPUT} />
      </div>

      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">שם משפחה</label>
        <input id="lastName" name="lastName" type="text" required autoComplete="family-name" className={INPUT} />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">אימייל</label>
        <input id="email" name="email" type="email" required autoComplete="email" className={INPUT} />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">טלפון</label>
        <input
          id="phone" name="phone" type="tel" autoComplete="tel"
          value={phone} onChange={(e) => setPhone(fmtPhone(e.target.value))}
          placeholder="050-0000000"
          className={INPUT}
        />
        {phone.length > 0 && (
          <p className={`mt-1 text-sm font-medium ${/^\d{3}-\d{7}$/.test(phone) ? "text-green-600" : "text-red-500"}`}>
            {/^\d{3}-\d{7}$/.test(phone) ? "✓ מספר תקין" : "✗ יש להזין 10 ספרות בפורמט 050-0000000"}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">עיר</label>
        <input type="hidden" name="city" value={cityChoice === "known" ? KNOWN_CITY : cityText} />
        <select
          value={cityChoice}
          onChange={(e) => setCityChoice(e.target.value as "known" | "other")}
          className={INPUT}
        >
          <option value="known">{KNOWN_CITY}</option>
          <option value="other">אחר</option>
        </select>
        {cityChoice === "other" && (
          <input
            type="text"
            value={cityText}
            onChange={(e) => setCityText(e.target.value)}
            placeholder="הזן עיר..."
            autoComplete="address-level2"
            className={`${INPUT} mt-2`}
          />
        )}
      </div>

      <div>
        <label htmlFor="street" className="block text-sm font-medium text-gray-700">רחוב ומספר בית</label>
        <input id="street" name="street" type="text" autoComplete="street-address" className={INPUT} />
      </div>

      <div>
        <label htmlFor="pw" className="block text-sm font-medium text-gray-700">סיסמא</label>
        <input
          id="pw" name="password" type="password" required autoComplete="new-password"
          value={pw} onChange={(e) => setPw(e.target.value)} className={INPUT}
        />
        <p className={`mt-1 text-sm font-medium ${str.ok ? "text-green-600" : "text-red-500"}`}>
          {str.ok
            ? `✓ סיסמא ${str.label}`
            : pw.length === 0
              ? "לפחות 8 תווים, אותיות גדולות ומספרים"
              : `✗ חלשה — הוסף אותיות גדולות, מספרים או תווים מיוחדים`}
        </p>
      </div>

      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">אימות סיסמא</label>
        <input
          id="confirm" name="confirm" type="password" required autoComplete="new-password"
          value={confirm} onChange={(e) => setConfirm(e.target.value)} className={INPUT}
        />
        {confirm.length > 0 && (
          <p className={`mt-1 text-sm font-medium ${matches ? "text-green-600" : "text-red-500"}`}>
            {matches ? "✓ הסיסמאות תואמות" : "✗ הסיסמאות אינן תואמות"}
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className={onCancel ? "flex gap-3" : ""}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ביטול
          </button>
        )}
        <button
          type="submit" disabled={pending}
          className={`${onCancel ? "flex-1" : "w-full"} rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50`}
        >
          {pending ? "נרשם…" : "הרשמה"}
        </button>
      </div>

      {!onSuccess && redirectTo === "/login" && (
        <p className="text-center text-sm text-gray-600">
          כבר יש לך חשבון?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">התחברות</Link>
        </p>
      )}
    </form>
  );
}
