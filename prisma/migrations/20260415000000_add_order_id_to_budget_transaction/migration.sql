-- AlterTable
ALTER TABLE "BudgetTransaction" ADD COLUMN "orderId" TEXT;

-- CreateIndex
CREATE INDEX "BudgetTransaction_orderId_idx" ON "BudgetTransaction"("orderId");

-- AddForeignKey
ALTER TABLE "BudgetTransaction" ADD CONSTRAINT "BudgetTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
