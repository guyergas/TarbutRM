"use server";

import { auth } from "@/lib/auth";
import { orderService } from "@/modules/order";
import { revalidatePath } from "next/cache";

export async function createOrderAction(
  itemsInCart: Array<{ itemId: string; quantity: number }>
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const order = await orderService.createOrder(session.user.id, itemsInCart);

  // Revalidate the layout to refresh TopBar with updated balance
  revalidatePath("/(app)");

  return order;
}
