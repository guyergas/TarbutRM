"use client";

import { useState, useEffect } from "react";
import OrdersTableClient from "../../orders/OrdersTableClient";
import { notifyOrderCountsUpdated } from "@/hooks/useOrderCounts";

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

export default function StaffOrdersClient({
  orders: initialOrders,
  showCustomerName = true,
  allowStatusAdvance = true,
  isUserView = false,
  initialOpenOrderId,
}: {
  orders: SerializedOrder[];
  showCustomerName?: boolean;
  allowStatusAdvance?: boolean;
  isUserView?: boolean;
  initialOpenOrderId?: string;
}) {
  const [orders, setOrders] = useState(initialOrders);

  // Split orders into active (NEW, IN_PROGRESS) and completed (COMPLETED)
  const activeOrders = orders.filter((order) => order.status === "NEW" || order.status === "IN_PROGRESS");
  const completedOrders = orders.filter((order) => order.status === "COMPLETED");

  // Handle status update by updating the order and letting React re-split sections
  const handleStatusUpdated = (updatedOrder: SerializedOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
  };

  // Notify badge counts when order counts change
  useEffect(() => {
    const openOrdersCount = orders.filter((order) => order.status === "NEW" || order.status === "IN_PROGRESS").length;
    if (isUserView) {
      notifyOrderCountsUpdated({ userOrders: openOrdersCount });
    } else {
      notifyOrderCountsUpdated({ allOrders: openOrdersCount });
    }
  }, [orders, isUserView]);

  return (
    <div className="space-y-8">
      {/* Active Orders Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          הזמנות פעילות
        </h2>
        {activeOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>אין הזמנות פעילות כרגע</p>
          </div>
        ) : (
          <OrdersTableClient
            orders={activeOrders}
            initialOpenOrderId={initialOpenOrderId}
            showCustomerName={showCustomerName}
            allowStatusAdvance={allowStatusAdvance}
            isStaffQueue={true}
            onStatusUpdated={handleStatusUpdated}
          />
        )}
      </div>

      {/* Completed Orders Section */}
      <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          הזמנות הושלמו
        </h2>
        {completedOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>אין הזמנות שהושלמו עדיין</p>
          </div>
        ) : (
          <OrdersTableClient
            orders={completedOrders}
            initialOpenOrderId={undefined}
            showCustomerName={showCustomerName}
            allowStatusAdvance={allowStatusAdvance}
            isStaffQueue={true}
            onStatusUpdated={handleStatusUpdated}
          />
        )}
      </div>
    </div>
  );
}
