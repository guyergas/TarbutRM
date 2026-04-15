-- CreateTable
CREATE TABLE "OperationHelper" (
    "id" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationHelper_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OperationHelper_operationId_idx" ON "OperationHelper"("operationId");

-- CreateIndex
CREATE INDEX "OperationHelper_userId_idx" ON "OperationHelper"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OperationHelper_operationId_userId_key" ON "OperationHelper"("operationId", "userId");

-- AddForeignKey
ALTER TABLE "OperationHelper" ADD CONSTRAINT "OperationHelper_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationHelper" ADD CONSTRAINT "OperationHelper_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
