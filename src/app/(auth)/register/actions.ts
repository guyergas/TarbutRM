"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function registerAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const firstName = (formData.get("firstName") as string | null)?.trim();
  const lastName = (formData.get("lastName") as string | null)?.trim();
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const password = formData.get("password") as string | null;
  const confirm = formData.get("confirm") as string | null;
  const city = (formData.get("city") as string | null)?.trim();
  const street = (formData.get("street") as string | null)?.trim() || null;

  if (!firstName || !lastName || !email || !password || !confirm || !city) {
    return "יש למלא את כל השדות החובה.";
  }

  if (password.length < 8) {
    return "הסיסמא חייבת להכיל לפחות 8 תווים.";
  }

  if (password !== confirm) {
    return "הסיסמאות אינן תואמות.";
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return "כתובת האימייל כבר רשומה במערכת.";
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { firstName, lastName, email, passwordHash, city, street },
  });

  redirect("/login");
}
