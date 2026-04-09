import { auth } from "@/lib/auth";
import StoreView from "./StoreView";
import { redirect } from "next/navigation";
import { menuService } from "@/modules/store";

export default async function StorePage({ params }: { params: { menuId: string } }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch menu with sections and items
  const menu = await menuService.getMenuWithSections(params.menuId);

  if (!menu) {
    redirect("/");
  }

  // Fetch all visible menus for nav
  const allMenus = await menuService.listVisible();

  return (
    <StoreView
      currentMenu={menu}
      allMenus={allMenus}
      userRole={session.user.role as "USER" | "STAFF" | "ADMIN"}
      userId={session.user.id}
    />
  );
}
