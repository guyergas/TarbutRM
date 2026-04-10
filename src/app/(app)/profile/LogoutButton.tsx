"use client";

import { signOutAction } from "../actions";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOutAction()}
      className="w-full rounded-md bg-indigo-600 dark:bg-gray-700 px-4 py-2 text-sm font-semibold text-white dark:text-gray-100 shadow-sm hover:bg-indigo-500 dark:hover:bg-gray-600 disabled:opacity-50"
    >
      התנתקות
    </button>
  );
}
