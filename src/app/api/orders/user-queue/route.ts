import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { orderService } from "@/modules/order";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await orderService.listUserOrders(session.user.id);

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
      statusHistory: order.statusHistory.map((history) => {
        const changerName = history.changer
          ? `${history.changer.firstName} ${history.changer.lastName}`
          : "Unknown";
        return {
          id: history.id,
          toStatus: history.toStatus,
          changedAt: new Date(history.changedAt).toLocaleDateString("he-IL"),
          changedAtTime: new Date(history.changedAt).toLocaleTimeString("he-IL", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          changerName,
        };
      }),
    };
  });

  return NextResponse.json(serializedOrders);
}
