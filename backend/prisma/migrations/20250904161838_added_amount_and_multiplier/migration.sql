/*
  Warnings:

  - Added the required column `amount` to the `Bet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `multiplier` to the `Bet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Bet" ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "multiplier" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."Pool" (
    "id" TEXT NOT NULL,
    "contest" TEXT NOT NULL,
    "totalMoney" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Pool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pool_contest_key" ON "public"."Pool"("contest");

-- AddForeignKey
ALTER TABLE "public"."Pool" ADD CONSTRAINT "Pool_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
