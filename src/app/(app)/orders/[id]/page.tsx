import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { orderService } from "@/modules/order";
import Link from "next/link";
import StaffOrdersClient from "../staff/orders/StaffOrdersClient";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const orders = await orderService.listUserOrders(session.user.id);

  // Verify user owns the requested order
  const requestedOrder = orders.find((o) => o.id === id);
  if (!requestedOrder) {
    redirect("/orders");
  }

  // Serialize orders to plain objects (Decimal → string, Date → ISO string)
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">ההזמנות שלי</h1>

      {serializedOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="mb-4">אין לך הזמנות עדיין</p>
          <Link href="/store" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300">
            לחזור לחנות
          </Link>
        </div>
      ) : (
        <StaffOrdersClient orders={serializedOrders} initialOpenOrderId={id} showCustomerName={false} allowStatusAdvance={true} isUserView={true} />
      )}
    </div>
  );
}
