import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { menuService } from "@/modules/store";

export const metadata = { title: "בית — TarbutRM" };

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Find first visible menu by position
  const menus = await menuService.listVisible();
  const defaultMenu = menus[0];

  if (defaultMenu) {
    redirect(`/store/${defaultMenu.id}`);
  }

  // No visible menus - show placeholder
  return (
    <div style={{ textAlign: "center", padding: "64px 16px" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>
        אין חנויות זמינות
      </h1>
      <p style={{ color: "#6b7280", fontSize: 16 }}>
        נא לחזור מאוחר יותר
      </p>
    </div>
  );
}
