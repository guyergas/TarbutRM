"use client";

import { useState, useTransition } from "react";
import {
  createOperation,
  updateOperation,
  deleteOperation,
  addStaffToOperation,
  removeStaffFromOperation,
  selfRegisterOperation,
  addHelperToOperation,
  removeHelperFromOperation,
} from "./actions";

interface PersonUser {
  id: string;
  firstName: string;
  lastName: string;
}

interface OperationEntry {
  id: string;
  userId: string;
  user: PersonUser;
}

interface OperationRow {
  id: string;
  date: string;
  note: string | null;
  requiredCount: number;
  orderTotal: number;
  staff: OperationEntry[];
  helpers: OperationEntry[];
}

interface Props {
  operations: OperationRow[];
  allStaff: PersonUser[];
  allUsers: PersonUser[];
  currentUserId: string;
  currentUserRole: "USER" | "STAFF" | "ADMIN";
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("he-IL", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yy = String(d.getUTCFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function toInputDate(dateStr: string) {
  return dateStr.slice(0, 10);
}

// --- Search-and-pick modal ---
function PickPersonModal({
  title,
  available,
  onPick,
  onClose,
}: {
  title: string;
  available: PersonUser[];
  onPick: (userId: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = query.trim()
    ? available.filter((u) => `${u.firstName} ${u.lastName}`.includes(query.trim()))
    : available;

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4" dir="rtl">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
        {available.length === 0 ? (
          <p className="text-sm text-gray-500">כולם כבר משובצים</p>
        ) : (
          <>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש לפי שם..."
              autoFocus
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <ul className="flex flex-col gap-1 max-h-60 overflow-y-auto">
              {filtered.length === 0 ? (
                <li className="text-sm text-gray-400 px-2">אין תוצאות</li>
              ) : (
                filtered.map((u) => (
                  <li key={u.id}>
                    <button
                      onClick={() => startTransition(() => { onPick(u.id); })}
                      disabled={pending}
                      className="w-full text-right px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900 text-gray-900 dark:text-white text-sm disabled:opacity-50"
                    >
                      {u.firstName} {u.lastName}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </>
        )}
        <button onClick={onClose} className="mt-2 px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white text-sm self-end">
          סגור
        </button>
      </div>
    </div>
  );
}

// --- Operation detail / edit popup ---
function OperationPopup({
  op,
  allStaff,
  allUsers,
  currentUserId,
  currentUserRole,
  onClose,
}: {
  op: OperationRow;
  allStaff: PersonUser[];
  allUsers: PersonUser[];
  currentUserId: string;
  currentUserRole: "USER" | "STAFF" | "ADMIN";
  onClose: () => void;
}) {
  const isAdmin = currentUserRole === "ADMIN";
  const isStaffOrAdmin = currentUserRole === "STAFF" || currentUserRole === "ADMIN";

  const [editing, setEditing] = useState(false);
  const [editDate, setEditDate] = useState(toInputDate(op.date));
  const [editNote, setEditNote] = useState(op.note ?? "");
  const [editRequired, setEditRequired] = useState(op.requiredCount);

  // Local copies so mutations update the popup without closing
  const [localStaff, setLocalStaff] = useState<OperationEntry[]>(op.staff);
  const [localHelpers, setLocalHelpers] = useState<OperationEntry[]>(op.helpers);

  const [pickMode, setPickMode] = useState<"staff" | "helper" | null>(null);
  const [pending, startTransition] = useTransition();
  const [editPending, startEditTransition] = useTransition();

  const staffIds = new Set(localStaff.map((s) => s.userId));
  const helperIds = new Set(localHelpers.map((h) => h.userId));
  const isRegisteredStaff = staffIds.has(currentUserId);
  const isRegisteredHelper = helperIds.has(currentUserId);

  const availableStaff = allStaff.filter((u) => !staffIds.has(u.id));
  const availableHelpers = allUsers.filter((u) => !helperIds.has(u.id));

  const missing = editRequired - localStaff.length;

  function saveEdit() {
    startEditTransition(async () => {
      await updateOperation(op.id, editDate, editNote, editRequired);
      setEditing(false);
      onClose();
    });
  }

  function handleDelete() {
    if (!confirm("למחוק פעולה זו?")) return;
    startTransition(async () => {
      await deleteOperation(op.id);
      onClose();
    });
  }

  if (pickMode) {
    return (
      <PickPersonModal
        title={pickMode === "staff" ? "הוספת מפעיל" : "הוספת עוזר"}
        available={pickMode === "staff" ? availableStaff : availableHelpers}
        onPick={(userId) => {
          const person = (pickMode === "staff" ? allStaff : allUsers).find((u) => u.id === userId)!;
          const entry: OperationEntry = { id: userId, userId, user: person };
          if (pickMode === "staff") {
            startTransition(() => addStaffToOperation(op.id, userId));
            setLocalStaff((prev) => [...prev, entry]);
          } else {
            startTransition(() => addHelperToOperation(op.id, userId));
            setLocalHelpers((prev) => [...prev, entry]);
          }
          setPickMode(null);
        }}
        onClose={() => setPickMode(null)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 flex flex-col gap-5"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2 flex-1">
            {editing ? (
              <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-fit font-bold" />
            ) : (
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{formatDate(op.date)}</h2>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">מפעילים נדרשים:</span>
                {editing ? (
                  <input type="number" min={1} value={editRequired} onChange={(e) => setEditRequired(Number(e.target.value))}
                    className="border border-gray-300 dark:border-gray-600 rounded px-2 py-0.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-16" />
                ) : (
                  missing > 0 ? (
                    <span className="text-red-600 dark:text-red-400 text-sm font-medium">⚠ חסרים {missing} ({op.staff.length}/{op.requiredCount})</span>
                  ) : (
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">✓ מלא ({op.staff.length}/{op.requiredCount})</span>
                  )
                )}
              </div>
            </div>
            {editing ? (
              <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} rows={2}
                placeholder="הערה (אופציונלי)"
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none" />
            ) : (
              op.note && <p className="text-sm text-gray-500 dark:text-gray-400">{op.note}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none bg-transparent border-none cursor-pointer shrink-0">✕</button>
        </div>

        {/* Staff section */}
        {/* Operators */}
        <div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">מפעילים</span>
          <div className="flex flex-wrap gap-2">
            {localStaff.map((s) => {
              const canRemove = isAdmin || s.userId === currentUserId;
              return canRemove ? (
                <button
                  key={s.id}
                  onClick={() => { startTransition(() => removeStaffFromOperation(op.id, s.userId)); setLocalStaff((prev) => prev.filter((x) => x.userId !== s.userId)); }}
                  disabled={pending}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-300 transition-colors disabled:opacity-40 group"
                >
                  <span>{s.user.firstName} {s.user.lastName}</span>
                  <span className="text-xs opacity-50 group-hover:opacity-100">✕</span>
                </button>
              ) : (
                <span
                  key={s.id}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm"
                >
                  {s.user.firstName} {s.user.lastName}
                </span>
              );
            })}
            {isStaffOrAdmin && !isRegisteredStaff && !isRegisteredHelper && (
              <button
                onClick={() => { startTransition(() => selfRegisterOperation(op.id)); const me = allStaff.find((u) => u.id === currentUserId) ?? allUsers.find((u) => u.id === currentUserId); if (me) setLocalStaff((prev) => [...prev, { id: currentUserId, userId: currentUserId, user: me }]); }}
                disabled={pending}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full border-2 border-dashed border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 text-sm hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-40"
              >
                + הירשם
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setPickMode("staff")}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                + הוסף
              </button>
            )}
            {localStaff.length === 0 && !isStaffOrAdmin && (
              <span className="text-xs text-gray-400">אין מפעילים רשומים</span>
            )}
          </div>
        </div>

        {/* Helpers */}
        <div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">עוזרים</span>
          <div className="flex flex-wrap gap-2">
            {localHelpers.map((h) => {
              const canRemove = isStaffOrAdmin || h.userId === currentUserId;
              return canRemove ? (
                <button
                  key={h.id}
                  onClick={() => { startTransition(() => removeHelperFromOperation(op.id, h.userId)); setLocalHelpers((prev) => prev.filter((x) => x.userId !== h.userId)); }}
                  disabled={pending}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-900 dark:text-purple-100 text-sm hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-300 transition-colors disabled:opacity-40 group"
                >
                  <span>{h.user.firstName} {h.user.lastName}</span>
                  <span className="text-xs opacity-50 group-hover:opacity-100">✕</span>
                </button>
              ) : (
                <span
                  key={h.id}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-900 dark:text-purple-100 text-sm"
                >
                  {h.user.firstName} {h.user.lastName}
                </span>
              );
            })}
            {isStaffOrAdmin && (
              <button
                onClick={() => setPickMode("helper")}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                + הוסף
              </button>
            )}
            {localHelpers.length === 0 && !isStaffOrAdmin && (
              <span className="text-xs text-gray-400">אין עוזרים רשומים</span>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700 gap-2 flex-wrap">
          {isAdmin && editing ? (
            <button onClick={handleDelete} disabled={pending}
              className="text-xs text-red-500 hover:underline disabled:opacity-40">
              מחיקה
            </button>
          ) : <span />}
          <div className="flex gap-2">
            {editing && (
              <button onClick={() => setEditing(false)}
                className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white text-sm">
                ביטול
              </button>
            )}
            {isAdmin && (
              <button
                onClick={editing ? saveEdit : () => setEditing(true)}
                disabled={editPending}
                className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {editPending ? "שומר..." : editing ? "שמור שינויים" : "עריכה"}
              </button>
            )}
            <button onClick={onClose}
              className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white text-sm">
              סגור
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Add new operation modal ---
function NewOperationModal({ onClose }: { onClose: () => void }) {
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [required, setRequired] = useState(2);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function submit() {
    if (!date) { setError("יש לבחור תאריך"); return; }
    startTransition(async () => {
      try {
        await createOperation(date, note, required);
        onClose();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "שגיאה");
      }
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4" dir="rtl">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">הוספת הפעלה</h2>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">תאריך</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">מספר מפעילים נדרש</label>
          <input type="number" min={1} value={required} onChange={(e) => setRequired(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-24" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">הערה</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            placeholder="הערה מיוחדת (אופציונלי)" />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white text-sm">ביטול</button>
          <button onClick={submit} disabled={pending} className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium disabled:opacity-50">
            {pending ? "שומר..." : "שמור"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Table section ---
function OperationsTable({
  title,
  ops,
  allStaff,
  allUsers,
  currentUserId,
  currentUserRole,
  isAdmin,
}: {
  title: string;
  ops: OperationRow[];
  allStaff: PersonUser[];
  allUsers: PersonUser[];
  currentUserId: string;
  currentUserRole: "USER" | "STAFF" | "ADMIN";
  isAdmin: boolean;
}) {
  const [selectedOp, setSelectedOp] = useState<OperationRow | null>(null);

  if (ops.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-right" dir="rtl">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-300 text-right">תאריך</th>
              <th className="py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-300 text-right">מפעילים</th>
              <th className="py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-300 text-right">עוזרים</th>
              <th className="py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-300 text-right">הערה</th>
              <th className="py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-300 text-right">סה״כ מכירות</th>
              <th className="py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-300 text-right">סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {ops.map((op) => {
              const missing = op.requiredCount - op.staff.length;
              return (
                <tr
                  key={op.id}
                  onClick={() => setSelectedOp(op)}
                  className="border-t border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-3 px-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                    {formatDateShort(op.date)}
                  </td>
                  <td className="py-3 px-3 text-sm text-gray-800 dark:text-gray-200">
                    {op.staff.length === 0 ? (
                      <span className="text-gray-400 text-xs">—</span>
                    ) : (
                      op.staff.map((s) => `${s.user.firstName} ${s.user.lastName}`).join(", ")
                    )}
                  </td>
                  <td className="py-3 px-3 text-sm text-gray-800 dark:text-gray-200">
                    {op.helpers.length === 0 ? (
                      <span className="text-gray-400 text-xs">—</span>
                    ) : (
                      op.helpers.map((h) => `${h.user.firstName} ${h.user.lastName}`).join(", ")
                    )}
                  </td>
                  <td className="py-3 px-3 text-sm text-gray-600 dark:text-gray-400 max-w-[180px]">
                    {op.note || "—"}
                  </td>
                  <td className="py-3 px-3 text-sm whitespace-nowrap font-semibold">
                    {op.orderTotal > 0 ? (
                      <span className="text-green-600 dark:text-green-400">₪{op.orderTotal.toFixed(2)}</span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-sm whitespace-nowrap">
                    {missing > 0 ? (
                      <span className="text-red-600 dark:text-red-400 font-medium">⚠ חסרים {missing}</span>
                    ) : (
                      <span className="text-green-600 dark:text-green-400 font-medium">✓ מלא</span>
                    )}
                    <span className="text-gray-400 text-xs block">{op.staff.length}/{op.requiredCount}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedOp && (
        <OperationPopup
          op={selectedOp}
          allStaff={allStaff}
          allUsers={allUsers}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onClose={() => setSelectedOp(null)}
        />
      )}
    </div>
  );
}

// --- Main ---
export default function ScheduleClient({ operations, allStaff, allUsers, currentUserId, currentUserRole }: Props) {
  const [showNew, setShowNew] = useState(false);
  const isAdmin = currentUserRole === "ADMIN";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = operations.filter((op) => new Date(op.date) >= today);
  const past = operations.filter((op) => new Date(op.date) < today).reverse();

  return (
    <div className="flex flex-col gap-8" dir="rtl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">לוח שיבוצים</h1>
        {isAdmin && (
          <button onClick={() => setShowNew(true)}
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
            + הוספת הפעלה
          </button>
        )}
      </div>

      <OperationsTable title="פעולות קרובות" ops={upcoming} allStaff={allStaff} allUsers={allUsers}
        currentUserId={currentUserId} currentUserRole={currentUserRole} isAdmin={isAdmin} />

      <OperationsTable title="פעולות עבר" ops={past} allStaff={allStaff} allUsers={allUsers}
        currentUserId={currentUserId} currentUserRole={currentUserRole} isAdmin={isAdmin} />

      {upcoming.length === 0 && past.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-sm">אין פעולות מתוכננות.</p>
      )}

      {showNew && <NewOperationModal onClose={() => setShowNew(false)} />}
    </div>
  );
}
