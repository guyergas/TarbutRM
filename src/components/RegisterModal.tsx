"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RegisterForm from "./RegisterForm";

export default function RegisterModal({
  triggerLabel,
  triggerClassName,
}: {
  triggerLabel: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-51 bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl dark:shadow-2xl">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5 text-right">הרשמה</h2>
            <RegisterForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
