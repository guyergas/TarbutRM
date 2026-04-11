-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('ADMIN_CREDIT', 'ADMIN_DEBIT', 'CARD_TOPUP');

-- AlterTable
ALTER TABLE "BudgetTransaction" ADD COLUMN     "type" "TransactionType" NOT NULL DEFAULT 'ADMIN_CREDIT';
