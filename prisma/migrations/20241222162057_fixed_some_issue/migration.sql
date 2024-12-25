/*
  Warnings:

  - You are about to alter the column `pending_payment` on the `Customer` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `deposit` on the `Customer` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `total_amount_received` on the `Sales` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `bal_payment` on the `Sales` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "pending_payment" SET DEFAULT 0,
ALTER COLUMN "pending_payment" SET DATA TYPE INTEGER,
ALTER COLUMN "deposit" SET DEFAULT 0,
ALTER COLUMN "deposit" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Sales" ALTER COLUMN "total_amount_received" SET DEFAULT 0,
ALTER COLUMN "total_amount_received" SET DATA TYPE INTEGER,
ALTER COLUMN "bal_payment" SET DEFAULT 0,
ALTER COLUMN "bal_payment" SET DATA TYPE INTEGER;
