/*
  Warnings:

  - A unique constraint covering the columns `[label,auditoriumId]` on the table `Seat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Seat_label_auditoriumId_key" ON "Seat"("label", "auditoriumId");
