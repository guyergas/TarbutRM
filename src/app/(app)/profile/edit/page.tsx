import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { updateProfile } from "../editActions";

export const metadata = { title: "עריכת פרופיל — TarbutRM" };

export default async function EditProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      city: true,
      street: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/profile"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← חזור לפרופיל
        </Link>
      </div>

      <div className="rounded-xl bg-white dark:bg-gray-800 px-8 py-8 shadow-sm dark:shadow-xl">
        <h1 className="text-2xl font-bold mb-6">עריכת פרופיל</h1>

        <form action={updateProfile} className="space-y-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              שם פרטי
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              defaultValue={user.firstName}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              שם משפחה
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              defaultValue={user.lastName}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              אימייל
            </label>
            <input
              type="email"
              id="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">לא ניתן לשנות אימייל</p>
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              עיר
            </label>
            <input
              type="text"
              id="city"
              name="city"
              defaultValue={user.city}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              טלפון (אופציונלי)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              defaultValue={user.phone || ""}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Street */}
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              רחוב ומספר בית (אופציונלי)
            </label>
            <input
              type="text"
              id="street"
              name="street"
              defaultValue={user.street || ""}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition mt-6"
          >
            שמור שינויים
          </button>
        </form>
      </div>
    </div>
  );
}
