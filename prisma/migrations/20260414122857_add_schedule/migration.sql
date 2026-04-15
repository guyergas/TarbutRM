-- CreateTable
CREATE TABLE "Operation" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "note" TEXT,
    "requiredCount" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationStaff" (
    "id" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationStaff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Operation_date_idx" ON "Operation"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Operation_date_key" ON "Operation"("date");

-- CreateIndex
CREATE INDEX "OperationStaff_operationId_idx" ON "OperationStaff"("operationId");

-- CreateIndex
CREATE INDEX "OperationStaff_userId_idx" ON "OperationStaff"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OperationStaff_operationId_userId_key" ON "OperationStaff"("operationId", "userId");

-- AddForeignKey
ALTER TABLE "OperationStaff" ADD CONSTRAINT "OperationStaff_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationStaff" ADD CONSTRAINT "OperationStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
