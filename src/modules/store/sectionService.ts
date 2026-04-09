import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

/**
 * P3-13: Create new section in menu - ADMIN only
 */
export async function create(
  menuId: string,
  data: { name: string; position?: number },
  actorId: string
) {
  // Verify menu exists
  const menu = await getPrisma().menu.findUnique({ where: { id: menuId } });
  if (!menu) {
    throw new Error(`Menu ${menuId} not found`);
  }

  // Get next position if not provided
  const maxPosition = await getPrisma().section.aggregate({
    _max: { position: true },
    where: { menuId },
  });
  const position = data.position ?? ((maxPosition._max.position ?? 0) + 1);

  return getPrisma().section.create({
    data: {
      menuId,
      name: data.name,
      position,
      archived: false,
      createdBy: actorId,
    },
  });
}

/**
 * P3-14: Update section name - ADMIN only, cannot edit archived sections
 */
export async function update(
  id: string,
  data: { name: string },
  actorId: string
) {
  const section = await getPrisma().section.findUnique({ where: { id } });
  if (!section) {
    throw new Error(`Section ${id} not found`);
  }
  if (section.archived) {
    throw new Error(`Cannot update archived section ${id}`);
  }

  return getPrisma().section.update({
    where: { id },
    data: { name: data.name, updatedAt: new Date() },
  });
}

/**
 * P3-15: Archive section (sets archived: true, moves to end by position)
 */
export async function archive(id: string, actorId: string) {
  const section = await getPrisma().section.findUnique({ where: { id } });
  if (!section) {
    throw new Error(`Section ${id} not found`);
  }

  // Get current max position for archived sections in same menu
  const maxArchivedPosition = await getPrisma().section.aggregate({
    _max: { position: true },
    where: { menuId: section.menuId, archived: true },
  });
  const newPosition = (maxArchivedPosition._max.position ?? 0) + 1;

  return getPrisma().section.update({
    where: { id },
    data: { archived: true, position: newPosition, updatedAt: new Date() },
  });
}

/**
 * P3-16: Reorder sections within a menu - ADMIN only
 * Archived sections stay at end
 */
export async function reorder(
  menuId: string,
  orderedIds: string[],
  actorId: string
) {
  const sections = await getPrisma().section.findMany({
    where: { menuId, id: { in: orderedIds } },
  });

  const archived = sections.filter((s) => s.archived);
  const visible = sections.filter((s) => !s.archived);

  // Sort visible by orderedIds, then add archived at end
  const sorted = [
    ...visible.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id)),
    ...archived.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id)),
  ];

  const updates = sorted.map((section, idx) =>
    getPrisma().section.update({
      where: { id: section.id },
      data: { position: idx, updatedAt: new Date() },
    })
  );

  return getPrisma().$transaction(updates);
}
