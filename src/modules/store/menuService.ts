import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

/**
 * P3-06: List visible (non-archived) menus ordered by position
 */
export async function listVisible() {
  return getPrisma().menu.findMany({
    where: { archived: false },
    orderBy: { position: "asc" },
    include: { sections: { where: { archived: false }, orderBy: { position: "asc" } } },
  });
}

/**
 * P3-07: Get menu with non-archived sections and items (user-facing)
 */
export async function getMenuWithSections(menuId: string) {
  return prisma.menu.findUnique({
    where: { id: menuId },
    include: {
      sections: {
        where: { archived: false },
        orderBy: { position: "asc" },
        include: {
          items: {
            where: { archived: false },
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });
}

/**
 * P3-08: List all menus (archived + visible) - ADMIN only
 */
export async function listAll() {
  return prisma.menu.findMany({
    orderBy: [{ archived: "asc" }, { position: "asc" }],
    include: { sections: { orderBy: { position: "asc" } } },
  });
}

/**
 * P3-09: Create new menu - ADMIN only
 */
export async function create(
  data: { name: string; position?: number },
  actorId: string
) {
  // Get next position if not provided
  const maxPosition = await prisma.menu.aggregate({
    _max: { position: true },
  });
  const position = data.position ?? ((maxPosition._max.position ?? 0) + 1);

  return prisma.menu.create({
    data: {
      name: data.name,
      position,
      archived: false,
      createdBy: actorId,
    },
  });
}

/**
 * P3-10: Update menu name - ADMIN only, cannot edit archived menus
 */
export async function update(
  id: string,
  data: { name: string },
  actorId: string
) {
  const menu = await prisma.menu.findUnique({ where: { id } });
  if (!menu) {
    throw new Error(`Menu ${id} not found`);
  }
  if (menu.archived) {
    throw new Error(`Cannot update archived menu ${id}`);
  }

  return prisma.menu.update({
    where: { id },
    data: { name: data.name, updatedAt: new Date() },
  });
}

/**
 * P3-11: Archive menu (sets archived: true, moves to end by position)
 */
export async function archive(id: string, actorId: string) {
  const menu = await prisma.menu.findUnique({ where: { id } });
  if (!menu) {
    throw new Error(`Menu ${id} not found`);
  }

  // Get current max position for archived menus
  const maxArchivedPosition = await prisma.menu.aggregate({
    _max: { position: true },
    where: { archived: true },
  });
  const newPosition = (maxArchivedPosition._max.position ?? 0) + 1;

  return prisma.menu.update({
    where: { id },
    data: { archived: true, position: newPosition, updatedAt: new Date() },
  });
}

/**
 * P3-12: Reorder menus by ID list - ADMIN only
 * Archived menus stay at end
 */
export async function reorder(orderedIds: string[], actorId: string) {
  const menus = await prisma.menu.findMany({
    where: { id: { in: orderedIds } },
  });

  const archived = menus.filter((m) => m.archived);
  const visible = menus.filter((m) => !m.archived);

  // Sort visible by orderedIds, then add archived at end
  const sorted = [
    ...visible.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id)),
    ...archived.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id)),
  ];

  const updates = sorted.map((menu, idx) =>
    prisma.menu.update({
      where: { id: menu.id },
      data: { position: idx, updatedAt: new Date() },
    })
  );

  return prisma.$transaction(updates);
}
