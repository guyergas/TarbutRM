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
    // Menu: פאב (Pub)
    const pubMenu = await prisma.menu.create({
      data: {
        name: "פאב",
        position: 1,
        archived: false,
        createdBy: user.id,
      },
    });
    console.log(`Created menu: ${pubMenu.name}`);

    // Section 1: קוקטיילים
    const cocktailsSection = await prisma.section.create({
      data: {
        menuId: pubMenu.id,
        name: "קוקטיילים",
        position: 1,
        archived: false,
        createdBy: user.id,
      },
    });

    const cocktails = [
      { name: "Gin & Tonic – קלאסי ורענן", description: "מרכיבים:\n40 מ״ל ג'ין\n120 מ״ל טוניק\nפלח ליים\nכוס: היי בול\nהכנה: מזיגה על קרח והשלמה בטוניק", price: 20 },
      { name: "Whiskey Sour – חמצמץ ומאוזן", description: "מרכיבים:\n45 מ״ל וויסקי\n25 מ״ל מיץ לימון\n15 מ״ל סוכר\nכוס: לואו בול\nהכנה: ניעור עם קרח ומזיגה על קרח", price: 20 },
      { name: "Cosmopolitan – פירותי ואלגנטי", description: "מרכיבים:\n40 מ״ל וודקה\n20 מ״ל ליקר תפוזים\n20 מ״ל מיץ חמוציות\n10 מ״ל מיץ ליים\nכוס: לואו בול\nהכנה: ניעור עם קרח ומזיגה על קרח", price: 20 },
      { name: "Gin Lychee – פרחוני ורענן", description: "מרכיבים:\n40 מ״ל ג'ין\n20 מ״ל מיץ לימון\n15 מ״ל סירופ מונין ליצ׳י\nנגיעה של מי ורדים\n60 מ״ל סודה\nכוס: לואו בול\nהכנה: ערבוב קל עם קרח והשלמה בסודה", price: 20 },
      { name: "Mojito – רענן וקיצי", description: "מרכיבים:\n40 מ״ל רום\n20 מ״ל מיץ ליים\n10 מ״ל סוכר\nנענע טרייה\nסגירה: סודה\nכוס: היי בול\nהכנה: מעיכה עדינה של נענע וסגירה", price: 20 },
      { name: "Cucumber Gin – פרש וירוק", description: "מרכיבים:\n40 מ״ל ג'ין\n20 מ״ל מיץ לימון\n10 מ״ל סירופ סוכר\nפרוסות מלפפון\nסגירה: סודה\nכוס: היי בול\nהכנה: ערבוב קל וסגירה", price: 20 },
      { name: "Mule – רענן וחריף", description: "מרכיבים:\n40 מ״ל וודקה\n100 מ״ל ג'ינג'ר ביר\n10 מ״ל מיץ לימון\nכוס: לואו בול\nהכנה: מזיגה על הרבה קרח והשלמה בג'ינג'ר ביר", price: 20 },
      { name: "Negroni – מריר וקלאסי", description: "מרכיבים:\n30 מ״ל ג'ין\n30 מ״ל קמפרי\n30 מ״ל ורמוט אדום\nכוס: לואו בול\nהכנה: ערבוב עם קרח והגשה עם קליפת תפוז", price: 20 },
      { name: "Arak Rosetta – ישראלי עוקצני", description: "מרכיבים:\n40 מ״ל ערק\n20 מ״ל רוזטה\n10 מ״ל מיץ לימון\nנענע טרייה\nסגירה: מים קרים או סודה\nכוס: היי בול\nהכנה: ערבוב קל עם קרח וסגירה", price: 20 },
      { name: "Margarita – טרופי ובועט", description: "מרכיבים:\n40 מ״ל טקילה\n20 מ״ל ליקר תפוזים\n15 מ״ל מיץ ליים\n15 מ״ל סירופ מונין טרופי\nכוס: לואו בול\nהכנה: ניעור עם קרח, שוליים של מלח + סוכר + צ׳ילי", price: 20 },
      { name: "Aperol Spritz – מריר וקליל", description: "מרכיבים:\n60 מ״ל אפרול\n90 מ״ל פרוסקו\n30 מ״ל סודה\nכוס: כוס יין\nהכנה: מזיגה על קרח והשלמה בסודה", price: 20 },
      { name: "Vermouth Spritz – ארומטי ועדין", description: "מרכיבים:\n60 מ״ל ורמוט לבן\n90 מ״ל פרוסקו\n30 מ״ל סודה\nכוס: כוס יין\nהכנה: מזיגה על קרח והשלמה בסודה", price: 20 },
      { name: "Vermouth Barcelona – מריר ואותנטי", description: "מרכיבים:\n60 מ״ל ורמוט אדום\nפרוסת תפוז\nזית\nסגירה: סודה (אופציונלי)\nכוס: כוס זכוכית פשוטה (כמו כוס קפה טורקי)\nהכנה: מזיגה על קרח והוספת קישוטים, סגירה לפי בחירה", price: 20 },
      { name: "Elderflower Spritz – פרחוני ורענן", description: "מרכיבים:\n40 מ״ל סנט גרמין\n90 מ״ל פרוסקו\n30 מ״ל סודה\nכוס: כוס יין\nהכנה: מזיגה על קרח והשלמה בסודה", price: 20 },
    ];

    for (let i = 0; i < cocktails.length; i++) {
      const item = await prisma.item.create({
        data: {
          sectionId: cocktailsSection.id,
          name: cocktails[i].name,
          description: cocktails[i].description,
          price: cocktails[i].price,
          inStock: true,
          position: i + 1,
          archived: false,
          createdBy: user.id,
        },
      });
      await prisma.itemStockHistory.create({
        data: { itemId: item.id, inStock: true, changedBy: user.id, changedAt: new Date() },
      });
      if (i === 1) whiskeyItem = item; // Whiskey Sour for test order
    }
    console.log(`Created section: ${cocktailsSection.name} (${cocktails.length} items)`);

    // Section 2: בירות
    const beersSection = await prisma.section.create({
      data: {
        menuId: pubMenu.id,
        name: "בירות",
        position: 2,
        archived: false,
        createdBy: user.id,
      },
    });

    const beers = [
      { name: "גולדסטאר", description: "בירה לאגר ישראלית", price: 10 },
      { name: "הייניקן", description: "בירה לאגר הולנדית", price: 10 },
    ];

    for (let i = 0; i < beers.length; i++) {
      const item = await prisma.item.create({
        data: {
          sectionId: beersSection.id,
          name: beers[i].name,
          description: beers[i].description,
          price: beers[i].price,
          inStock: true,
          position: i + 1,
          archived: false,
          createdBy: user.id,
        },
      });
      await prisma.itemStockHistory.create({
        data: { itemId: item.id, inStock: true, changedBy: user.id, changedAt: new Date() },
      });
      if (i === 0) goldstarItem = item;
      if (i === 1) coronaItem = item; // הייניקן used as second item for test order
    }
    console.log(`Created section: ${beersSection.name} (${beers.length} items)`);

    // Section 3: שתיה קלה
    const softDrinksSection = await prisma.section.create({
      data: {
        menuId: pubMenu.id,
        name: "שתיה קלה",
        position: 3,
        archived: false,
        createdBy: user.id,
      },
    });

    const softDrinks = [
      { name: "ספרייט", description: "משקה לימוני מוגז", price: 10 },
      { name: "קוקה קולה", description: "משקה קלאסי מוגז", price: 5 },
    ];

    for (let i = 0; i < softDrinks.length; i++) {
      const item = await prisma.item.create({
        data: {
          sectionId: softDrinksSection.id,
          name: softDrinks[i].name,
          description: softDrinks[i].description,
          price: softDrinks[i].price,
          inStock: true,
          position: i + 1,
          archived: false,
          createdBy: user.id,
        },
      });
      await prisma.itemStockHistory.create({
        data: { itemId: item.id, inStock: true, changedBy: user.id, changedAt: new Date() },
      });
    }
    console.log(`Created section: ${softDrinksSection.name} (${softDrinks.length} items)`);

    console.log("✓ Phase 3 seed data created successfully");
  } else {
    console.log("Store data already seeded, skipping...");
    // Still need to fetch items for order creation
    const items = await prisma.item.findMany({
      where: { name: { in: ["גולדסטאר", "הייניקן", "Whiskey Sour – חמצמץ ומאוזן"] } },
    });
    goldstarItem = items.find((i) => i.name === "גולדסטאר");
    coronaItem = items.find((i) => i.name === "הייניקן");
    whiskeyItem = items.find((i) => i.name === "Whiskey Sour – חמצמץ ומאוזן");
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
    // Create order with goldstar + heineken
    const testOrder = await prisma.order.create({
      data: {
        userId: regularUser.id,
        status: "NEW",
        total: 20, // 10 + 10
        items: {
          createMany: {
            data: [
              {
                itemId: goldstarItem.id,
                quantity: 1,
                unitPrice: 10,
                subtotal: 10,
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
