/*
  Warnings:

  - You are about to drop the column `sourceOftruth` on the `Market` table. All the data in the column will be lost.
  - Added the required column `sourceOfTruth` to the `Market` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Market" DROP COLUMN "sourceOftruth",
ADD COLUMN     "sourceOfTruth" TEXT NOT NULL;
