import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export const metadata = { title: "הפרופיל שלי — TarbutRM" };

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "מנהל",
  STAFF: "צוות",
  USER: "לקוח",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, email: true, role: true, city: true, street: true, phone: true, balance: true, createdAt: true },
  });

  if (!user) {
    redirect("/login");
  }

  const joined = new Intl.DateTimeFormat("he-IL", { dateStyle: "long" }).format(user.createdAt);
  const balance = Number(user.balance);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">הפרופיל שלי</h1>
        <Link
          href="/profile/edit"
          className="rounded-lg bg-indigo-600 dark:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-600 transition"
        >
          עריכה
        </Link>
      </div>

      {/* Personal Information Card */}
      <div className="rounded-lg bg-white dark:bg-gray-800 px-8 py-6 shadow-sm dark:shadow-lg space-y-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">פרטים אישיים</h2>
        <dl className="space-y-3 text-sm">
          <Row label="שם מלא" value={`${user.firstName} ${user.lastName}`} />
          <Row label="אימייל" value={user.email} />
          {user.phone && <Row label="טלפון" value={user.phone} />}
          <Row label="עיר" value={user.city} />
          {user.street && <Row label="רחוב ומספר בית" value={user.street} />}
        </dl>
      </div>

      {/* Account Information Card */}
      <div className="rounded-lg bg-white dark:bg-gray-800 px-8 py-6 shadow-sm dark:shadow-lg space-y-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">פרטי חשבון</h2>
        <dl className="space-y-3 text-sm">
          <Row label="תפקיד" value={ROLE_LABEL[user.role] ?? user.role} />
          <Row label="חבר מאז" value={joined} />
        </dl>
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-500 dark:text-gray-400">יתרה</span>
            <span
              className={`text-xl font-bold font-variant-numeric-tabular ${
                balance >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              ₪{balance.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-lg bg-white dark:bg-gray-800 px-8 py-6 shadow-sm dark:shadow-lg">
        <LogoutButton />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
      <dt className="font-medium text-gray-600 dark:text-gray-400">{label}</dt>
      <dd className="text-right text-gray-900 dark:text-gray-100">{value}</dd>
    </div>
  );
}
