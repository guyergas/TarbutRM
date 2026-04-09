import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function fmtPhone(raw: string | null | undefined): string | null {
  const d = (raw ?? "").replace(/\D/g, "").slice(0, 10);
  if (!d) return null;
  return d.length <= 3 ? d : `${d.slice(0, 3)}-${d.slice(3)}`;
}

export async function POST(req: NextRequest) {
  const body = await req.formData();

  const firstName = (body.get("firstName") as string | null)?.trim();
  const lastName = (body.get("lastName") as string | null)?.trim();
  const email = (body.get("email") as string | null)?.trim().toLowerCase();
  const password = body.get("password") as string | null;
  const confirm = body.get("confirm") as string | null;
  const phone = fmtPhone(body.get("phone") as string | null);
  const city = (body.get("city") as string | null)?.trim();
  const street = (body.get("street") as string | null)?.trim() || null;

  if (!firstName || !lastName || !email || !password || !confirm || !city) {
    return NextResponse.json({ error: "יש למלא את כל השדות החובה." }, { status: 400 });
  }
  if (password !== confirm) {
    return NextResponse.json({ error: "הסיסמאות אינן תואמות." }, { status: 400 });
  }
  if (phone && !/^\d{3}-\d{7}$/.test(phone)) {
    return NextResponse.json({ error: "מספר הטלפון אינו תקין — פורמט נדרש: 050-0000000" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "כתובת האימייל כבר רשומה במערכת." }, { status: 409 });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { firstName, lastName, email, passwordHash, phone, city, street } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "שגיאה ביצירת המשתמש — ייתכן שהאימייל כבר קיים." }, { status: 500 });
  }
}
