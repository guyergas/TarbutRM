"use server";

import { auth } from "@/lib/auth";
import { itemService } from "@/modules/store";

export async function updateItemAction(
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    image?: string;
  }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN" || !session.user.id) {
    throw new Error("Unauthorized");
  }

  return itemService.update(id, data, session.user.id);
}

export async function toggleStockAction(id: string, inStock: boolean) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN" || !session.user.id) {
    throw new Error("Unauthorized");
  }

  return itemService.setStock(id, inStock, session.user.id);
}

export async function archiveItemAction(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN" || !session.user.id) {
    throw new Error("Unauthorized");
  }

  return itemService.archive(id, session.user.id);
}

export async function duplicateItemAction(
  id: string,
  targetSectionId: string
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN" || !session.user.id) {
    throw new Error("Unauthorized");
  }

  return itemService.duplicate(id, targetSectionId, session.user.id);
}
