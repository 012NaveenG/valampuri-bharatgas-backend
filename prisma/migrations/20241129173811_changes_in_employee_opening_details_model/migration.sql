/*
  Warnings:

  - Added the required column `assigned_area` to the `EmployeeOpeningDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmployeeOpeningDetails" ADD COLUMN     "assigned_area" TEXT NOT NULL;
