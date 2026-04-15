import { prisma } from "@/lib/prisma";

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export const operationService = {
  async list() {
    return prisma.operation.findMany({
      orderBy: { date: "asc" },
      include: {
        staff: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { addedAt: "asc" },
        },
        helpers: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { addedAt: "asc" },
        },
      },
    });
  },

  async create(date: Date, note?: string, requiredCount?: number) {
    return prisma.operation.create({
      data: {
        date: startOfDay(date),
        note: note ?? null,
        requiredCount: requiredCount ?? 2,
      },
    });
  },

  async update(id: string, data: { date?: Date; note?: string | null; requiredCount?: number }) {
    return prisma.operation.update({
      where: { id },
      data: {
        ...(data.date !== undefined ? { date: startOfDay(data.date) } : {}),
        ...(data.note !== undefined ? { note: data.note } : {}),
        ...(data.requiredCount !== undefined ? { requiredCount: data.requiredCount } : {}),
      },
    });
  },

  async delete(id: string) {
    return prisma.operation.delete({ where: { id } });
  },

  async addStaff(operationId: string, userId: string) {
    return prisma.operationStaff.create({ data: { operationId, userId } });
  },

  async removeStaff(operationId: string, userId: string) {
    return prisma.operationStaff.deleteMany({ where: { operationId, userId } });
  },

  async addHelper(operationId: string, userId: string) {
    return prisma.operationHelper.create({ data: { operationId, userId } });
  },

  async removeHelper(operationId: string, userId: string) {
    return prisma.operationHelper.deleteMany({ where: { operationId, userId } });
  },

  async seedThursdays(from: Date) {
    const start = startOfDay(from);
    const end = addDays(start, 183); // ~6 months

    // Find the first Thursday on or after `start` (day 4 = Thursday in UTC)
    let cur = new Date(start);
    while (cur.getUTCDay() !== 4) cur = addDays(cur, 1);

    while (cur <= end) {
      const d = new Date(cur);
      await prisma.operation.upsert({
        where: { date: d },
        update: {},
        create: { date: d, requiredCount: 2 },
      });
      cur = addDays(cur, 7);
    }
  },
};
