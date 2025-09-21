/*
  Warnings:

  - You are about to drop the column `transferId` on the `Bet` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Bet" DROP CONSTRAINT "Bet_transferId_fkey";

-- AlterTable
ALTER TABLE "public"."Bet" DROP COLUMN "transferId";
