/*
  Warnings:

  - Added the required column `truck_id` to the `Sales` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "truck_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Truck" (
    "truck_id" TEXT NOT NULL,
    "truck_name" TEXT NOT NULL,
    "truck_number" TEXT NOT NULL,
    "capacity" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Truck_pkey" PRIMARY KEY ("truck_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Truck_truck_number_key" ON "Truck"("truck_number");

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "Truck"("truck_id") ON DELETE RESTRICT ON UPDATE CASCADE;
