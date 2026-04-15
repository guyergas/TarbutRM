import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function OpeningProcedurePage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "STAFF" && session.user.role !== "ADMIN")) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8" dir="rtl">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-white dark:bg-gray-800 px-8 py-10 shadow-sm dark:shadow-lg space-y-8">

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🍺 נהלי פתיחה – מתנדבי הפאב</h1>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">תיאום והיערכות:</h2>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li className="flex gap-2"><span>•</span><span>תיאום בין המתנדבים על חלוקת תפקידים</span></li>
              <li className="flex gap-2"><span>•</span><span>תיאום עם מנהל התרבות לגבי אופי ההפעלה השבועי (אירוע מיוחד / ערב רגוע / קהל צפוי וכו׳)</span></li>
              <li className="flex gap-2"><span>•</span><span>תיאום עם מנהל התרבות לגבי פריסת הפאב במועדון התרבות (מיקום, זרימה, אזורי עבודה)</span></li>
            </ul>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">לפני פתיחה:</h2>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li className="flex gap-2"><span>•</span><span>הגעה בזמן (לפחות 30–45 דקות לפני פתיחה)</span></li>
              <li className="flex gap-2"><span>•</span><span>בדיקת ניקיון כללי (בר, שולחנות, שירותים)</span></li>
              <li className="flex gap-2"><span>•</span><span>סידור והכנת אזור הבר לעבודה נוחה</span></li>
              <li className="flex gap-2"><span>•</span><span>בדיקת מלאי משקאות והשלמות במידת הצורך</span></li>
              <li className="flex gap-2"><span>•</span><span>הפעלת ציוד: תאורה, מוזיקה, מקררים</span></li>
              <li className="flex gap-2"><span>•</span><span>בדיקת תקינות כללית של הציוד והמרחב</span></li>
            </ul>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">לפני כניסת לקוחות:</h2>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li className="flex gap-2"><span>•</span><span>בדיקת מערכת התשלומים</span></li>
              <li className="flex gap-2"><span>•</span><span>ווידוא שהטאבלט זמין, טעון ומוכן לעבודה</span></li>
              <li className="flex gap-2"><span>•</span><span>מעבר אחרון על הסדר, הניקיון והארגון</span></li>
            </ul>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">עם פתיחה:</h2>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li className="flex gap-2"><span>•</span><span>קבלת פנים נעימה ללקוחות</span></li>
              <li className="flex gap-2"><span>•</span><span>שמירה על סדר וניקיון לאורך הערב</span></li>
              <li className="flex gap-2"><span>•</span><span>זמינות גבוהה ושירות אדיב</span></li>
            </ul>
          </div>

        </div>
      </div>
    </main>
  );
}
