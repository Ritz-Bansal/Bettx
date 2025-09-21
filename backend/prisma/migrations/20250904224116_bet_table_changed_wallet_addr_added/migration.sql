/*
  Warnings:

  - You are about to drop the column `userId` on the `Bet` table. All the data in the column will be lost.
  - Added the required column `walletAddress` to the `Bet` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Bet" DROP CONSTRAINT "Bet_userId_fkey";

-- DropIndex
DROP INDEX "public"."Bet_VjudgeUserId_key";

-- AlterTable
ALTER TABLE "public"."Bet" DROP COLUMN "userId",
ADD COLUMN     "walletAddress" TEXT NOT NULL;
