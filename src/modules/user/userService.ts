import { getPrismaInstance } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@/generated/prisma/client";

/**
 * Create a new user (ADMIN only)
 * Hashes password and sets createdBy actor
 */
export async function createUser(
  data: { firstName: string; lastName: string; email: string; password: string; role: Role },
  actorId: string
) {
  const prisma = getPrismaInstance();

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(data.password, 12);

  // Create user
  return prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
      role: data.role,
      city: "", // Required field, default to empty
      createdBy: actorId,
      active: true,
    },
  });
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  const prisma = getPrismaInstance();

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      balance: true,
      active: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
    },
  });
}

/**
 * List users with optional filters
 */
export async function listUsers(filters?: { role?: Role; active?: boolean }) {
  const prisma = getPrismaInstance();

  return prisma.user.findMany({
    where: {
      ...(filters?.role && { role: filters.role }),
      ...(filters?.active !== undefined && { active: filters.active }),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      balance: true,
      active: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Change user role (ADMIN only)
 * Deletes all target user sessions after change
 */
export async function changeRole(userId: string, newRole: Role, actorId: string) {
  const prisma = getPrismaInstance();

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  });

  // Delete all sessions for this user
  await prisma.session.deleteMany({
    where: { userId },
  });

  return user;
}

/**
 * Set user active/inactive status (ADMIN only)
 * On deactivate, deletes all target user sessions immediately
 */
export async function setActive(userId: string, active: boolean, actorId: string) {
  const prisma = getPrismaInstance();

  const user = await prisma.user.update({
    where: { id: userId },
    data: { active },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      active: true,
    },
  });

  // If deactivating, delete all sessions
  if (!active) {
    await prisma.session.deleteMany({
      where: { userId },
    });
  }

  return user;
}

/**
 * Reset user password (ADMIN only)
 * Hashes new password and deletes all target user sessions
 */
export async function resetPassword(userId: string, newPassword: string, actorId: string) {
  const prisma = getPrismaInstance();

  // Hash password
  const passwordHash = await bcrypt.hash(newPassword, 12);

  const user = await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  // Delete all sessions for this user
  await prisma.session.deleteMany({
    where: { userId },
  });

  return user;
}
