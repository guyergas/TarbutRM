"use server";

import { auth } from "@/lib/auth";
import { operationService } from "@/modules/schedule/operationService";
import { revalidatePath } from "next/cache";

async function requireStaff() {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "STAFF" && session.user.role !== "ADMIN")) {
    throw new Error("Unauthorized");
  }
  return session;
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createOperation(date: string, note: string, requiredCount: number) {
  await requireAdmin();
  await operationService.create(new Date(date), note || undefined, requiredCount);
  revalidatePath("/staff/schedule");
}

export async function updateOperation(id: string, date: string, note: string, requiredCount: number) {
  await requireAdmin();
  await operationService.update(id, {
    date: new Date(date),
    note: note || null,
    requiredCount,
  });
  revalidatePath("/staff/schedule");
}

export async function deleteOperation(id: string) {
  await requireAdmin();
  await operationService.delete(id);
  revalidatePath("/staff/schedule");
}

export async function addStaffToOperation(operationId: string, userId: string) {
  await requireAdmin();
  await operationService.addStaff(operationId, userId);
  revalidatePath("/staff/schedule");
}

export async function removeStaffFromOperation(operationId: string, userId: string) {
  const session = await requireStaff();
  // Staff can only remove themselves; admin can remove anyone
  if (session.user.role !== "ADMIN" && session.user.id !== userId) {
    throw new Error("Unauthorized");
  }
  await operationService.removeStaff(operationId, userId);
  revalidatePath("/staff/schedule");
}

export async function selfRegisterOperation(operationId: string) {
  const session = await requireStaff();
  await operationService.addStaff(operationId, session.user.id);
  revalidatePath("/staff/schedule");
}

export async function addHelperToOperation(operationId: string, userId: string) {
  // Staff or admin can add helpers
  await requireStaff();
  await operationService.addHelper(operationId, userId);
  revalidatePath("/staff/schedule");
}

export async function removeHelperFromOperation(operationId: string, userId: string) {
  const session = await requireStaff();
  // Staff can only remove themselves or anyone if admin
  if (session.user.role !== "ADMIN" && session.user.id !== userId) {
    throw new Error("Unauthorized");
  }
  await operationService.removeHelper(operationId, userId);
  revalidatePath("/staff/schedule");
}
