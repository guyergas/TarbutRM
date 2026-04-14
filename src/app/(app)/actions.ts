"use server";

import { signOut, auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function markTutorialAsViewed(userId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Verify the userId matches the session user
    if (userId !== session.user.id) {
      throw new Error("Forbidden");
    }

    // Update user's tutorialViewed status
    await prisma.user.update({
      where: { id: userId },
      data: { tutorialViewed: true },
    });

    return { ok: true };
  } catch (error) {
    console.error("[markTutorialAsViewed]", error);
    throw error;
  }
}
