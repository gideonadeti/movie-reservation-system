/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Auditorium` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Auditorium_name_key" ON "Auditorium"("name");
