/*
  Warnings:

  - You are about to drop the column `balace` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "balace",

ADD COLUMN     "balance" INTEGER NOT NULL DEFAULT 0;
