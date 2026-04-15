"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function TermsModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (!mounted) return null;

  const content = (
    <>
      <div className="fixed inset-0 bg-black/50" style={{zIndex: 9998}} onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl"
        style={{zIndex: 9999}}
        dir="rtl"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">תקנון שימוש – משתמשי הפאב</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            aria-label="סגור"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <p className="text-right leading-relaxed">
            אני מתחייב/ת לפעול בהתאם לכללי הפאב, לשמור על התנהגות מכבדת ואחראית, לכבד את צוות המתנדבים והמשתמשים, ולפעול לפי ההנחיות והחוקים המפורטים להלן:
          </p>

          <section>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">כללי התנהגות</h3>
            <ul className="list-disc list-inside space-y-1 text-right">
              <li>כבוד הדדי בין כל המשתמשים והמתנדבים</li>
              <li>שמירה על אווירה קהילתית ונעימה</li>
              <li>אין אלימות, הטרדות או התנהגות פוגענית</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">אלכוהול וחוק</h3>
            <ul className="list-disc list-inside space-y-1 text-right">
              <li>הכניסה והגשת אלכוהול מגיל 18 ומעלה בלבד</li>
              <li>אין להעביר משקאות אלכוהוליים לקטינים</li>
              <li>יש לשמור על שתייה אחראית</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">שימוש במקום</h3>
            <ul className="list-disc list-inside space-y-1 text-right">
              <li>שמירה על ניקיון (פינוי כוסות ואשפה)</li>
              <li>אין הכנסת אלכוהול חיצוני</li>
              <li>שימוש בציוד המקום באחריות</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">התנהלות בבר</h3>
            <ul className="list-disc list-inside space-y-1 text-right">
              <li>הזמנות מתבצעות דרך האפליקציה / האתר בלבד</li>
              <li>יש לוודא ביצוע הזמנה בצורה מסודרת לפני איסוף</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">קהילתיות ואחריות</h3>
            <ul className="list-disc list-inside space-y-1 text-right">
              <li>הפאב פועל למען הקהילה – נשמח לעזרה והתנדבות</li>
              <li>הנהלת הפאב רשאית להפסיק שירות במקרה הצורך</li>
              <li>רעיונות ושיפורים תמיד מתקבלים בברכה</li>
            </ul>
          </section>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-md bg-indigo-600 dark:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 dark:hover:bg-indigo-600 transition"
        >
          הבנתי
        </button>
      </div>
    </>
  );

  return createPortal(content, document.getElementById("portal-root") ?? document.body);
}
