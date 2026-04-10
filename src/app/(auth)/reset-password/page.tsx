import Link from "next/link";

export const metadata = { title: "איפוס סיסמא — TarbutRM" };

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">איפוס סיסמא</h1>
        <p className="mt-1 text-sm text-gray-300">פנה למנהל לאיפוס הסיסמא שלך</p>
      </div>

      <div className="rounded-lg bg-white dark:bg-gray-800 px-8 py-10 shadow-md dark:shadow-lg text-center space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          לאיפוס סיסמא, פנה למנהל המערכת.
        </p>
        <Link
          href="/login"
          className="block text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          חזרה להתחברות
        </Link>
      </div>
    </div>
  );
}
