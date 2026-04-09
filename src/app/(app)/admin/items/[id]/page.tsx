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
    },
  });

  if (!item) {
    redirect("/");
  }

  // Serialize Decimal to string for client component
  const serializedItem = {
    ...item,
    price: item.price.toString(),
    description: item.description || undefined,
    image: item.image || undefined,
  };

  const serializedSection = {
    ...item.section,
    menu: {
      id: item.section.menu.id,
      name: item.section.menu.name,
    },
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 24,
          maxWidth: 600,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h1 style={{ margin: "0 0 24px 0", fontSize: 28, fontWeight: 700, color: "#1f2937" }}>
          עריכת מוצר
        </h1>

        <ItemEditor
          item={serializedItem}
          section={serializedSection}
          userId={session.user.id}
          onClose={() => {
            if (typeof window !== 'undefined') {
              window.history.back();
            }
          }}
        />
      </div>
    </div>
  );
}
