import { getPrismaInstance } from "@/lib/prisma";

/**
 * Create an order from cart items
 * Atomically: validates items, checks balance, debits wallet, creates order + items
 */
export async function createOrder(
  userId: string,
  itemsInCart: Array<{ itemId: string; quantity: number }>
) {
  const prisma = getPrismaInstance();

  // Validate cart items exist and get prices
  const items = await prisma.item.findMany({
    where: { id: { in: itemsInCart.map((x) => x.itemId) } },
  });

  if (items.length !== itemsInCart.length) {
    throw new Error("Some items not found or archived");
  }

  // Archived items cannot be ordered
  const archivedItem = items.find((item) => item.archived);
  if (archivedItem) {
    throw new Error(`Item "${archivedItem.name}" is no longer available`);
  }

  // Calculate total
  const cartMap = new Map(itemsInCart.map((x) => [x.itemId, x.quantity]));
  const total = items.reduce((sum, item) => {
    const qty = cartMap.get(item.id)!;
    return sum + Number(item.price) * qty;
  }, 0);

  // Check balance
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { balance: true },
  });

  if (!user || Number(user.balance) < total) {
    throw new Error("Insufficient balance");
  }

  // Atomic transaction: debit balance + create order + items + history
  const order = await prisma.$transaction(async (tx) => {
    // Debit wallet
    await tx.budgetTransaction.create({
      data: {
        userId,
        amount: -total,
        note: "Order created",
        createdBy: userId,
      },
    });

    // Update user balance
    await tx.user.update({
      where: { id: userId },
      data: { balance: { decrement: total } },
    });

    // Create order
    const newOrder = await tx.order.create({
      data: {
        userId,
        total: total,
        status: "NEW",
        items: {
          createMany: {
            data: itemsInCart.map((cartItem) => {
              const item = items.find((i) => i.id === cartItem.itemId)!;
              const subtotal = Number(item.price) * cartItem.quantity;
              return {
                itemId: cartItem.itemId,
                quantity: cartItem.quantity,
                unitPrice: item.price,
                subtotal: subtotal,
              };
            }),
          },
        },
      },
      include: {
        items: {
          include: {
            item: true,
          },
        },
        statusHistory: {
          include: {
            changer: true,
          },
        },
      },
    });

    // Create initial status history entry
    await tx.orderStatusHistory.create({
      data: {
        orderId: newOrder.id,
        fromStatus: null,
        toStatus: "NEW",
        changedBy: userId,
      },
    });

    return newOrder;
  });

  return order;
}

/**
 * Get a single order with full details
 */
export async function getOrder(orderId: string) {
  const prisma = getPrismaInstance();

  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      items: {
        include: {
          item: true,
        },
      },
      statusHistory: {
        include: {
          changer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: { changedAt: "asc" },
      },
    },
  });
}

/**
 * List all orders for a user
 */
export async function listUserOrders(userId: string) {
  const prisma = getPrismaInstance();

  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          item: true,
        },
      },
      statusHistory: {
        include: {
          changer: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * List NEW and IN_PROGRESS orders for staff queue
 */
export async function listStaffQueue() {
  const prisma = getPrismaInstance();

  return prisma.order.findMany({
    where: {
      status: {
        in: ["NEW", "IN_PROGRESS"],
      },
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      items: {
        include: {
          item: true,
        },
      },
      statusHistory: {
        include: {
          changer: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Advance order status to next state
 * NEW → IN_PROGRESS → COMPLETED
 * Requires STAFF or ADMIN role (validation done at action layer)
 */
export async function advanceStatus(orderId: string, actorId: string) {
  const prisma = getPrismaInstance();

  // Fetch current order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      statusHistory: {
        include: {
          changer: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Validate current status and determine next status
  if (order.status === "COMPLETED") {
    throw new Error("Cannot advance from COMPLETED status");
  }

  const nextStatus = order.status === "NEW" ? "IN_PROGRESS" : "COMPLETED";

  // Atomic transaction: update status + create history
  const updatedOrder = await prisma.$transaction(async (tx) => {
    // Update order status
    await tx.order.update({
      where: { id: orderId },
      data: { status: nextStatus },
    });

    // Create status history entry
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: nextStatus,
        changedBy: actorId,
      },
    });

    // Return updated order with full details
    return tx.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          include: {
            item: true,
          },
        },
        statusHistory: {
          include: {
            changer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { changedAt: "asc" },
        },
      },
    });
  });

  return updatedOrder;
}
