import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const hashedPassword = await bcrypt.hash('Guyanddikla1983', 10);
    const admin = await prisma.user.update({
      where: { email: 'guyergas@gmail.com' },
      data: { passwordHash: hashedPassword },
    });
    console.log(`✓ Password updated for ${admin.email}`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
