/*
  Warnings:

  - You are about to drop the `Chat` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_roomId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_userId_fkey";

-- DropTable
DROP TABLE "public"."Chat";

-- CreateTable
CREATE TABLE "public"."Drawing" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "points" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL DEFAULT 'Anonymous',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Drawing_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Drawing" ADD CONSTRAINT "Drawing_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Drawing" ADD CONSTRAINT "Drawing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
