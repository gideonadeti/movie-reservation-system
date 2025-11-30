/*
  Warnings:

  - You are about to drop the column `movieId` on the `Showtime` table. All the data in the column will be lost.
  - Added the required column `tmdbMovieId` to the `Showtime` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Showtime" DROP COLUMN "movieId",
ADD COLUMN     "tmdbMovieId" INTEGER NOT NULL;
