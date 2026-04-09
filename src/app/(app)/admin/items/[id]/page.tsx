import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ItemEditorModal from "./ItemEditorModal";
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
    <ItemEditorModal
      item={serializedItem}
      section={serializedSection}
      userId={session.user.id}
    />
  );
}
