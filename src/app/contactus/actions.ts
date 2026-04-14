"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface ActionResult {
  ok: boolean;
  message: string;
}

export async function submitContactMessage(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const email = (formData.get("email") as string)?.trim();
    const name = (formData.get("name") as string)?.trim();
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();

    // Validation
    if (!email || !title || !description) {
      return { ok: false, message: "כל השדות חובה" };
    }

    // Name validation for non-logged-in users
    if (name !== undefined && name !== null && name.length > 0) {
      if (name.length < 2) {
        return { ok: false, message: "השם חייב להיות לפחות 2 תווים" };
      }
      if (name.length > 100) {
        return { ok: false, message: "השם חייב להיות עד 100 תווים" };
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { ok: false, message: "אימייל לא תקין" };
    }

    // Title length check
    if (title.length < 3) {
      return { ok: false, message: "הכותרת חייבת להיות לפחות 3 תווים" };
    }

    if (title.length > 200) {
      return { ok: false, message: "הכותרת חייבת להיות עד 200 תווים" };
    }

    // Description length check
    if (description.length < 10) {
      return { ok: false, message: "התיאור חייב להיות לפחות 10 תווים" };
    }

    if (description.length > 1000) {
      return { ok: false, message: "התיאור חייב להיות עד 1000 תווים" };
    }

    // Create message in database
    await prisma.contactMessage.create({
      data: {
        email,
        name: name || null,
        title,
        description,
        status: "OPEN",
      },
    });

    return { ok: true, message: "תודה על ההודעה! אנחנו נחזור אליך בקרוב" };
  } catch (error) {
    console.error("Error submitting contact message:", error);
    return { ok: false, message: "אירעה שגיאה בשליחת ההודעה. נסה שוב" };
  }
}
