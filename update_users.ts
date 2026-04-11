import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany({});
  console.log("✓ Deleted all users");

  const hashedPassword = await bcrypt.hash("Guyanddikla1983", 10);
  const adminUser = await prisma.user.create({
    data: {
      email: "guyergas@gmail.com",
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  console.log(`✓ Created admin user: ${adminUser.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
