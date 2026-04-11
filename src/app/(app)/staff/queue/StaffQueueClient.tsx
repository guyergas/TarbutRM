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
  // Split orders into active (NEW, IN_PROGRESS) and completed (COMPLETED)
  const activeOrders = orders.filter((order) => order.status === "NEW" || order.status === "IN_PROGRESS");
  const completedOrders = orders.filter((order) => order.status === "COMPLETED");

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
            initialOpenOrderId={undefined}
            showCustomerName={true}
            allowStatusAdvance={true}
            isStaffQueue={true}
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
            showCustomerName={true}
            allowStatusAdvance={true}
            isStaffQueue={true}
          />
        )}
      </div>
    </div>
  );
}
