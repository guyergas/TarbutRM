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
  const menus = await menuService.listVisibleWithSections();

  let balance: string | null = null;
  let cartItemCount = 0;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true },
    });
    balance = user?.balance.toString() ?? null;

    const cart = await cartService.getCartSummary(session.user.id);
    cartItemCount = cart.itemCount;
  }

  return (
    <TopBarClient
      role={role}
      menus={menus}
      balance={balance}
      cartIcon={<CartIcon initialCount={cartItemCount} />}
    />
  );
}
