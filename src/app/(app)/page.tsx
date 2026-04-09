import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

export const metadata = { title: "בית — TarbutRM" };

const prisma = new PrismaClient();

export default async function HomePage() {
  // Find first visible menu by position
  const defaultMenu = await prisma.menu.findFirst({
    where: { archived: false },
    orderBy: { position: "asc" },
  });

  if (defaultMenu) {
    redirect(`/store/${defaultMenu.id}`);
  }

  // No visible menus - show placeholder
  return (
    <div style={{ textAlign: "center", padding: "64px 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        אין חנויות זמינות
      </h1>
      <p style={{ color: "#6b7280", fontSize: 16 }}>
        נא לחזור מאוחר יותר
      </p>
    </div>
  );
}
