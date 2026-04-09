"use server";

import { auth } from "@/lib/auth";
import { itemService } from "@/modules/store";

export async function setStockAction(itemId: string, inStock: boolean) {
  const session = await auth();
  if (!session?.user || !session.user.id) {
    throw new Error("Unauthorized");
  }

  // Check if user is STAFF or ADMIN
  if (session.user.role !== "STAFF" && session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return itemService.setStock(itemId, inStock, session.user.id);
}
