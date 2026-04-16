"use client";

import { useEffect } from "react";

export default function DevTools() {
  useEffect(() => {
    const debugMode =
      process.env.NODE_ENV === "development" ||
      new URLSearchParams(window.location.search).get("debug") === "1";
    if (debugMode) {
      const s = document.createElement("script");
      s.src = "/eruda.js";
      s.onload = () => (window as any).eruda?.init();
      document.head.appendChild(s);
    }
  }, []);
  return null;
}
