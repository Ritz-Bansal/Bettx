/*
  Warnings:

  - You are about to drop the column `amount` on the `Bet` table. All the data in the column will be lost.
  - You are about to drop the column `walletAddressParticipant` on the `Bet` table. All the data in the column will be lost.
  - Added the required column `stake` to the `Bet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transferId` to the `Bet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Bet" DROP COLUMN "amount",
DROP COLUMN "walletAddressParticipant",
ADD COLUMN     "stake" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "transferId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Participants" (
    "id" TEXT NOT NULL,
    "multiplier" INTEGER NOT NULL,
    "VJudgeUserName" TEXT NOT NULL,

    CONSTRAINT "Participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Participants_VJudgeUserName_key" ON "public"."Participants"("VJudgeUserName");

-- AddForeignKey
ALTER TABLE "public"."Bet" ADD CONSTRAINT "Bet_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
