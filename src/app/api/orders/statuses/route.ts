import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Returns a map of orderId -> status for the current user's non-completed orders
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    select: { id: true, status: true },
  });

  const statuses: Record<string, string> = {};
  for (const o of orders) {
    statuses[o.id] = o.status;
  }

  return NextResponse.json(statuses);
}
