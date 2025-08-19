-- CreateEnum
CREATE TYPE "public"."Side" AS ENUM ('yes', 'no');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "InrBalance" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."StockBalance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "side" "public"."Side" NOT NULL,
    "locked" INTEGER NOT NULL,
    "available" INTEGER NOT NULL,
    "marketId" TEXT NOT NULL,

    CONSTRAINT "StockBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Market" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sourceOftruth" TEXT NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "Market_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."StockBalance" ADD CONSTRAINT "StockBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockBalance" ADD CONSTRAINT "StockBalance_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "public"."Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
