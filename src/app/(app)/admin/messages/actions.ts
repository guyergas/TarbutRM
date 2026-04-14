"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function closeMessageAction(messageId: string): Promise<ActionResult> {
  try {
    const session = await auth();

    // Check authentication and authorization
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "אין הרשאה" };
    }

    // Update message status to CLOSED
    await prisma.contactMessage.update({
      where: { id: messageId },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
      },
    });

    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error) {
    console.error("Error closing message:", error);
    return { success: false, error: "אירעה שגיאה בסגירת ההודעה" };
  }
}

export async function reopenMessageAction(messageId: string): Promise<ActionResult> {
  try {
    const session = await auth();

    // Check authentication and authorization
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "אין הרשאה" };
    }

    // Update message status to OPEN
    await prisma.contactMessage.update({
      where: { id: messageId },
      data: {
        status: "OPEN",
        closedAt: null,
      },
    });

    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error) {
    console.error("Error reopening message:", error);
    return { success: false, error: "אירעה שגיאה בפתיחת ההודעה" };
  }
}
