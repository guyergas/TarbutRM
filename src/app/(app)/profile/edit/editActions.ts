"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

type Result = {
  ok: boolean;
  message: string;
};

export async function updateProfile(
  userId: string,
  _prevState: Result | null,
  formData: FormData
): Promise<Result> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Ensure user can only update their own profile
  if (session.user.id !== userId) {
    return {
      ok: false,
      message: "אין הרשאה לעדכן פרופיל זה",
    };
  }

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;
  const city = formData.get("city") as string;
  const street = formData.get("street") as string;
  const role = formData.get("role");
  const active = formData.get("active");

  // Reject attempts to modify admin-only fields
  if (role !== null || active !== null) {
    return {
      ok: false,
      message: "אין הרשאה לעדכן שדות אלה",
    };
  }

  if (!firstName || !lastName || !city) {
    return {
      ok: false,
      message: "שם פרטי, שם משפחה ועיר נדרשים",
    };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      phone: phone || null,
      city,
      street: street || null,
    },
  });

  redirect("/profile");
}
