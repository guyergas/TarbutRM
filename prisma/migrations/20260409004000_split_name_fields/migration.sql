ALTER TABLE "User" ADD COLUMN "firstName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "lastName" TEXT NOT NULL DEFAULT '';
UPDATE "User" SET
  "firstName" = CASE WHEN position(' ' in name) > 0 THEN left(name, position(' ' in name) - 1) ELSE name END,
  "lastName"  = CASE WHEN position(' ' in name) > 0 THEN right(name, length(name) - position(' ' in name)) ELSE '' END;
ALTER TABLE "User" DROP COLUMN "name";
ALTER TABLE "User" ALTER COLUMN "firstName" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "lastName" DROP DEFAULT;
