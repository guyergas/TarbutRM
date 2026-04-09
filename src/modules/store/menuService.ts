import { getPrismaInstance } from "@/lib/prisma";

/**
 * P3-06: List visible (non-archived) menus ordered by position
 */
export async function listVisible() {
  const prisma = getPrismaInstance();
  return prisma.menu.findMany({
    where: { archived: false },
    orderBy: { position: "asc" },
    include: { sections: { where: { archived: false }, orderBy: { position: "asc" } } },
  });
}

/**
 * P3-07: Get menu with non-archived sections and items (user-facing)
 */
export async function getMenuWithSections(menuId: string) {
  const prisma = getPrismaInstance();
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
  const prisma = getPrismaInstance();
  return prisma.menu.findMany({
    orderBy: [{ archived: "asc" }, { position: "asc" }],
    include: {
      sections: {
        orderBy: { position: "asc" },
        include: { items: { orderBy: { position: "asc" } } },
      },
    },
  });
}

/**
 * P3-09: Create new menu - ADMIN only
 */
export async function create(
  data: { name: string; position?: number },
  actorId: string
) {
  const prisma = getPrismaInstance();

  if (!actorId || typeof actorId !== "string" || actorId.trim() === "") {
    throw new Error("Invalid actor ID: user not properly authenticated");
  }

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
  const prisma = getPrismaInstance();
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
 * P3-11: Archive menu (sets archived: true, moves to beginning by position)
 */
export async function archive(id: string, actorId: string) {
  const prisma = getPrismaInstance();
  const menu = await prisma.menu.findUnique({ where: { id } });
  if (!menu) {
    throw new Error(`Menu ${id} not found`);
  }

  if (menu.archived) {
    // Unarchive: move to end of non-archived menus
    const maxPosition = await prisma.menu.aggregate({
      _max: { position: true },
      where: { archived: false },
    });
    const newPosition = (maxPosition._max.position ?? 0) + 1;

    return prisma.menu.update({
      where: { id },
      data: { archived: false, position: newPosition, updatedAt: new Date() },
    });
  } else {
    // Archive: move to beginning
    const minArchivedPosition = await prisma.menu.aggregate({
      _min: { position: true },
      where: { archived: true },
    });
    const newPosition = (minArchivedPosition._min.position ?? 0) - 1;

    return prisma.menu.update({
      where: { id },
      data: { archived: true, position: newPosition, updatedAt: new Date() },
    });
  }
}

/**
 * P3-12: Reorder menus by ID list - ADMIN only
 * Archived menus stay at end
 */
export async function reorder(orderedIds: string[], actorId: string) {
  const prisma = getPrismaInstance();
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
