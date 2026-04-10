import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
    throw new Error(`User not authenticated. Session: ${JSON.stringify(session?.user || null)}`);
  }

  const userId = session.user.id;
  if (!userId || typeof userId !== "string" || userId.length === 0) {
    throw new Error(`Invalid user ID: ${userId}`);
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { firstName: true, lastName: true, email: true, role: true, city: true, street: true, phone: true, balance: true, createdAt: true },
  });

  const joined = new Intl.DateTimeFormat("he-IL", { dateStyle: "long" }).format(user.createdAt);

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="rounded-xl bg-white dark:bg-gray-800 px-8 py-8 shadow-sm dark:shadow-xl space-y-5">
        <h1 className="text-2xl">הפרופיל שלי</h1>

        <dl className="space-y-3 text-sm">
          <Row label="שם" value={`${user.firstName} ${user.lastName}`} />
          <Row label="אימייל" value={user.email} />
          <Row label="תפקיד" value={ROLE_LABEL[user.role] ?? user.role} />
          <Row label="עיר" value={user.city} />
          {user.phone && <Row label="טלפון" value={user.phone} />}
          {user.street && <Row label="רחוב ומספר בית" value={user.street} />}
          <Row label="יתרה" value={`₪${Number(user.balance).toFixed(2)}`} />
          <Row label="חבר מאז" value={joined} />
        </dl>

        <div className="pt-2">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
      <dt className="font-medium text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="text-gray-900 dark:text-gray-100">{value}</dd>
    </div>
  );
}
