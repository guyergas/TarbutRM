"use client";

import { useState } from "react";
import OrdersTableClient from "../../orders/OrdersTableClient";
import { advanceStatusAction } from "../orders/actions";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  itemName: string;
}

interface OrderStatusHistory {
  id: string;
  toStatus: string;
  changedAt: string;
  changedAtTime: string;
  changerName: string;
}

interface SerializedOrder {
  id: string;
  orderNumber: number;
  status: string;
  total: string;
  itemCount: number;
  createdAt: string;
  createdAtFull: string;
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
  customerName?: string;
}

export default function StaffQueueClient({ orders: initialOrders }: { orders: SerializedOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);

  const handleAdvanceStatus = async (orderId: string): Promise<SerializedOrder | null> => {
    try {
      const result = await advanceStatusAction(orderId);

      if (result.success && result.order) {
        // Serialize the updated order
        const items = result.order.items.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice).toFixed(2),
          subtotal: Number(item.subtotal).toFixed(2),
          itemName: item.item?.name || "Unknown Item",
        }));

        const updatedOrder: SerializedOrder = {
          id: result.order.id,
          orderNumber: result.order.orderNumber,
          status: result.order.status,
          total: Number(result.order.total).toFixed(2),
          itemCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
          createdAt: new Date(result.order.createdAt).toLocaleDateString("he-IL"),
          createdAtFull: new Date(result.order.createdAt).toLocaleTimeString("he-IL", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          items,
          statusHistory: result.order.statusHistory.map((history: any) => {
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
          customerName: result.order.user
            ? `${result.order.user.firstName} ${result.order.user.lastName}`
            : "Unknown Customer",
        };

        // Update the orders list
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? updatedOrder : o))
        );

        return updatedOrder;
      }
      return null;
    } catch (error) {
      console.error("Failed to advance status:", error);
      return null;
    }
  };

  return (
    <OrdersTableClient
      orders={orders}
      initialOpenOrderId={undefined}
      showCustomerName={true}
      allowStatusAdvance={true}
      onStatusAdvance={handleAdvanceStatus}
    />
  );
}
