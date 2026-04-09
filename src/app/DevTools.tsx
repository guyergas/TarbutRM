"use client";

import { useEffect } from "react";

export default function DevTools() {
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/eruda";
    s.onload = () => (window as any).eruda?.init();
    document.head.appendChild(s);
  }, []);
  return null;
}
