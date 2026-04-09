"use server";

import { auth } from "@/lib/auth";
import { sectionService } from "@/modules/store";
import { revalidatePath } from "next/cache";

export async function createSection(menuId: string, name: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const section = await sectionService.create(
    menuId,
    { name: name.trim() },
    session.user.id
  );
  revalidatePath("/store/[menuId]", "page");
  return { success: true, sectionId: section.id };
}

export async function updateSectionName(sectionId: string, name: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await sectionService.update(sectionId, { name }, session.user.id);
  revalidatePath("/store/[menuId]", "page");
  return { success: true };
}

export async function reorderSections(menuId: string, orderedIds: string[]) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await sectionService.reorder(menuId, orderedIds, session.user.id);
  revalidatePath("/store/[menuId]", "page");
  return { success: true };
}
