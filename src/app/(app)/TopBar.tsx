import { menuService } from "@/modules/store";
import TopBarClient from "./TopBarClient";

type Role = "USER" | "STAFF" | "ADMIN";

export default async function TopBar({ role }: { role?: Role }) {
  const menus = await menuService.listVisible();

  return <TopBarClient role={role} menus={menus} />;
}
