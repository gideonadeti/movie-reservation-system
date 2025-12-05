/*
  Warnings:

  - A unique constraint covering the columns `[seatId,showtimeId]` on the table `ReservedSeat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `showtimeId` to the `ReservedSeat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReservedSeat" ADD COLUMN     "showtimeId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ReservedSeat_seatId_showtimeId_key" ON "ReservedSeat"("seatId", "showtimeId");

-- AddForeignKey
ALTER TABLE "ReservedSeat" ADD CONSTRAINT "ReservedSeat_showtimeId_fkey" FOREIGN KEY ("showtimeId") REFERENCES "Showtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;
