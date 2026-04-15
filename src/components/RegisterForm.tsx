"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TermsModal from "./TermsModal";

const inputCls =
  "mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right";

const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 text-right";

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
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsRead, setTermsRead] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    if (!showPw) return;
    const timer = setTimeout(() => setShowPw(false), 5000);
    return () => clearTimeout(timer);
  }, [showPw]);

  useEffect(() => {
    if (!showConfirm) return;
    const timer = setTimeout(() => setShowConfirm(false), 5000);
    return () => clearTimeout(timer);
  }, [showConfirm]);

  const str = strength(pw);
  const matches = pw === confirm;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!str.ok) { setError("הסיסמא חלשה מדי."); return; }
    if (!matches) { setError("הסיסמאות אינן תואמות."); return; }
    if (!termsChecked) { setError("יש לאשר את תקנון השימוש."); return; }
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
    <form onSubmit={handleSubmit} className="space-y-5 text-right">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="firstName" className={labelCls}>שם פרטי</label>
          <input id="firstName" name="firstName" type="text" required autoComplete="given-name" className={inputCls} />
        </div>
        <div>
          <label htmlFor="lastName" className={labelCls}>שם משפחה</label>
          <input id="lastName" name="lastName" type="text" required autoComplete="family-name" className={inputCls} />
        </div>
      </div>

      <div className="grid gap-3" style={{gridTemplateColumns: "2fr 3fr"}}>
        <div>
          <label htmlFor="phone" className={labelCls}>טלפון</label>
          <input
            id="phone" name="phone" type="tel" autoComplete="tel"
            value={phone} onChange={(e) => setPhone(fmtPhone(e.target.value))}
            placeholder="050-0000000"
            className={inputCls}
          />
          {phone.length > 0 && (
            <p className={`mt-1 text-sm font-medium ${/^\d{3}-\d{7}$/.test(phone) ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {/^\d{3}-\d{7}$/.test(phone) ? "✓ מספר תקין" : "✗ יש להזין 10 ספרות בפורמט 050-0000000"}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="email" className={labelCls}>אימייל</label>
          <input id="email" name="email" type="email" required autoComplete="email" className={`${inputCls} !text-left`} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>עיר</label>
          <input type="hidden" name="city" value={cityChoice === "known" ? KNOWN_CITY : cityText} />
          <select
            value={cityChoice}
            onChange={(e) => setCityChoice(e.target.value as "known" | "other")}
            className={inputCls}
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
              className={`${inputCls} mt-2`}
            />
          )}
        </div>
        <div>
          <label htmlFor="street" className={labelCls}>רחוב ומספר בית</label>
          <input id="street" name="street" type="text" autoComplete="street-address" className={inputCls} />
        </div>
      </div>

      <div>
        <label htmlFor="pw" className={labelCls}>סיסמא</label>
        <div className="relative">
          <input
            id="pw" name="password" type={showPw ? "text" : "password"} required autoComplete="new-password"
            value={pw} onChange={(e) => setPw(e.target.value)} className={inputCls}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition"
            title={showPw ? "הסתר סיסמא" : "הצג סיסמא"}
          >
            {showPw ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.81-2.82 3.74-4.59-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm7.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3-.05 0-.11 0-.17.02z"/>
              </svg>
            )}
          </button>
        </div>
        <p className={`mt-1 text-sm font-medium ${str.ok ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {str.ok
            ? `✓ סיסמא ${str.label}`
            : pw.length === 0
              ? "לפחות 8 תווים, אותיות גדולות ומספרים"
              : `✗ חלשה — הוסף אותיות גדולות, מספרים או תווים מיוחדים`}
        </p>
      </div>

      <div>
        <label htmlFor="confirm" className={labelCls}>אימות סיסמא</label>
        <div className="relative">
          <input
            id="confirm" name="confirm" type={showConfirm ? "text" : "password"} required autoComplete="new-password"
            value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition"
            title={showConfirm ? "הסתר סיסמא" : "הצג סיסמא"}
          >
            {showConfirm ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.81-2.82 3.74-4.59-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm7.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3-.05 0-.11 0-.17.02z"/>
              </svg>
            )}
          </button>
        </div>
        {confirm.length > 0 && (
          <p className={`mt-1 text-sm font-medium ${matches ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {matches ? "✓ הסיסמאות תואמות" : "✗ הסיסמאות אינן תואמות"}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 justify-start" dir="rtl">
        <input
          id="terms-checkbox"
          type="checkbox"
          checked={termsChecked}
          disabled={!termsRead}
          onChange={(e) => setTermsChecked(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        />
        <label
          className={`text-sm select-none ${termsRead ? "text-gray-700 dark:text-gray-300 cursor-pointer" : "text-gray-400 dark:text-gray-500 cursor-not-allowed"}`}
          htmlFor="terms-checkbox"
        >
          קראתי את{" "}
          <button
            type="button"
            onClick={() => setShowTerms(true)}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            תקנון השימוש
          </button>
          {" "}ואני מסכים/ה
        </label>
      </div>

      {showTerms && (
        <TermsModal
          onClose={() => {
            setShowTerms(false);
            setTermsRead(true);
          }}
        />
      )}

      {error && (
        <p className="rounded-md bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">{error}</p>
      )}

      <div className={onCancel ? "flex gap-3" : ""}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            ביטול
          </button>
        )}
        <button
          type="submit" disabled={pending}
          className={`${onCancel ? "flex-1" : "w-full"} rounded-md bg-indigo-600 dark:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 transition`}
        >
          {pending ? "נרשם…" : "הרשמה"}
        </button>
      </div>

      {!onSuccess && redirectTo === "/login" && (
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          כבר יש לך חשבון?{" "}
          <Link href="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">התחברות</Link>
        </p>
      )}
    </form>
  );
}
