"use server";

import { auth } from "@/lib/auth";
import { itemService } from "@/modules/store";

export async function toggleStockFromModal(id: string, inStock: boolean) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    throw new Error("Unauthorized: must be admin or staff");
  }

  return itemService.setStock(id, inStock, session.user.id);
}

export async function updateItemFromModal(
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    image?: string;
    availableForGuests?: boolean;
  }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN" || !session.user.id) {
    throw new Error("Unauthorized: admin only");
  }

  return itemService.update(id, data, session.user.id);
}

export async function getStockHistory(itemId: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return [];
  }

  return itemService.getStockHistory(itemId);
}

export async function fetchItem(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return itemService.getById(itemId);
}
