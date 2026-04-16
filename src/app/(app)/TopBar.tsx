import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { menuService } from "@/modules/store";
import { cartService } from "@/modules/cart";
import { prisma } from "@/lib/prisma";
import TopBarClient from "./TopBarClient";
import CartIcon from "./CartIcon";

type Role = "USER" | "STAFF" | "ADMIN";

export default async function TopBar({ role }: { role?: Role }) {
  const session = await auth();
  const menus = await menuService.listVisible();

  let balance: string | null = null;
  let tutorialViewed = true;
  let cartItemCount = 0;
  let openOrdersCount = 0;
  let allOpenOrdersCount = 0;
  let openMessagesCount = 0;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true, tutorialViewed: true },
    });
    balance = user?.balance.toString() ?? null;
    tutorialViewed = user?.tutorialViewed ?? true;

    const cart = await cartService.getCartSummary(session.user.id);
    cartItemCount = cart.itemCount;

    // Count open orders (NEW or IN_PROGRESS)
    const openOrders = await prisma.order.count({
      where: {
        userId: session.user.id,
        status: { in: ["NEW", "IN_PROGRESS"] },
      },
    });
    openOrdersCount = openOrders;
  }

  // Count all open orders in the system (for staff queue badge)
  const allOpenOrders = await prisma.order.count({
    where: {
      status: { in: ["NEW", "IN_PROGRESS"] },
    },
  });
  allOpenOrdersCount = allOpenOrders;

  // Count open messages (for admin badge)
  if (session?.user?.role === "ADMIN") {
    const openMessages = await prisma.contactMessage.count({
      where: { status: "OPEN" },
    });
    openMessagesCount = openMessages;
  }

  const userRole = role || (session?.user?.role as Role) || "USER";

  return (
    <TopBarClient
      role={role}
      menus={menus}
      balance={balance}
      userId={session?.user?.id}
      tutorialViewed={tutorialViewed}
      cartIcon={<CartIcon initialCount={cartItemCount} userRole={userRole} userBalance={balance} />}
      openOrdersCount={openOrdersCount}
      allOpenOrdersCount={allOpenOrdersCount}
      openMessagesCount={openMessagesCount}
    />
  );
}
