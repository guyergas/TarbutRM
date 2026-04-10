import { beforeAll, afterAll, beforeEach } from 'vitest';
import { getPrismaInstance } from '@/lib/prisma';

// Reset database state between tests
beforeEach(async () => {
  const prisma = getPrismaInstance();
  // Clear all tables in order of dependencies
  await prisma.orderStatusHistory.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.budgetTransaction.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
});

// Close Prisma connection after all tests
afterAll(async () => {
  const prisma = getPrismaInstance();
  await prisma.$disconnect();
});
