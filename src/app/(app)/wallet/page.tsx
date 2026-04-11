import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WalletClient from "./WalletClient";

export const metadata = { title: "הארנק שלי — TarbutRM" };

export default async function WalletPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch user and transactions
  const [user, transactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        balance: true,
        firstName: true,
        lastName: true,
      },
    }),
    prisma.budgetTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  // Fetch creators of transactions for display
  const creatorIds = [...new Set(transactions.map((t) => t.createdBy))];
  const creators = await prisma.user.findMany({
    where: { id: { in: creatorIds } },
    select: { id: true, firstName: true, lastName: true, role: true },
  });
  const creatorMap = Object.fromEntries(creators.map((c) => [c.id, c]));

  // Serialize Decimal objects to numbers
  const serializedUser = {
    balance: Number(user.balance),
    firstName: user.firstName,
    lastName: user.lastName,
  };

  const serializedTransactions = transactions.map((tx) => ({
    ...tx,
    amount: Number(tx.amount),
    note: tx.note || undefined,
    createdAt: tx.createdAt.toISOString(),
  }));

  return (
    <WalletClient
      user={serializedUser}
      transactions={serializedTransactions}
      creatorMap={creatorMap}
    />
  );
}
