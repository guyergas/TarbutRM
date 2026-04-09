"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

function fmtPhone(raw: string | null | undefined): string | null {
  const d = (raw ?? "").replace(/\D/g, "").slice(0, 10);
  if (!d) return null;
  return d.length <= 3 ? d : `${d.slice(0, 3)}-${d.slice(3)}`;
}

type ActionResult = { ok: boolean; message: string };

export async function updateUserAction(
  userId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { ok: false, message: "אין הרשאה" };

  const firstName = (formData.get("firstName") as string).trim();
  const lastName = (formData.get("lastName") as string).trim();
  const email = (formData.get("email") as string).trim();
  const phone = fmtPhone(formData.get("phone") as string);
  const city = (formData.get("city") as string).trim();
  const street = (formData.get("street") as string).trim() || null;
  const role = formData.get("role") as "USER" | "STAFF" | "ADMIN";
  const active = formData.get("active") === "true";

  if (!firstName || !lastName || !email || !city) return { ok: false, message: "שם פרטי, שם משפחה, אימייל ועיר הם שדות חובה" };
  if (phone && !/^\d{3}-\d{7}$/.test(phone)) return { ok: false, message: "מספר הטלפון אינו תקין — פורמט נדרש: 050-0000000" };


  try {
    await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, email, phone, city, street, role, active },
    });
    revalidatePath(`/admin/user/${userId}`);
    revalidatePath("/admin/users");
    return { ok: true, message: "הפרטים עודכנו בהצלחה" };
  } catch {
    return { ok: false, message: "שגיאה בשמירה — ייתכן שהאימייל כבר קיים" };
  }
}

export async function resetPasswordAction(
  userId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { ok: false, message: "אין הרשאה" };

  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!password || !confirm) return { ok: false, message: "יש למלא את כל השדות" };
  if (password !== confirm) return { ok: false, message: "הסיסמאות אינן תואמות" };
  if (password.length < 8) return { ok: false, message: "הסיסמא קצרה מדי" };

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { ok: true, message: "הסיסמא עודכנה בהצלחה" };
  } catch {
    return { ok: false, message: "שגיאה בעדכון הסיסמא" };
  }
}

export async function addTransactionAction(
  userId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { ok: false, message: "אין הרשאה" };

  const rawAmount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as string; // "in" | "back"
  const note = (formData.get("note") as string).trim() || null;

  if (isNaN(rawAmount) || rawAmount <= 0)
    return { ok: false, message: "יש להזין סכום חיובי" };

  const amount = type === "back" ? -rawAmount : rawAmount;

  try {
    await prisma.$transaction([
      prisma.budgetTransaction.create({
        data: { userId, amount, note, createdBy: session.user.id! },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: amount } },
      }),
    ]);
    revalidatePath(`/admin/user/${userId}`);
    revalidatePath("/admin/users");
    return { ok: true, message: "העסקה נוספה בהצלחה" };
  } catch {
    return { ok: false, message: "שגיאה בהוספת העסקה" };
  }
}
