"use client";

import { useState, useActionState } from "react";
import { updateUserAction } from "./actions";

const KNOWN_CITY = "רמות מנשה";

function fmtPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 10);
  return d.length <= 3 ? d : `${d.slice(0, 3)}-${d.slice(3)}`;
}

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  city: string;
  street: string | null;
  role: "USER" | "STAFF" | "ADMIN";
  active: boolean;
  balance: string;
};

const inputCls =
  "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";
const labelCls = "block text-sm font-medium text-gray-700";

export default function EditUserForm({ user }: { user: User }) {
  const bound = updateUserAction.bind(null, user.id);
  const [result, action, pending] = useActionState(bound, null);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [cityChoice, setCityChoice] = useState<"known" | "other">(
    user.city === KNOWN_CITY ? "known" : "other"
  );
  const [cityText, setCityText] = useState(user.city !== KNOWN_CITY ? user.city : "");

  return (
    <form action={action} className="space-y-4">
      {result && (
        <p
          className={`rounded-md px-4 py-3 text-sm ${
            result.ok
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {result.message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>שם פרטי</label>
          <input name="firstName" defaultValue={user.firstName} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>שם משפחה</label>
          <input name="lastName" defaultValue={user.lastName} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>אימייל</label>
          <input name="email" type="email" defaultValue={user.email} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>טלפון</label>
          <input
            name="phone"
            value={phone}
            onChange={(e) => setPhone(fmtPhone(e.target.value))}
            placeholder="050-0000000"
            className={inputCls}
          />
          {phone.length > 0 && (
            <p className={`mt-1 text-sm font-medium ${/^\d{3}-\d{7}$/.test(phone) ? "text-green-600" : "text-red-500"}`}>
              {/^\d{3}-\d{7}$/.test(phone) ? "✓ מספר תקין" : "✗ יש להזין 10 ספרות בפורמט 050-0000000"}
            </p>
          )}
        </div>
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
              className={`${inputCls} mt-2`}
            />
          )}
        </div>
        <div>
          <label className={labelCls}>רחוב ומספר בית</label>
          <input name="street" defaultValue={user.street ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>תפקיד</label>
          <select name="role" defaultValue={user.role} className={inputCls}>
            <option value="USER">משתמש</option>
            <option value="STAFF">צוות</option>
            <option value="ADMIN">מנהל</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>סטטוס</label>
          <select name="active" defaultValue={String(user.active)} className={inputCls}>
            <option value="true">פעיל</option>
            <option value="false">מושבת</option>
          </select>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
        >
          {pending ? "שומר…" : "שמור שינויים"}
        </button>
      </div>
    </form>
  );
}
