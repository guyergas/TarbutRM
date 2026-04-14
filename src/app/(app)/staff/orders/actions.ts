"use server";

import { auth } from "@/lib/auth";
import { orderService } from "@/modules/order";

type AdvanceStatusResult =
  | { success: true; order: any; error?: never }
  | { success: false; order?: never; error: string };

export async function advanceStatusAction(
  orderId: string,
  targetStatus?: string
): Promise<AdvanceStatusResult> {
  const session = await auth();

  // Verify user is authenticated
  if (!session?.user?.id) {
    throw new Error("Unauthorized: not authenticated");
  }

  // Get the order to check ownership
  const prisma = (await import("@/lib/prisma")).getPrismaInstance();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true, status: true },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Permission check:
  // - STAFF/ADMIN can advance any order
  // - USER can only mark their own order as COMPLETED (from NEW or IN_PROGRESS)
  const isStaffOrAdmin = session.user.role === "STAFF" || session.user.role === "ADMIN";
  const isOwnOrder = order.userId === session.user.id;
  const isMarkingComplete = targetStatus === "COMPLETED";

  if (!isStaffOrAdmin && (!isOwnOrder || !isMarkingComplete)) {
    throw new Error("Unauthorized: users can only mark their own orders as complete");
  }

  try {
    console.log("DEBUG: advanceStatusAction server-side, targetStatus=", targetStatus);
    const updatedOrder = await orderService.advanceStatus(orderId, session.user.id, targetStatus);
    if (!updatedOrder) {
      throw new Error("Failed to update order");
    }
    console.log("DEBUG: order updated to status=", updatedOrder.status);

    // Serialize Decimal types before returning to client
    const serialized = {
      ...updatedOrder,
      total: Number(updatedOrder.total),
      items: updatedOrder.items.map((item: any) => ({
        id: item.id,
        orderId: item.orderId,
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
        item: item.item ? {
          ...item.item,
          price: Number(item.item.price),
        } : null,
      })),
    };

    return {
      success: true,
      order: serialized,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to advance status";
    return {
      success: false,
      error: message,
    };
  }
}
