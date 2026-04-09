"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";
import RegisterModal from "@/components/RegisterModal";

export default function LoginForm() {
  const [error, action, pending] = useActionState(loginAction, null);

  return (
    <form action={action} className="space-y-5">
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          אימייל
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            סיסמא
          </label>
          <Link
            href="/reset-password"
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            איפוס סיסמא
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="rememberMe"
          name="rememberMe"
          type="checkbox"
          defaultChecked
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="rememberMe" className="text-sm text-gray-600">
          זכור אותי
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
      >
        {pending ? "מתחבר…" : "התחברות"}
      </button>

      <div className="text-center text-sm text-gray-600">
        לקוח חדש?{" "}
        <RegisterModal
          triggerLabel="להרשמה"
          triggerClassName="font-medium text-indigo-600 hover:text-indigo-500 bg-transparent border-none p-0 cursor-pointer"
        />
      </div>
    </form>
  );
}
