"use client";

import { signOutAction } from "./actions";

export default function LogoutMenuButton() {
  return (
    <button
      type="button"
      onClick={() => signOutAction()}
      className="px-1 py-2 rounded text-gray-900 dark:text-gray-300 no-underline text-sm font-medium block text-right pr-4 bg-transparent border-none cursor-pointer w-full"
    >
      התנתקות
    </button>
  );
}
