import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ItemsReportClient from "./ItemsReportClient";

export const metadata = { title: "דוח פריטים – TarbutRM" };

function getDateRange(preset: string, from: string | null, to: string | null): { fromDate: Date; toDate: Date } {
  const now = new Date();

  if (preset === "thismonth") {
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return { fromDate: firstOfThisMonth, toDate: now };
  }

  if (preset === "lastmonth") {
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return { fromDate: firstOfLastMonth, toDate: firstOfThisMonth };
  }

  if (preset === "custom" && from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    return { fromDate, toDate };
  }

  // Default: last 30 days
  const fromDate = new Date(now);
  fromDate.setDate(fromDate.getDate() - 30);
  fromDate.setHours(0, 0, 0, 0);
  return { fromDate, toDate: now };
}

export type ItemReportRow = {
  itemId: string;
  itemName: string;
  sectionName: string;
  menuId: string;
  menuName: string;
  quantity: number;
  revenue: number;
};

export type OperationOption = {
  id: string;
  date: string; // ISO date string
  label: string;
};

export default async function ItemsReportPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; from?: string; to?: string; ops?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const preset = params.preset ?? "30d";
  const { fromDate, toDate } = getDateRange(preset, params.from ?? null, params.to ?? null);

  // Selected operation IDs (comma-separated)
  const selectedOpIds = params.ops ? params.ops.split(",").filter(Boolean) : null;

  // Fetch all operations for the filter dropdown (only past + within range)
  const allOperations = await prisma.operation.findMany({
    orderBy: { date: "desc" },
    select: { id: true, date: true },
  });

  // Build date filter: either from selected operations or from date range
  let orderDateFilter: { gte: Date; lte: Date };
  if (selectedOpIds && selectedOpIds.length > 0) {
    const opDates = allOperations
      .filter((op) => selectedOpIds.includes(op.id))
      .map((op) => op.date);
    if (opDates.length > 0) {
      const minDate = new Date(Math.min(...opDates.map((d) => d.getTime())));
      const maxDate = new Date(Math.max(...opDates.map((d) => d.getTime())));
      maxDate.setHours(23, 59, 59, 999);
      orderDateFilter = { gte: minDate, lte: maxDate };
    } else {
      orderDateFilter = { gte: fromDate, lte: toDate };
    }
  } else {
    orderDateFilter = { gte: fromDate, lte: toDate };
  }

  // When filtering by operations, only include orders from those specific dates
  const opDateStrings = selectedOpIds && selectedOpIds.length > 0
    ? allOperations.filter((op) => selectedOpIds.includes(op.id)).map((op) => op.date.toISOString().split("T")[0])
    : null;

  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: orderDateFilter,
      },
    },
    include: {
      item: {
        include: {
          section: {
            include: {
              menu: { select: { id: true, name: true } },
            },
          },
        },
      },
      order: {
        select: { createdAt: true },
      },
    },
  });

  // Filter further to exact operation dates if needed
  const filtered = opDateStrings
    ? orderItems.filter((oi) => {
        const orderDate = oi.order.createdAt.toISOString().split("T")[0];
        return opDateStrings.includes(orderDate);
      })
    : orderItems;

  // Aggregate by item
  const map = new Map<string, ItemReportRow>();
  for (const oi of filtered) {
    const existing = map.get(oi.itemId);
    if (existing) {
      existing.quantity += oi.quantity;
      existing.revenue += Number(oi.subtotal);
    } else {
      map.set(oi.itemId, {
        itemId: oi.itemId,
        itemName: oi.item.name,
        sectionName: oi.item.section.name,
        menuId: oi.item.section.menu.id,
        menuName: oi.item.section.menu.name,
        quantity: oi.quantity,
        revenue: Number(oi.subtotal),
      });
    }
  }

  const rows = Array.from(map.values()).sort((a, b) => b.quantity - a.quantity);

  const operationOptions: OperationOption[] = allOperations.map((op) => ({
    id: op.id,
    date: op.date.toISOString(),
    label: op.date.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" }),
  }));

  const fromStr = fromDate.toISOString().split("T")[0];
  const toStr = toDate.toISOString().split("T")[0];

  return (
    <ItemsReportClient
      rows={rows}
      operationOptions={operationOptions}
      selectedOpIds={selectedOpIds ?? []}
      fromDate={fromStr}
      toDate={toStr}
      preset={preset}
    />
  );
}
