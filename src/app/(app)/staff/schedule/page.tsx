import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { operationService } from "@/modules/schedule/operationService";
import { prisma } from "@/lib/prisma";
import ScheduleClient from "./ScheduleClient";

export const metadata = { title: "לוח שיבוצים – TarbutRM" };

export default async function SchedulePage() {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "STAFF" && session.user.role !== "ADMIN")) {
    redirect("/");
  }

  // Seed default Thursdays from 2026-04-16 for 6 months on first load
  const count = await prisma.operation.count();
  if (count === 0) {
    await operationService.seedThursdays(new Date("2026-04-16"));
  }

  const ops = await operationService.list();

  // For each operation date, sum all completed orders placed that day
  const opDates = ops.map((op) => op.date);
  const orderTotals: Record<string, number> = {};
  if (opDates.length > 0) {
    for (const date of opDates) {
      const dayStart = new Date(date);
      dayStart.setUTCHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setUTCHours(23, 59, 59, 999);
      const result = await prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: dayStart, lte: dayEnd },
        },
      });
      orderTotals[date.toISOString()] = Number(result._sum.total ?? 0);
    }
  }

  const serialized = ops.map((op) => ({
    id: op.id,
    date: op.date.toISOString(),
    note: op.note,
    requiredCount: op.requiredCount,
    orderTotal: orderTotals[op.date.toISOString()] ?? 0,
    staff: op.staff.map((s) => ({
      id: s.id,
      userId: s.userId,
      user: { id: s.user.id, firstName: s.user.firstName, lastName: s.user.lastName },
    })),
    helpers: op.helpers.map((h) => ({
      id: h.id,
      userId: h.userId,
      user: { id: h.user.id, firstName: h.user.firstName, lastName: h.user.lastName },
    })),
  }));

  // Staff/admin for the operators column
  const staffUsers = await prisma.user.findMany({
    where: { role: { in: ["STAFF", "ADMIN"] }, active: true },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" },
  });

  // All active users for the helpers column
  const allUsers = await prisma.user.findMany({
    where: { active: true },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <ScheduleClient
        operations={serialized}
        allStaff={staffUsers}
        allUsers={allUsers}
        currentUserId={session.user.id}
        currentUserRole={session.user.role as "USER" | "STAFF" | "ADMIN"}
      />
    </div>
  );
}
