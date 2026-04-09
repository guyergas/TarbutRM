"use server";

import { auth } from "@/lib/auth";
import { cartService } from "@/modules/cart";

export async function addToCartAction(itemId: string, quantity: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return cartService.addToCart(session.user.id, itemId, quantity);
}

export async function removeFromCartAction(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return cartService.removeFromCart(session.user.id, itemId);
}

export async function updateQuantityAction(
  itemId: string,
  quantity: number
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return cartService.updateQuantity(session.user.id, itemId, quantity);
}

export async function clearCartAction() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return cartService.clearCart(session.user.id);
}
