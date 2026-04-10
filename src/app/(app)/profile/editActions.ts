"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;
  const city = formData.get("city") as string;
  const street = formData.get("street") as string;

  if (!firstName || !lastName || !city) {
    throw new Error("שם פרטי, שם משפחה ועיר נדרשים");
  }

  await prisma.user.update({
    where: { id: session.user.id },
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
