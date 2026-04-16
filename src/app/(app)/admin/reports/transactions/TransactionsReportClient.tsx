"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReportRow, MenuOption } from "./page";
import * as XLSX from "xlsx";

const PRESETS = [
  { value: "30d", label: "30 ימים אחרונים" },
  { value: "thismonth", label: "מתחילת החודש" },
  { value: "lastmonth", label: "חודש קודם" },
  { value: "custom", label: "טווח מותאם" },
];

export default function TransactionsReportClient({
  rows,
  allMenus,
  fromDate,
  toDate,
  preset,
}: {
  rows: ReportRow[];
  allMenus: MenuOption[];
  fromDate: string;
  toDate: string;
  preset: string;
}) {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState(preset);
  const today = new Date().toISOString().split("T")[0];
  const [customFrom, setCustomFrom] = useState(preset === "custom" ? fromDate : today);
  const [customTo, setCustomTo] = useState(preset === "custom" ? toDate : today);
  const [isPending, startTransition] = useTransition();

  // Menu filter: null = all selected, Set = only these menuIds selected (null key = no-menu rows)
  const allMenuKeys: (string | null)[] = [...allMenus.map((m) => m.id), null];
  const [selectedMenus, setSelectedMenus] = useState<Set<string | null>>(
    () => new Set(allMenuKeys)
  );

  // When allMenus changes (date range changed), add any new menus to the selection
  const prevMenuIdsRef = useRef<Set<string>>(new Set(allMenus.map((m) => m.id)));
  useEffect(() => {
    const newMenuIds = allMenus.map((m) => m.id).filter((id) => !prevMenuIdsRef.current.has(id));
    if (newMenuIds.length > 0) {
      setSelectedMenus((prev) => new Set([...prev, ...newMenuIds]));
      allMenus.forEach((m) => prevMenuIdsRef.current.add(m.id));
    }
  }, [allMenus]);

  function applyFilter(newPreset: string, from?: string, to?: string) {
    const params = new URLSearchParams();
    params.set("preset", newPreset);
    if (newPreset === "custom" && from && to) {
      params.set("from", from);
      params.set("to", to);
    }
    startTransition(() => {
      router.push(`/admin/reports/transactions?${params.toString()}`);
    });
  }

  function handlePresetChange(value: string) {
    setSelectedPreset(value);
    if (value !== "custom") applyFilter(value);
  }

  function toggleMenu(menuId: string | null) {
    setSelectedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  }

  function toggleAllMenus() {
    const allKeys: (string | null)[] = [...allMenus.map((m) => m.id), null];
    const allSelected = allKeys.every((k) => selectedMenus.has(k));
    if (allSelected) {
      setSelectedMenus(new Set());
    } else {
      setSelectedMenus(new Set(allKeys));
    }
  }

  const [menuDropdownOpen, setMenuDropdownOpen] = useState(false);
  const menuDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(e.target as Node)) {
        setMenuDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allSelected = allMenuKeys.every((k) => selectedMenus.has(k));

  // Filter rows by selected menus
  const visible = rows.filter((r) => selectedMenus.has(r.menuId));

  const totalIn = visible.filter((r) => r.direction === "in").reduce((s, r) => s + r.amount, 0);
  const totalOut = visible.filter((r) => r.direction === "out").reduce((s, r) => s + r.amount, 0);
  const net = totalIn - totalOut;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  function exportToExcel() {
    const data = visible.map((row) => ({
      "זמן": formatDate(row.createdAt),
      "משתמש": `${row.userFirstName} ${row.userLastName}`,
      "הכנסה / הוצאה": row.direction === "in" ? "הכנסה" : "הוצאה",
      "סכום": (row.direction === "in" ? 1 : -1) * row.amount,
      "תפריט": row.menuName ?? "—",
    }));

    // Append total row
    data.push({
      "זמן": "",
      "משתמש": "",
      "הכנסה / הוצאה": "סה״כ נטו",
      "סכום": net,
      "תפריט": "",
    });

    const ws = XLSX.utils.json_to_sheet(data, { skipHeader: false });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "עסקאות");
    XLSX.writeFile(wb, `transactions_${fromDate}_${toDate}.xlsx`);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">תנועות</h1>

      {/* Period selector */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => handlePresetChange(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition cursor-pointer ${
                selectedPreset === p.value
                  ? "bg-indigo-600 dark:bg-indigo-700 text-white border-indigo-600 dark:border-indigo-700"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {selectedPreset === "custom" ? (
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">מתאריך</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">עד תאריך</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const [f, t] = customFrom <= customTo ? [customFrom, customTo] : [customTo, customFrom];
                applyFilter("custom", f, t);
              }}
              disabled={!customFrom || !customTo || isPending}
              className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition cursor-pointer border-none"
            >
              הצג
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(fromDate).toLocaleDateString("he-IL")} – {new Date(toDate).toLocaleDateString("he-IL")}
          </p>
        )}
      </div>

      {/* Menu filter dropdown */}
      {allMenus.length > 0 && (
        <div className="relative" ref={menuDropdownRef}>
          <button
            type="button"
            onClick={() => setMenuDropdownOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer shadow-sm"
          >
            <span>
              {allSelected
                ? "תפריטים: הכל"
                : selectedMenus.size === 0
                ? "תפריטים: ללא"
                : `תפריטים: ${selectedMenus.size} נבחרו`}
            </span>
            <span className={`text-xs text-gray-400 transition-transform duration-200 ${menuDropdownOpen ? "rotate-180" : ""}`}>▼</span>
          </button>

          {menuDropdownOpen && (
            <div className="absolute top-full mt-1 right-0 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[180px] py-1">
              {/* Select all */}
              <button
                type="button"
                onClick={toggleAllMenus}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-right cursor-pointer"
              >
                <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${allSelected ? "bg-indigo-600 border-indigo-600" : "border-gray-400 dark:border-gray-500"}`}>
                  {allSelected && <span className="text-white text-xs">✓</span>}
                </span>
                הכל
              </button>
              <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
              {allMenus.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMenu(m.id)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-right cursor-pointer"
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selectedMenus.has(m.id) ? "bg-indigo-600 border-indigo-600" : "border-gray-400 dark:border-gray-500"}`}>
                    {selectedMenus.has(m.id) && <span className="text-white text-xs">✓</span>}
                  </span>
                  {m.name}
                </button>
              ))}
              <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
              <button
                type="button"
                onClick={() => toggleMenu(null)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-right cursor-pointer"
              >
                <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selectedMenus.has(null) ? "bg-indigo-600 border-indigo-600" : "border-gray-400 dark:border-gray-500"}`}>
                  {selectedMenus.has(null) && <span className="text-white text-xs">✓</span>}
                </span>
                ללא תפריט
              </button>
            </div>
          )}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">סה״כ הכנסות</div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400">+₪{totalIn.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">סה״כ הוצאות</div>
          <div className="text-xl font-bold text-red-600 dark:text-red-400">-₪{totalOut.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">נטו</div>
          <div className={`text-xl font-bold ${net >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {net >= 0 ? "+" : ""}₪{net.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{visible.length} שורות</span>
          <button
            type="button"
            onClick={exportToExcel}
            disabled={visible.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 dark:bg-green-700 text-white text-xs font-medium rounded-lg hover:bg-green-500 dark:hover:bg-green-600 disabled:opacity-40 transition cursor-pointer border-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            ייצוא Excel
          </button>
        </div>

        {isPending ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">טוען...</div>
        ) : visible.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">אין עסקאות בתקופה זו</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">זמן</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">משתמש</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">הכנסה / הוצאה</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">סכום</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">תפריט</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-100 dark:border-gray-700 ${
                      i % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-800/50"
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDate(row.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">{row.userFirstName} {row.userLastName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        row.direction === "in"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}>
                        {row.direction === "in" ? "הכנסה" : "הוצאה"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">
                      <span className={row.direction === "in" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                        {row.direction === "in" ? "+" : "-"}₪{row.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {row.menuName ?? <span className="text-gray-400 dark:text-gray-500">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 dark:bg-gray-700 border-t-2 border-gray-200 dark:border-gray-600">
                  <td colSpan={3} className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 text-right">סה״כ נטו</td>
                  <td className={`px-4 py-3 font-bold text-base whitespace-nowrap ${net >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {net >= 0 ? "+" : ""}₪{net.toFixed(2)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
