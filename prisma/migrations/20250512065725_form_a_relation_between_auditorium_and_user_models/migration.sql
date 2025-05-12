-- AlterTable
ALTER TABLE "Auditorium" ADD COLUMN     "adminId" TEXT NOT NULL DEFAULT '0c3fc92c-60ef-4b15-90f2-233d2eb19664';

-- AddForeignKey
ALTER TABLE "Auditorium" ADD CONSTRAINT "Auditorium_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
