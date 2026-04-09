import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import StoreView from "./StoreView";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export default async function StorePage({ params }: { params: { menuId: string } }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch menu with sections and items
  const menu = await prisma.menu.findUnique({
    where: { id: params.menuId },
    include: {
      sections: {
        where: { archived: false },
        orderBy: { position: "asc" },
        include: {
          items: {
            where: { archived: false },
            orderBy: { position: "asc" },
            include: {
              stockHistory: {
                orderBy: { changedAt: "desc" },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!menu) {
    redirect("/");
  }

  // Fetch all visible menus for nav
  const allMenus = await prisma.menu.findMany({
    where: { archived: false },
    orderBy: { position: "asc" },
  });

  return (
    <StoreView
      currentMenu={menu}
      allMenus={allMenus}
      userRole={session.user.role as "USER" | "STAFF" | "ADMIN"}
      userId={session.user.id}
    />
  );
}
