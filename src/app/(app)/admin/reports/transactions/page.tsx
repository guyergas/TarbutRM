import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TransactionsReportClient from "./TransactionsReportClient";

export const metadata = { title: "תנועות – TarbutRM" };

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

export type ReportRow = {
  id: string;          // transactionId + optional menuId suffix for uniqueness
  createdAt: string;
  userFirstName: string;
  userLastName: string;
  direction: "in" | "out";
  amount: number;      // always positive
  menuId: string | null;
  menuName: string | null;
};

export type MenuOption = { id: string; name: string };

export default async function TransactionsReportPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; from?: string; to?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const preset = params.preset ?? "30d";
  const { fromDate, toDate } = getDateRange(preset, params.from ?? null, params.to ?? null);

  const transactions = await prisma.budgetTransaction.findMany({
    where: { createdAt: { gte: fromDate, lte: toDate } },
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        include: {
          items: {
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
            },
          },
        },
      },
    },
  });

  // Resolve user names
  const userIds = [...new Set(transactions.map((t) => t.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, firstName: true, lastName: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  // Collect all menus that appear in order-linked transactions
  const menuMap = new Map<string, string>();

  const rows: ReportRow[] = [];

  for (const tx of transactions) {
    const userName = userMap[tx.userId];
    const firstName = userName?.firstName ?? "";
    const lastName = userName?.lastName ?? "";
    const direction: "in" | "out" = Number(tx.amount) >= 0 ? "in" : "out";
    const absAmount = Math.abs(Number(tx.amount));

    if (tx.order) {
      // Group order items by menu, sum subtotals per menu
      const menuTotals = new Map<string, { name: string; subtotal: number }>();
      for (const oi of tx.order.items) {
        const menu = oi.item.section.menu;
        menuMap.set(menu.id, menu.name);
        const existing = menuTotals.get(menu.id);
        if (existing) {
          existing.subtotal += Number(oi.subtotal);
        } else {
          menuTotals.set(menu.id, { name: menu.name, subtotal: Number(oi.subtotal) });
        }
      }

      // One row per menu in this order
      for (const [menuId, { name, subtotal }] of menuTotals) {
        rows.push({
          id: `${tx.id}__${menuId}`,
          createdAt: tx.createdAt.toISOString(),
          userFirstName: firstName,
          userLastName: lastName,
          direction,
          amount: subtotal,
          menuId,
          menuName: name,
        });
      }
    } else {
      // Non-order transaction (topup, admin credit/debit) — no menu
      rows.push({
        id: tx.id,
        createdAt: tx.createdAt.toISOString(),
        userFirstName: firstName,
        userLastName: lastName,
        direction,
        amount: absAmount,
        menuId: null,
        menuName: null,
      });
    }
  }

  const allMenus: MenuOption[] = Array.from(menuMap.entries()).map(([id, name]) => ({ id, name }));
  const fromStr = fromDate.toISOString().split("T")[0];
  const toStr = toDate.toISOString().split("T")[0];

  return (
    <TransactionsReportClient
      rows={rows}
      allMenus={allMenus}
      fromDate={fromStr}
      toDate={toStr}
      preset={preset}
    />
  );
}
