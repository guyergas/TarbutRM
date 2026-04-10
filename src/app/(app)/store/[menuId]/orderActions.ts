"use server";

import { auth } from "@/lib/auth";
import { orderService } from "@/modules/order";

export async function createOrderAction(
  itemsInCart: Array<{ itemId: string; quantity: number }>
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return orderService.createOrder(session.user.id, itemsInCart);
}
