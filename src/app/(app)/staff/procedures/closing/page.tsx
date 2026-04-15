import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ClosingProcedurePage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "STAFF" && session.user.role !== "ADMIN")) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8" dir="rtl">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-white dark:bg-gray-800 px-8 py-10 shadow-sm dark:shadow-lg space-y-8">

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🔒 נהלי סגירה – מתנדבי הפאב</h1>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">בסיום פעילות:</h2>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li className="flex gap-2"><span>•</span><span>הפסקת פעילות בשעה שנקבעה</span></li>
              <li className="flex gap-2"><span>•</span><span>פינוי כוסות ושולחנות</span></li>
              <li className="flex gap-2"><span>•</span><span>ניקיון הבר והשטח הציבורי</span></li>
            </ul>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">סגירה תפעולית:</h2>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li className="flex gap-2"><span>•</span><span>שטיפת כוסות וכלי עבודה</span></li>
              <li className="flex gap-2"><span>•</span><span>כיבוי מוזיקה, תאורה וציוד חשמלי</span></li>
              <li className="flex gap-2"><span>•</span><span>סגירת מקררים ואזורי אחסון</span></li>
            </ul>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">ניהול מלאי:</h2>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li className="flex gap-2"><span>•</span><span>רישום חוסרים במלאי</span></li>
              <li className="flex gap-2"><span>•</span><span>דיווח על תקלות או חריגות</span></li>
              <li className="flex gap-2"><span>•</span><span>עדכון הגורם האחראי (מנהל התרבות / אחראי הפאב)</span></li>
            </ul>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">לפני יציאה:</h2>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li className="flex gap-2"><span>•</span><span>ווידוא שהמקום נקי ומסודר</span></li>
              <li className="flex gap-2"><span>•</span><span>נעילת המקום לפי הנהלים</span></li>
              <li className="flex gap-2"><span>•</span><span>כיבוי אורות אחרונים</span></li>
            </ul>
          </div>

        </div>
      </div>
    </main>
  );
}
