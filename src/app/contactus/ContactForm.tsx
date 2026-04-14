"use client";

import { useActionState, useEffect, useState } from "react";
import { submitContactMessage } from "./actions";

interface ContactFormProps {
  initialEmail?: string;
  isLoggedIn?: boolean;
}

interface ActionResult {
  ok: boolean;
  message: string;
}

export default function ContactForm({ initialEmail = "", isLoggedIn = false }: ContactFormProps) {
  const [result, action, pending] = useActionState(submitContactMessage, null);
  const [submitted, setSubmitted] = useState(false);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (result?.ok) {
      setSubmitted(true);
      setDescription("");
      // Reset form after 3 seconds
      const timer = setTimeout(() => {
        setSubmitted(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [result?.ok]);

  if (submitted && result?.ok) {
    return (
      <div className="rounded-lg bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
        {result.message}
      </div>
    );
  }

  const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 text-right";
  const inputCls = "mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <form action={action} className="space-y-4">
      {result && !result.ok && (
        <p className="rounded-md bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {result.message}
        </p>
      )}

      {!isLoggedIn ? (
        <div>
          <label htmlFor="email" className={labelCls}>
            אימייל
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="your@email.com"
            className={inputCls}
          />
        </div>
      ) : (
        <input type="hidden" name="email" value={initialEmail} />
      )}

      {!isLoggedIn && (
        <div>
          <label htmlFor="name" className={labelCls}>
            שם
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="שמך"
            maxLength={100}
            className={inputCls}
          />
        </div>
      )}

      <div>
        <label htmlFor="title" className={labelCls}>
          כותרת
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="כותרת ההודעה"
          maxLength={200}
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelCls}>
          תיאור
        </label>
        <textarea
          id="description"
          name="description"
          required
          placeholder="תאר את בעיתך או השאלתך"
          maxLength={1000}
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputCls} resize-none`}
        />
        <div className="mt-1 flex justify-between text-xs">
          <p className={description.length < 10 ? "text-amber-600 dark:text-amber-400 font-medium" : "text-gray-500 dark:text-gray-400"}>
            {description.length < 10 ? `צריך עוד ${10 - description.length} תווים` : "מוכן לשליחה"}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            {description.length} / 1000
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending || description.length < 10}
        title={description.length < 10 ? `צריך לפחות 10 תווים בתיאור (יש לך ${description.length})` : ""}
        className="w-full rounded-lg bg-indigo-600 dark:bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {pending ? "שולח…" : "שלח הודעה"}
      </button>
    </form>
  );
}
