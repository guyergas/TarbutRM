"use client";

import { useEffect } from "react";

export default function DevTools() {
  useEffect(() => {
    // Only load devtools in development mode
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/eruda";
    s.onload = () => (window as any).eruda?.init();
    document.head.appendChild(s);
  }, []);
  return null;
}
