"use server";

import { auth } from "@/lib/auth";
import { orderService } from "@/modules/order";

export async function advanceStatusAction(orderId: string) {
  const session = await auth();

  // Verify user is authenticated and has STAFF or ADMIN role
  if (!session?.user?.id || (session.user.role !== "STAFF" && session.user.role !== "ADMIN")) {
    throw new Error("Unauthorized: must be staff or admin");
  }

  try {
    const updatedOrder = await orderService.advanceStatus(orderId, session.user.id);
    return {
      success: true,
      order: updatedOrder,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to advance status";
    return {
      success: false,
      error: message,
    };
  }
}
