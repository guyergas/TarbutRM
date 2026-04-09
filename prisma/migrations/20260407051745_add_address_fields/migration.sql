/*
  Warnings:

  - Added the required column `city` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "apartment" TEXT,
ADD COLUMN     "city" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "street" TEXT;

-- Remove the default so future inserts must supply a value
ALTER TABLE "User" ALTER COLUMN "city" DROP DEFAULT;
