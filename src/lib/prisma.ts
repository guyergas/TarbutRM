import { PrismaClient } from "../generated/prisma/client";

let prismaInstance: PrismaClient | null = null;

export function getPrisma() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

export const prisma = getPrisma();
export { PrismaClient };
