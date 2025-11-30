/*
  Warnings:

  - You are about to drop the column `adminId` on the `Auditorium` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `Seat` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `Showtime` table. All the data in the column will be lost.
  - You are about to drop the `Movie` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Auditorium" DROP CONSTRAINT "Auditorium_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Movie" DROP CONSTRAINT "Movie_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Seat" DROP CONSTRAINT "Seat_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Showtime" DROP CONSTRAINT "Showtime_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Showtime" DROP CONSTRAINT "Showtime_movieId_fkey";

-- AlterTable
ALTER TABLE "Auditorium" DROP COLUMN "adminId";

-- AlterTable
ALTER TABLE "Seat" DROP COLUMN "adminId";

-- AlterTable
ALTER TABLE "Showtime" DROP COLUMN "adminId";

-- DropTable
DROP TABLE "Movie";
