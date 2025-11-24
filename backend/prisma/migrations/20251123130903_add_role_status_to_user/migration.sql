-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'staff',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';
