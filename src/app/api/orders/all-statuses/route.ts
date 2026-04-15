import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Returns all order ids for staff/admin — used to detect new orders
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "STAFF" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { status: { in: ["NEW", "IN_PROGRESS"] } },
    select: { id: true, status: true },
    orderBy: { createdAt: "asc" },
  });

  const statuses: Record<string, string> = {};
  for (const o of orders) {
    statuses[o.id] = o.status;
  }

  return NextResponse.json(statuses);
}
