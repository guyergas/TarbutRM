import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { orderService } from "@/modules/order";
import StaffQueueClient from "./StaffQueueClient";

export default async function StaffQueuePage() {
  const session = await auth();

  // Verify user is authenticated and has STAFF or ADMIN role
  if (!session?.user?.id || (session.user.role !== "STAFF" && session.user.role !== "ADMIN")) {
    redirect("/");
  }

  const orders = await orderService.listStaffQueue();

  // Serialize orders to plain objects (Decimal → string, Date → ISO string)
  const serializedOrders = orders.map((order) => {
    const items = order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice).toFixed(2),
      subtotal: Number(item.subtotal).toFixed(2),
      itemName: item.item?.name || "Unknown Item",
    }));

    const customerName = order.user
      ? `${order.user.firstName} ${order.user.lastName}`
      : "Unknown Customer";

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: Number(order.total).toFixed(2),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      customerName,
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">תור ההזמנות</h1>
      <StaffQueueClient orders={serializedOrders} />
    </div>
  );
}
