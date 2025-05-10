/*
  Warnings:

  - Added the required column `adminId` to the `Showtime` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Showtime" ADD COLUMN     "adminId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Showtime" ADD CONSTRAINT "Showtime_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
