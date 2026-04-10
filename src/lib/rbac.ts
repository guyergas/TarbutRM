import { Role } from "@/generated/prisma/client";

/**
 * Check if user has required role
 */
export function hasRole(userRole: Role | undefined, requiredRole: Role): boolean {
  if (!userRole) return false;

  // Define role hierarchy: USER < STAFF < ADMIN
  const hierarchy: Record<Role, number> = {
    USER: 1,
    STAFF: 2,
    ADMIN: 3,
  };

  return hierarchy[userRole] >= hierarchy[requiredRole];
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole: Role | undefined): boolean {
  return userRole === "ADMIN";
}

/**
 * Check if user is staff or admin
 */
export function isStaffOrAdmin(userRole: Role | undefined): boolean {
  return hasRole(userRole, "STAFF");
}

/**
 * Check if user is a regular user or higher
 */
export function isUser(userRole: Role | undefined): boolean {
  return hasRole(userRole, "USER");
}

/**
 * Guard function for service layer (second line of defense)
 * Throws error if user doesn't have required role
 */
export function requireRole(userRole: Role | undefined, requiredRole: Role): void {
  if (!hasRole(userRole, requiredRole)) {
    throw new Error(`Insufficient permissions. Required: ${requiredRole}, Got: ${userRole}`);
  }
}

/**
 * Guard function: only admin
 */
export function requireAdmin(userRole: Role | undefined): void {
  requireRole(userRole, "ADMIN");
}

/**
 * Guard function: staff or admin
 */
export function requireStaffOrAdmin(userRole: Role | undefined): void {
  requireRole(userRole, "STAFF");
}
