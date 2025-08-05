-- AlterTable
ALTER TABLE "public"."Drawing" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "shapeType" TEXT NOT NULL DEFAULT 'line',
ADD COLUMN     "strokeWidth" INTEGER NOT NULL DEFAULT 2;
