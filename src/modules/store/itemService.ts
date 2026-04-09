import { getPrismaInstance } from "@/lib/prisma";

/**
 * P3-17: Create new item in section - ADMIN only
 * Appends to end of section, sets initial stock history (inStock=true)
 */
export async function create(
  sectionId: string,
  data: {
    name: string;
    description?: string;
    price: number;
    image?: string;
    position?: number;
  },
  actorId: string
) {
  const prisma = getPrismaInstance();

  if (!actorId || typeof actorId !== "string" || actorId.trim() === "") {
    throw new Error("Invalid actor ID: user not properly authenticated");
  }

  // Verify section exists
  const section = await prisma.section.findUnique({ where: { id: sectionId } });
  if (!section) {
    throw new Error(`Section ${sectionId} not found`);
  }

  // Get next position if not provided
  const maxPosition = await prisma.item.aggregate({
    _max: { position: true },
    where: { sectionId },
  });
  const position = data.position ?? ((maxPosition._max.position ?? 0) + 1);

  // Create item and initial stock history atomically
  return prisma.$transaction(async (tx) => {
    const item = await tx.item.create({
      data: {
        sectionId,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        position,
        inStock: true,
        archived: false,
        createdBy: actorId,
      },
    });

    // Create initial stock history
    await tx.itemStockHistory.create({
      data: {
        itemId: item.id,
        inStock: true,
        changedBy: actorId,
        changedAt: new Date(),
      },
    });

    return item;
  });
}

/**
 * P3-18: Update item (name/desc/price/image) - ADMIN only, cannot edit archived items
 */
export async function update(
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    image?: string;
  },
  actorId: string
) {
  const prisma = getPrismaInstance();
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) {
    throw new Error(`Item ${id} not found`);
  }
  if (item.archived) {
    throw new Error(`Cannot update archived item ${id}`);
  }

  return prisma.item.update({
    where: { id },
    data: {
      name: data.name ?? item.name,
      description: data.description ?? item.description,
      price: data.price ?? item.price,
      image: data.image ?? item.image,
      updatedAt: new Date(),
    },
  });
}

/**
 * P3-19: Archive item (sets archived: true, moves to end by position)
 */
export async function archive(id: string, actorId: string) {
  const prisma = getPrismaInstance();
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) {
    throw new Error(`Item ${id} not found`);
  }

  // Get current max position for archived items in same section
  const maxArchivedPosition = await prisma.item.aggregate({
    _max: { position: true },
    where: { sectionId: item.sectionId, archived: true },
  });
  const newPosition = (maxArchivedPosition._max.position ?? 0) + 1;

  return prisma.item.update({
    where: { id },
    data: { archived: true, position: newPosition, updatedAt: new Date() },
  });
}

/**
 * P3-20: Set item stock status - ADMIN or STAFF
 * Atomic: update item.inStock and create ItemStockHistory record
 */
export async function setStock(
  id: string,
  inStock: boolean,
  actorId: string
) {
  const prisma = getPrismaInstance();

  if (!actorId || typeof actorId !== "string" || actorId.trim() === "") {
    throw new Error("Invalid actor ID: user not properly authenticated");
  }

  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) {
    throw new Error(`Item ${id} not found`);
  }

  return prisma.$transaction(async (tx) => {
    // Update item stock
    const updated = await tx.item.update({
      where: { id },
      data: { inStock, updatedAt: new Date() },
    });

    // Create stock history record
    await tx.itemStockHistory.create({
      data: {
        itemId: id,
        inStock,
        changedBy: actorId,
        changedAt: new Date(),
      },
    });

    return updated;
  });
}

/**
 * P3-21: Duplicate item to target section - ADMIN only
 * Rejects if source archived, sets initial stock history (inStock=true)
 */
export async function duplicate(
  id: string,
  targetSectionId: string,
  actorId: string
) {
  const prisma = getPrismaInstance();

  if (!actorId || typeof actorId !== "string" || actorId.trim() === "") {
    throw new Error("Invalid actor ID: user not properly authenticated");
  }

  const source = await prisma.item.findUnique({ where: { id } });
  if (!source) {
    throw new Error(`Item ${id} not found`);
  }
  if (source.archived) {
    throw new Error(`Cannot duplicate archived item ${id}`);
  }

  // Verify target section exists
  const targetSection = await prisma.section.findUnique({
    where: { id: targetSectionId },
  });
  if (!targetSection) {
    throw new Error(`Section ${targetSectionId} not found`);
  }

  // Get next position in target section
  const maxPosition = await prisma.item.aggregate({
    _max: { position: true },
    where: { sectionId: targetSectionId },
  });
  const position = (maxPosition._max.position ?? 0) + 1;

  // Create duplicate and initial stock history atomically
  return prisma.$transaction(async (tx) => {
    const duplicate = await tx.item.create({
      data: {
        sectionId: targetSectionId,
        name: source.name,
        description: source.description,
        price: source.price,
        image: source.image,
        position,
        inStock: true,
        archived: false,
        createdBy: actorId,
      },
    });

    // Create initial stock history
    await tx.itemStockHistory.create({
      data: {
        itemId: duplicate.id,
        inStock: true,
        changedBy: actorId,
        changedAt: new Date(),
      },
    });

    return duplicate;
  });
}

/**
 * P3-22: Reorder items within a section - ADMIN only
 * Archived items stay at end
 */
export async function reorder(
  sectionId: string,
  orderedIds: string[],
  actorId: string
) {
  const prisma = getPrismaInstance();
  const items = await prisma.item.findMany({
    where: { sectionId, id: { in: orderedIds } },
  });

  const archived = items.filter((i) => i.archived);
  const visible = items.filter((i) => !i.archived);

  // Sort visible by orderedIds, then add archived at end
  const sorted = [
    ...visible.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id)),
    ...archived.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id)),
  ];

  const updates = sorted.map((item, idx) =>
    prisma.item.update({
      where: { id: item.id },
      data: { position: idx, updatedAt: new Date() },
    })
  );

  return prisma.$transaction(updates);
}
