ALTER TABLE "BudgetTransaction" DROP CONSTRAINT IF EXISTS "BudgetTransaction_userId_fkey";

CREATE INDEX IF NOT EXISTS "BudgetTransaction_userId_idx" ON "BudgetTransaction"("userId");
