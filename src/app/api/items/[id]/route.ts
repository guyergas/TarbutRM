import { auth } from "@/lib/auth";
import { getPrismaInstance } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const prisma = getPrismaInstance();
    const { id: itemId } = await params;

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        stockHistory: {
          include: {
            changer: {
              select: {
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { changedAt: "desc" },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({
      item: {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        inStock: item.inStock,
        image: item.image,
        archived: item.archived,
      },
      stockHistory: item.stockHistory,
    });
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}
