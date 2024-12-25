/*
  Warnings:

  - You are about to drop the column `balance_empty` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `extra_empty_delivered` on the `Customer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "balance_empty",
DROP COLUMN "extra_empty_delivered",
ADD COLUMN     "extra_empty_received" INTEGER DEFAULT 0,
ADD COLUMN     "pending_empty" INTEGER DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
