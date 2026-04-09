"use client";

import { signOutAction } from "./actions";

export default function LogoutMenuButton() {
  return (
    <button
      type="button"
      onClick={() => signOutAction()}
      style={{
        padding: "10px 8px",
        borderRadius: 8,
        color: "#374151",
        textDecoration: "none",
        fontSize: 15,
        fontWeight: 500,
        display: "block",
        textAlign: "right",
        background: "none",
        border: "none",
        cursor: "pointer",
        width: "100%",
      }}
    >
      התנתקות
    </button>
  );
}
