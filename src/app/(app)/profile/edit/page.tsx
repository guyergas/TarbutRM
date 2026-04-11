import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import EditUserForm from "../../admin/user/[id]/EditUserForm";
import { updateProfile } from "./editActions";

export const metadata = { title: "עריכת פרופיל — TarbutRM" };

export default async function EditProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  const serialized = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    city: user.city,
    street: user.street,
    role: user.role,
    active: user.active,
    balance: user.balance.toFixed(2),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/profile"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition"
        >
          ← חזור לפרופיל
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</h1>
      </div>

      {/* Edit form */}
      <div className="rounded-lg bg-white dark:bg-gray-800 px-8 py-6 shadow-sm dark:shadow-lg space-y-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">פרטי משתמש</h2>
        <EditUserForm user={serialized} formAction={updateProfile} isAdminEdit={false} />
      </div>
    </div>
  );
}
