import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ItemEditor from "./ItemEditor";
import { getPrismaInstance } from "@/lib/prisma";

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;
  const prisma = getPrismaInstance();

  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      section: {
        include: { menu: true },
      },
      stockHistory: {
        orderBy: { changedAt: "desc" },
        include: { changer: true },
      },
    },
  });

  if (!item) {
    redirect("/");
  }

  // Fetch all sections for duplicate dropdown
  const sections = await prisma.section.findMany({
    where: { archived: false },
    orderBy: [{ menu: { position: "asc" } }, { position: "asc" }],
    include: { menu: true },
  });

  // Serialize Decimal to string for client component
  const serializedItem = {
    ...item,
    price: item.price.toString(),
  };

  const serializedStockHistory = item.stockHistory.map((h) => ({
    ...h,
    changedAt: h.changedAt.toISOString(),
  }));

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <a
          href={`/store/${item.section.menuId}`}
          style={{
            color: "#3b82f6",
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          ← חזור
        </a>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
          עריכת מוצר
        </h1>
      </div>

      <ItemEditor
        item={serializedItem}
        section={item.section}
        stockHistory={serializedStockHistory}
        sections={sections}
        userId={session.user.id}
      />
    </div>
  );
}
