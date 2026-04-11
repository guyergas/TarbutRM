import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { menuService } from "@/modules/store";

export default async function StorePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Get first visible menu (or all menus if admin)
  const menus =
    session.user.role === "ADMIN"
      ? await menuService.listAll()
      : await menuService.listVisible();

  // Redirect to first menu if exists, otherwise to home
  if (menus.length > 0) {
    redirect(`/store/${menus[0].id}`);
  }

  redirect("/");
}
