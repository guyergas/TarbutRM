"use client";

import OrdersTableClient from "../../orders/OrdersTableClient";

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

export default function StaffQueueClient({ orders }: { orders: SerializedOrder[] }) {
  return (
    <OrdersTableClient
      orders={orders}
      initialOpenOrderId={undefined}
      showCustomerName={true}
    />
  );
}
