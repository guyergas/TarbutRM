import { auth } from "@/lib/auth";
import StoreView from "./StoreView";
import { redirect } from "next/navigation";
import { menuService } from "@/modules/store";

export default async function StorePage({ params }: { params: Promise<{ menuId: string }> }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { menuId } = await params;

  // Fetch menu with sections and items
  const menu = await menuService.getMenuWithSections(menuId);

  if (!menu) {
    redirect("/");
  }

  // Fetch all visible menus for nav
  const allMenus = await menuService.listVisible();

  // Serialize Decimal to string for client component
  const serializedMenu = {
    ...menu,
    sections: menu.sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        price: item.price.toString(),
      })),
    })),
  };

  const serializedMenus = allMenus.map((m) => ({
    ...m,
    sections: m.sections?.map((s) => ({
      ...s,
      items: s.items?.map((i) => ({
        ...i,
        price: i.price?.toString() || "0",
      })) || [],
    })) || [],
  }));

  return (
    <StoreView
      currentMenu={serializedMenu}
      allMenus={serializedMenus}
      userRole={session.user.role as "USER" | "STAFF" | "ADMIN"}
      userId={session.user.id}
    />
  );
}
