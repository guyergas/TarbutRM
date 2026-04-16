"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ItemReportRow, OperationOption } from "./page";

interface Props {
  rows: ItemReportRow[];
  operationOptions: OperationOption[];
  selectedOpIds: string[];
  fromDate: string;
  toDate: string;
  preset: string;
}

export default function ItemsReportClient({ rows, operationOptions, selectedOpIds: initSelectedOpIds, fromDate, toDate, preset: initPreset }: Props) {
  const router = useRouter();

  const todayStr = () => new Date().toISOString().split("T")[0];

  const [preset, setPreset] = useState(initPreset);
  const [customFrom, setCustomFrom] = useState(initPreset === "custom" ? fromDate : todayStr());
  const [customTo, setCustomTo] = useState(initPreset === "custom" ? toDate : todayStr());
  const [selectedOpIds, setSelectedOpIds] = useState<string[]>(initSelectedOpIds);
  const [opsOpen, setOpsOpen] = useState(false);
  const [menuFilter, setMenuFilter] = useState<string[]>([]);
  const [menuDropOpen, setMenuDropOpen] = useState(false);

  const opsRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (opsRef.current && !opsRef.current.contains(e.target as Node)) setOpsOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function applyPreset(p: string) {
    setPreset(p);
    if (p !== "custom") {
      const params = new URLSearchParams({ preset: p });
      if (selectedOpIds.length > 0) params.set("ops", selectedOpIds.join(","));
      router.push(`?${params.toString()}`);
    }
  }

  function applyCustom() {
    const [f, t] = customFrom <= customTo ? [customFrom, customTo] : [customTo, customFrom];
    const params = new URLSearchParams({ preset: "custom", from: f, to: t });
    if (selectedOpIds.length > 0) params.set("ops", selectedOpIds.join(","));
    router.push(`?${params.toString()}`);
  }

  function toggleOp(id: string) {
    const next = selectedOpIds.includes(id) ? selectedOpIds.filter((x) => x !== id) : [...selectedOpIds, id];
    setSelectedOpIds(next);
    const params = new URLSearchParams({ preset });
    if (preset === "custom") { params.set("from", customFrom); params.set("to", customTo); }
    if (next.length > 0) params.set("ops", next.join(","));
    router.push(`?${params.toString()}`);
  }

  function toggleMenu(id: string) {
    setMenuFilter((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  // Unique menus
  const allMenus = Array.from(new Map(rows.map((r) => [r.menuId, r.menuName])).entries()).map(([id, name]) => ({ id, name }));

  // Filter by menu
  const filtered = menuFilter.length > 0 ? rows.filter((r) => menuFilter.includes(r.menuId)) : rows;

  const maxQty = filtered.length > 0 ? Math.max(...filtered.map((r) => r.quantity)) : 1;
  const sorted = [...filtered].sort((a, b) => b.quantity - a.quantity);

  const top3Ids = new Set(sorted.slice(0, 3).map((r) => r.itemId));
  const bottom3Ids = new Set(sorted.slice(-3).filter((r) => !top3Ids.has(r.itemId)).map((r) => r.itemId));

  const totalUnits = filtered.reduce((s, r) => s + r.quantity, 0);
  const totalRevenue = filtered.reduce((s, r) => s + r.revenue, 0);

  const presetBtn = (p: string, label: string) => (
    <button
      key={p}
      onClick={() => applyPreset(p)}
      className={`px-3 py-1 rounded text-sm border transition-colors ${preset === p ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
    >
      {label}
    </button>
  );

  const opsLabel = selectedOpIds.length === 0 ? "כל ההפעלות" : `${selectedOpIds.length} הפעלות`;
  const menuLabel = menuFilter.length === 0 ? "כל התפריטים" : `${menuFilter.length} תפריטים`;

  return (
    <div className="p-4 max-w-5xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">דוח פריטים</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        {presetBtn("30d", "30 יום אחרונים")}
        {presetBtn("thismonth", "מתחילת החודש")}
        {presetBtn("lastmonth", "חודש קודם")}
        {presetBtn("custom", "טווח מותאם")}

        {preset === "custom" && (
          <div className="flex gap-2 items-center">
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200" />
            <span className="text-sm text-gray-500">עד</span>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200" />
            <button onClick={applyCustom} className="px-3 py-1 rounded text-sm bg-blue-600 text-white hover:bg-blue-700">החל</button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        {/* Operations filter */}
        <div className="relative" ref={opsRef}>
          <button
            onClick={() => setOpsOpen((v) => !v)}
            className="px-3 py-1 rounded text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            {opsLabel} <span className="text-xs">▼</span>
          </button>
          {opsOpen && (
            <div className="absolute top-full mt-1 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg min-w-[200px] max-h-60 overflow-y-auto">
              {operationOptions.map((op) => (
                <label key={op.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-800 dark:text-gray-200">
                  <input type="checkbox" checked={selectedOpIds.includes(op.id)} onChange={() => toggleOp(op.id)} className="accent-blue-600" />
                  {op.label}
                </label>
              ))}
              {operationOptions.length === 0 && <div className="px-3 py-2 text-sm text-gray-500">אין הפעלות</div>}
            </div>
          )}
        </div>

        {/* Menu filter */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuDropOpen((v) => !v)}
            className="px-3 py-1 rounded text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            {menuLabel} <span className="text-xs">▼</span>
          </button>
          {menuDropOpen && (
            <div className="absolute top-full mt-1 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg min-w-[160px] max-h-60 overflow-y-auto">
              {allMenus.map((m) => (
                <label key={m.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-800 dark:text-gray-200">
                  <input type="checkbox" checked={menuFilter.includes(m.id)} onChange={() => toggleMenu(m.id)} className="accent-blue-600" />
                  {m.name}
                </label>
              ))}
              {allMenus.length === 0 && <div className="px-3 py-2 text-sm text-gray-500">אין תפריטים</div>}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex-1 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalUnits.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-1">יחידות שנמכרו</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex-1 text-center">
          <div className="text-2xl font-bold text-green-600">₪{totalRevenue.toFixed(2)}</div>
          <div className="text-sm text-gray-500 mt-1">הכנסות</div>
        </div>
      </div>

      {/* Legend */}
      {sorted.length > 0 && (
        <div className="flex gap-4 mb-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-amber-400"></span> Top 3</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-red-300 dark:bg-red-700"></span> Bottom 3</span>
        </div>
      )}

      {/* Histogram */}
      {sorted.length === 0 ? (
        <div className="text-center text-gray-500 py-12">אין נתונים לתקופה הנבחרת</div>
      ) : (
        <div className="space-y-2">
          {sorted.map((row) => {
            const isTop = top3Ids.has(row.itemId);
            const isBottom = bottom3Ids.has(row.itemId);
            const barWidth = maxQty > 0 ? (row.quantity / maxQty) * 100 : 0;
            const barColor = isTop ? "bg-amber-400" : isBottom ? "bg-red-400 dark:bg-red-600" : "bg-blue-500";
            const rowBg = isTop ? "bg-amber-50 dark:bg-amber-900/20" : isBottom ? "bg-red-50 dark:bg-red-900/20" : "bg-white dark:bg-gray-800";

            return (
              <div key={row.itemId} className={`rounded-lg border border-gray-200 dark:border-gray-700 p-3 ${rowBg}`}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex gap-2 items-center text-xs text-gray-500">
                    <span>{row.menuName}</span>
                    <span>›</span>
                    <span>{row.sectionName}</span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <span className="text-xs text-gray-500">₪{row.revenue.toFixed(2)}</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{row.quantity} יח׳</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100 w-40 truncate shrink-0">{row.itemName}</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
