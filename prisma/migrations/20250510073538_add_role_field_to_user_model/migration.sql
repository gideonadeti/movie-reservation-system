-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'NADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'NADMIN';
