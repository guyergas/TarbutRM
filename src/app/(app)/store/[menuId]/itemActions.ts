"use server";

import { auth } from "@/lib/auth";
import { itemService } from "@/modules/store";
import { revalidatePath } from "next/cache";

export async function createItem(
  sectionId: string,
  name: string,
  price: number,
  description: string = "",
  image: string = ""
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN" || !session.user.id) {
    throw new Error("Unauthorized");
  }

  const item = await itemService.create(
    sectionId,
    {
      name: name.trim(),
      price,
      description: description.trim(),
      ...(image && { image }),
    },
    session.user.id
  );

  revalidatePath("/store/[menuId]", "page");
  return { success: true, itemId: item.id };
}
