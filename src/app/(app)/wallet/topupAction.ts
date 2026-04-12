"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { TransactionType } from "@/generated/prisma/enums";

type ActionResult = { ok: boolean; message: string; newBalance?: string };

export async function processTopupAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "אין הרשאה" };
  }

  const rawAmount = parseFloat(formData.get("amount") as string);

  if (isNaN(rawAmount) || rawAmount <= 0) {
    return { ok: false, message: "יש להזין סכום חיובי" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.budgetTransaction.create({
        data: {
          userId: session.user.id,
          amount: rawAmount,
          type: TransactionType.CARD_TOPUP,
          createdBy: session.user.id,
          note: "Card Topup",
        },
      });

      // Update user balance
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: { balance: { increment: rawAmount } },
        select: { balance: true },
      });

      return updatedUser;
    });

    revalidatePath("/wallet");
    // Revalidate the layout to refresh TopBar with updated balance
    revalidatePath("/(app)");
    return {
      ok: true,
      message: "Balance updated successfully ✓",
      newBalance: result.balance.toString(),
    };
  } catch (error) {
    console.error("Topup error:", error);
    return { ok: false, message: "שגיאה בעדכון היתרה" };
  }
}
