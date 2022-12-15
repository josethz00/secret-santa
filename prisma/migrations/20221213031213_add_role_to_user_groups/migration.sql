-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "UserGroups" ADD COLUMN     "userConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userRole" "Role" NOT NULL DEFAULT 'USER';
