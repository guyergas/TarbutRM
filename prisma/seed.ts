import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user ${email} already exists — skipping seed.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      firstName: "מנהל",
      lastName: "ראשי",
      email,
      passwordHash,
      role: Role.ADMIN,
      city: "רמות מנשה",
      active: true,
    },
  });

  console.log(`Created admin user: ${user.email} (id: ${user.id})`);

  // Phase 3: Create test store structure
  console.log("Seeding Phase 3 test data...");

  // Menu 1: פאב (Pub)
  const pubMenu = await prisma.menu.create({
    data: {
      name: "פאב",
      position: 1,
      archived: false,
      createdBy: user.id,
    },
  });
  console.log(`Created menu: ${pubMenu.name}`);

  // Sections for Pub
  const beersSection = await prisma.section.create({
    data: {
      menuId: pubMenu.id,
      name: "בירות",
      position: 1,
      archived: false,
      createdBy: user.id,
    },
  });

  const cocktailsSection = await prisma.section.create({
    data: {
      menuId: pubMenu.id,
      name: "קוקטליים",
      position: 2,
      archived: false,
      createdBy: user.id,
    },
  });
  console.log(`Created sections: ${beersSection.name}, ${cocktailsSection.name}`);

  // Items in Beers section
  const goldstarItem = await prisma.item.create({
    data: {
      sectionId: beersSection.id,
      name: "גולדסטאר",
      description: "בירה ישראלית קלאסית",
      price: 5,
      inStock: true,
      position: 1,
      archived: false,
      image: "https://upload.wikimedia.org/wikipedia/he/thumb/a/a8/Goldstar_beer_bottle.jpg/220px-Goldstar_beer_bottle.jpg",
      createdBy: user.id,
    },
  });

  await prisma.itemStockHistory.create({
    data: {
      itemId: goldstarItem.id,
      inStock: true,
      changedBy: user.id,
      changedAt: new Date(),
    },
  });

  const coronaItem = await prisma.item.create({
    data: {
      sectionId: beersSection.id,
      name: "קורונה",
      price: 10,
      inStock: true,
      position: 2,
      archived: false,
      createdBy: user.id,
    },
  });

  await prisma.itemStockHistory.create({
    data: {
      itemId: coronaItem.id,
      inStock: true,
      changedBy: user.id,
      changedAt: new Date(),
    },
  });

  // Items in Cocktails section
  const whiskeyItem = await prisma.item.create({
    data: {
      sectionId: cocktailsSection.id,
      name: "וויסקי סאוור",
      price: 20,
      inStock: true,
      position: 1,
      archived: false,
      createdBy: user.id,
    },
  });

  await prisma.itemStockHistory.create({
    data: {
      itemId: whiskeyItem.id,
      inStock: true,
      changedBy: user.id,
      changedAt: new Date(),
    },
  });

  console.log(`Created items: ${goldstarItem.name}, ${coronaItem.name}, ${whiskeyItem.name}`);

  // Menu 2: פורים (Purim) - empty
  const purimMenu = await prisma.menu.create({
    data: {
      name: "פורים",
      position: 2,
      archived: false,
      createdBy: user.id,
    },
  });
  console.log(`Created menu: ${purimMenu.name}`);

  console.log("✓ Phase 3 seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
