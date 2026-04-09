"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RegisterForm from "@/app/(auth)/register/RegisterForm";

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
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50 }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 51,
              background: "#fff",
              borderRadius: 12,
              padding: "32px",
              width: "min(480px, 90vw)",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 20 }}>הרשמה</h2>
            <RegisterForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
