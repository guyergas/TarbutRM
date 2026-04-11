import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const cocktails = [
  {
    title: "Gin & Tonic – קלאסי ורענן",
    description: "מרכיבים:\n40 מ״ל ג'ין\n120 מ״ל טוניק\nפלח ליים\nכוס: היי בול\nהכנה: מזיגה על קרח והשלמה בטוניק",
    price: 20
  },
  {
    title: "Whiskey Sour – חמצמץ ומאוזן",
    description: "מרכיבים:\n45 מ״ל וויסקי\n25 מ״ל מיץ לימון\n15 מ״ל סוכר\nכוס: לואו בול\nהכנה: ניעור עם קרח ומזיגה על קרח",
    price: 20
  },
  {
    title: "Cosmopolitan – פירותי ואלגנטי",
    description: "מרכיבים:\n40 מ״ל וודקה\n20 מ״ל ליקר תפוזים\n20 מ״ל מיץ חמוציות\n10 מ״ל מיץ ליים\nכוס: לואו בול\nהכנה: ניעור עם קרח ומזיגה על קרח",
    price: 20
  },
  {
    title: "Gin Lychee – פרחוני ורענן",
    description: "מרכיבים:\n40 מ״ל ג'ין\n20 מ״ל מיץ לימון\n15 מ״ל סירופ מונין ליצ׳י\nנגיעה של מי ורדים\n60 מ״ל סודה\nכוס: לואו בול\nהכנה: ערבוב קל עם קרח והשלמה בסודה",
    price: 20
  },
  {
    title: "Mojito – רענן וקיצי",
    description: "מרכיבים:\n40 מ״ל רום\n20 מ״ל מיץ ליים\n10 מ״ל סוכר\nנענע טרייה\nסגירה: סודה\nכוס: היי בול\nהכנה: מעיכה עדינה של נענע וסגירה",
    price: 20
  },
  {
    title: "Cucumber Gin – פרש וירוק",
    description: "מרכיבים:\n40 מ״ל ג'ין\n20 מ״ל מיץ לימון\n10 מ״ל סירופ סוכר\nפרוסות מלפפון\nסגירה: סודה\nכוס: היי בול\nהכנה: ערבוב קל וסגירה",
    price: 20
  },
  {
    title: "Mule – רענן וחריף",
    description: "מרכיבים:\n40 מ״ל וודקה\n100 מ״ל ג'ינג'ר ביר\n10 מ״ל מיץ לימון\nכוס: לואו בול\nהכנה: מזיגה על הרבה קרח והשלמה בג'ינג'ר ביר",
    price: 20
  },
  {
    title: "Negroni – מריר וקלאסי",
    description: "מרכיבים:\n30 מ״ל ג'ין\n30 מ״ל קמפרי\n30 מ״ל ורמוט אדום\nכוס: לואו בול\nהכנה: ערבוב עם קרח והגשה עם קליפת תפוז",
    price: 20
  },
  {
    title: "Arak Rosetta – ישראלי עוקצני",
    description: "מרכיבים:\n40 מ״ל ערק\n20 מ״ל רוזטה\n10 מ״ל מיץ לימון\nנענע טרייה\nסגירה: מים קרים או סודה\nכוס: היי בול\nהכנה: ערבוב קל עם קרח וסגירה",
    price: 20
  },
  {
    title: "Margarita – טרופי ובועט",
    description: "מרכיבים:\n40 מ״ל טקילה\n20 מ״ל ליקר תפוזים\n15 מ״ל מיץ ליים\n15 מ״ל סירופ מונין טרופי\nכוס: לואו בול\nהכנה: ניעור עם קרח, שוליים של מלח + סוכר + צ׳ילי",
    price: 20
  },
  {
    title: "Aperol Spritz – מריר וקליל",
    description: "מרכיבים:\n60 מ״ל אפרול\n90 מ״ל פרוסקו\n30 מ״ל סודה\nכוס: כוס יין\nהכנה: מזיגה על קרח והשלמה בסודה",
    price: 20
  },
  {
    title: "Vermouth Spritz – ארומטי ועדין",
    description: "מרכיבים:\n60 מ״ל ורמוט לבן\n90 מ״ל פרוסקו\n30 מ״ל סודה\nכוס: כוס יין\nהכנה: מזיגה על קרח והשלמה בסודה",
    price: 20
  },
  {
    title: "Vermouth Barcelona – מריר ואותנטי",
    description: "מרכיבים:\n60 מ״ל ורמוט אדום\nפרוסת תפוז\nזית\nסגירה: סודה (אופציונלי)\nכוס: כוס זכוכית פשוטה (כמו כוס קפה טורקי)\nהכנה: מזיגה על קרח והוספת קישוטים, סגירה לפי בחירה",
    price: 20
  },
  {
    title: "Elderflower Spritz – פרחוני ורענן",
    description: "מרכיבים:\n40 מ״ל סנט גרמין\n90 מ״ל פרוסקו\n30 מ״ל סודה\nכוס: כוס יין\nהכנה: מזיגה על קרח והשלמה בסודה",
    price: 20
  }
];

async function main() {
  try {
    console.log('🗑️  Deleting all items, orders, and users...');
    await prisma.orderItem.deleteMany({});
    await prisma.orderStatusHistory.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.itemStockHistory.deleteMany({});
    await prisma.item.deleteMany({});
    await prisma.section.deleteMany({});
    await prisma.menu.deleteMany({});
    await prisma.budgetTransaction.deleteMany({});
    await prisma.verificationToken.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✓ Database cleaned');

    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('Guyanddilla1983', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'guyergas@gmail.com',
        firstName: 'Guy',
        lastName: 'Ergas',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        city: 'Tel Aviv',
      },
    });
    console.log(`✓ Admin created: ${admin.email}`);

    console.log('🍹 Creating menu and section...');
    const menu = await prisma.menu.create({
      data: {
        name: 'Cocktails',
        createdBy: admin.id,
        position: 1,
      },
    });

    const section = await prisma.section.create({
      data: {
        name: 'Cocktails',
        menuId: menu.id,
        createdBy: admin.id,
        position: 1,
      },
    });
    console.log(`✓ Menu and section created`);

    console.log('📥 Importing cocktails...');
    for (let i = 0; i < cocktails.length; i++) {
      const cocktail = cocktails[i];
      await prisma.item.create({
        data: {
          name: cocktail.title,
          description: cocktail.description,
          price: cocktail.price.toString(),
          sectionId: section.id,
          createdBy: admin.id,
          position: i + 1,
          inStock: true,
        },
      });
    }
    console.log(`✓ ${cocktails.length} cocktails imported`);

    console.log('✅ Database reset and populated successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
