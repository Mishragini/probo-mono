/*
  Warnings:

  - You are about to drop the column `InrBalance` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."OrderType" AS ENUM ('buy', 'sell');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('filled', 'pending', 'cancelled', 'partial');

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "InrBalance";

-- CreateTable
CREATE TABLE "public"."InrBalance" (
    "id" TEXT NOT NULL,
    "locked" INTEGER NOT NULL DEFAULT 0,
    "available" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "InrBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "side" "public"."Side" NOT NULL,
    "type" "public"."OrderType" NOT NULL,
    "status" "public"."OrderStatus" NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "remainingQty" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InrBalance_userId_key" ON "public"."InrBalance"("userId");

-- AddForeignKey
ALTER TABLE "public"."InrBalance" ADD CONSTRAINT "InrBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "public"."Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
