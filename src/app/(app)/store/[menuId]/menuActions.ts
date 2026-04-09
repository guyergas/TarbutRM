"use server";

import { auth } from "@/lib/auth";
import { menuService } from "@/modules/store";
import { revalidatePath } from "next/cache";

export async function createMenu(name: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const menu = await menuService.create({ name: name.trim() }, session.user.id);
  revalidatePath("/", "page");
  revalidatePath("/store/[menuId]", "page");
  return { success: true, menuId: menu.id };
}

export async function updateMenuName(menuId: string, name: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await menuService.update(menuId, { name }, session.user.id);
  revalidatePath("/store/[menuId]", "page");
  return { success: true };
}

export async function reorderMenus(orderedIds: string[]) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await menuService.reorder(orderedIds, session.user.id);
  revalidatePath("/", "page");
  revalidatePath("/store/[menuId]", "page");
  return { success: true };
}

export async function toggleArchiveMenu(menuId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await menuService.archive(menuId, session.user.id);
  revalidatePath("/", "page");
  revalidatePath("/store/[menuId]", "page");
  return { success: true };
}
