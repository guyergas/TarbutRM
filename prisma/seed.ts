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

  // Get or create admin user
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const passwordHash = await bcrypt.hash(password, 12);
    user = await prisma.user.create({
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
  } else {
    console.log(`Admin user ${email} already exists.`);
  }

  // Phase 3: Create test store structure
  console.log("Seeding Phase 3 test data...");

  // Check if store data already exists
  const existingMenuCount = await prisma.menu.count();
  const shouldSeedStore = existingMenuCount === 0;

  let goldstarItem: any, coronaItem: any, whiskeyItem: any;

  if (shouldSeedStore) {
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
    goldstarItem = await prisma.item.create({
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

    const coronaItemTemp = await prisma.item.create({
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
    coronaItem = coronaItemTemp;

    await prisma.itemStockHistory.create({
      data: {
        itemId: coronaItem.id,
        inStock: true,
        changedBy: user.id,
        changedAt: new Date(),
      },
    });

    // Items in Cocktails section
    whiskeyItem = await prisma.item.create({
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
  } else {
    console.log("Store data already seeded, skipping...");
    // Still need to fetch items for order creation
    const items = await prisma.item.findMany({
      where: { name: { in: ["גולדסטאר", "קורונה", "וויסקי סאוור"] } },
    });
    goldstarItem = items.find((i) => i.name === "גולדסטאר");
    coronaItem = items.find((i) => i.name === "קורונה");
    whiskeyItem = items.find((i) => i.name === "וויסקי סאוור");
  }

  // Create test users and orders for staff queue testing
  console.log("\nSeeding test users and orders...");

  // Create STAFF user
  let staffUser = await prisma.user.findUnique({ where: { email: "staff@example.com" } });
  if (!staffUser) {
    const staffPasswordHash = await bcrypt.hash("staffpass123", 12);
    staffUser = await prisma.user.create({
      data: {
        firstName: "עמיר",
        lastName: "הצוות",
        email: "staff@example.com",
        passwordHash: staffPasswordHash,
        role: Role.STAFF,
        city: "רמות מנשה",
        active: true,
        balance: 0,
      },
    });
    console.log(`Created STAFF user: ${staffUser.email}`);
  }

  // Create regular USER
  let regularUser = await prisma.user.findUnique({ where: { email: "user@example.com" } });
  if (!regularUser) {
    const userPasswordHash = await bcrypt.hash("userpass123", 12);
    regularUser = await prisma.user.create({
      data: {
        firstName: "דוד",
        lastName: "לקוח",
        email: "user@example.com",
        passwordHash: userPasswordHash,
        role: Role.USER,
        city: "רמות מנשה",
        active: true,
        balance: 200, // Start with 200 NIS
      },
    });
    console.log(`Created regular USER: ${regularUser.email} (balance: ₪200)`);
  } else {
    // Update balance if user exists
    if (Number(regularUser.balance) < 200) {
      regularUser = await prisma.user.update({
        where: { id: regularUser.id },
        data: { balance: 200 },
      });
      console.log(`Updated USER balance to ₪200`);
    }
  }

  // Create test order from regular user
  const existingOrder = await prisma.order.findFirst({
    where: { userId: regularUser.id },
  });

  if (!existingOrder && goldstarItem && coronaItem) {
    // Create order with goldstar + corona
    const testOrder = await prisma.order.create({
      data: {
        userId: regularUser.id,
        status: "NEW",
        total: 15, // 5 + 10
        items: {
          createMany: {
            data: [
              {
                itemId: goldstarItem.id,
                quantity: 1,
                unitPrice: 5,
                subtotal: 5,
              },
              {
                itemId: coronaItem.id,
                quantity: 1,
                unitPrice: 10,
                subtotal: 10,
              },
            ],
          },
        },
      },
      include: {
        items: true,
      },
    });

    // Create initial status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: testOrder.id,
        fromStatus: null,
        toStatus: "NEW",
        changedBy: regularUser.id,
      },
    });

    console.log(`Created test order #${testOrder.orderNumber} for ${regularUser.firstName} ${regularUser.lastName}`);
  }

  console.log("✓ Test users and orders created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
