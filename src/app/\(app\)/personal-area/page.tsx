import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { orderService } from "@/modules/order";
import PersonalAreaClient from "./PersonalAreaClient";

export const metadata = { title: "האזור האישי — TarbutRM" };

export default async function PersonalAreaPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch user, transactions, and orders in parallel
  const [user, transactions, orders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        balance: true,
        city: true,
        phone: true,
        street: true,
        createdAt: true,
      },
    }),
    prisma.budgetTransaction.findMany({
      where: { userId },
      include: {
        // Note: can't include createdBy user directly, so we'll fetch separately
      },
      orderBy: { createdAt: "desc" },
    }),
    orderService.listUserOrders(userId),
  ]);

  if (!user) {
    redirect("/login");
  }

  // Fetch creators of transactions for display
  const creatorIds = [...new Set(transactions.map((t) => t.createdBy))];
  const creators = await prisma.user.findMany({
    where: { id: { in: creatorIds } },
    select: { id: true, firstName: true, lastName: true, role: true },
  });
  const creatorMap = Object.fromEntries(creators.map((c) => [c.id, c]));

  // Serialize data for client component
  const serializedUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    balance: Number(user.balance).toFixed(2),
    city: user.city,
    phone: user.phone,
    street: user.street,
    createdAt: user.createdAt.toISOString(),
  };

  const serializedTransactions = transactions.map((tx) => ({
    id: tx.id,
    userId: tx.userId,
    amount: Number(tx.amount).toFixed(2),
    note: tx.note,
    createdBy: tx.createdBy,
    createdAt: tx.createdAt.toISOString(),
    creatorName: creatorMap[tx.createdBy]
      ? `${creatorMap[tx.createdBy].firstName} ${creatorMap[tx.createdBy].lastName}`
      : "מערכת",
    creatorRole: creatorMap[tx.createdBy]?.role,
  }));

  const serializedOrders = orders.map((order) => {
    const items = order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice).toFixed(2),
      subtotal: Number(item.subtotal).toFixed(2),
      itemName: item.item?.name || "Unknown Item",
    }));

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: Number(order.total).toFixed(2),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: new Date(order.createdAt).toLocaleDateString("he-IL"),
      createdAtFull: new Date(order.createdAt).toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      items,
    };
  });

  return (
    <PersonalAreaClient
      user={serializedUser}
      transactions={serializedTransactions}
      orders={serializedOrders}
    />
  );
}
