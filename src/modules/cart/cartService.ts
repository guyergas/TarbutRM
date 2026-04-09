import { getPrismaInstance } from "@/lib/prisma";

/**
 * Add item to cart or increment quantity if already exists
 */
export async function addToCart(
  userId: string,
  itemId: string,
  quantity: number = 1
) {
  const prisma = getPrismaInstance();

  // Verify item exists and is not archived
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) {
    throw new Error(`Item ${itemId} not found`);
  }
  if (item.archived) {
    throw new Error(`Item ${itemId} is no longer available`);
  }

  // Check if item already in cart
  const existing = await prisma.cartItem.findUnique({
    where: { userId_itemId: { userId, itemId } },
  });

  if (existing) {
    // Increment quantity
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity, updatedAt: new Date() },
      include: { item: true },
    });
  } else {
    // Create new cart item
    return prisma.cartItem.create({
      data: { userId, itemId, quantity },
      include: { item: true },
    });
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(userId: string, itemId: string) {
  const prisma = getPrismaInstance();

  const cartItem = await prisma.cartItem.findUnique({
    where: { userId_itemId: { userId, itemId } },
  });

  if (!cartItem) {
    throw new Error(`Item not in cart`);
  }

  return prisma.cartItem.delete({
    where: { id: cartItem.id },
  });
}

/**
 * Update quantity of item in cart
 */
export async function updateQuantity(
  userId: string,
  itemId: string,
  quantity: number
) {
  const prisma = getPrismaInstance();

  if (quantity <= 0) {
    return removeFromCart(userId, itemId);
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { userId_itemId: { userId, itemId } },
  });

  if (!cartItem) {
    throw new Error(`Item not in cart`);
  }

  return prisma.cartItem.update({
    where: { id: cartItem.id },
    data: { quantity, updatedAt: new Date() },
    include: { item: true },
  });
}

/**
 * Get all cart items for user with full item details
 * Warns about archived items but includes them
 */
export async function getCart(userId: string) {
  const prisma = getPrismaInstance();

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      item: {
        include: {
          section: {
            include: { menu: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Check for archived items
  const archivedItems = cartItems.filter((ci) => ci.item.archived);
  const warnings = archivedItems.map((ci) => ({
    itemId: ci.itemId,
    itemName: ci.item.name,
    message: "Item is no longer available",
  }));

  return { cartItems, warnings };
}

/**
 * Clear all items from cart
 */
export async function clearCart(userId: string) {
  const prisma = getPrismaInstance();

  return prisma.cartItem.deleteMany({
    where: { userId },
  });
}

/**
 * Get cart summary with pricing
 */
export async function getCartSummary(userId: string) {
  const prisma = getPrismaInstance();

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { item: true },
  });

  const items = cartItems.map((ci) => {
    const price = Number(ci.item.price);
    const cost = price * ci.quantity;
    return {
      cartItemId: ci.id,
      itemId: ci.itemId,
      name: ci.item.name,
      price,
      quantity: ci.quantity,
      cost,
      archived: ci.item.archived,
      description: ci.item.description || undefined,
      image: ci.item.image || undefined,
    };
  });

  const totalCost = items.reduce((sum, item) => sum + item.cost, 0);

  return { items, totalCost, itemCount: cartItems.length };
}
