-- CreateTable
CREATE TABLE "EmployeeOpeningDetails" (
    "id" TEXT NOT NULL,
    "emp_id" TEXT NOT NULL,
    "truck_id" TEXT NOT NULL,
    "total_full_cylinders" INTEGER NOT NULL DEFAULT 0,
    "total_empty_cylinders" INTEGER NOT NULL DEFAULT 0,
    "opening_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeOpeningDetails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmployeeOpeningDetails" ADD CONSTRAINT "EmployeeOpeningDetails_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "Employee"("emp_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeOpeningDetails" ADD CONSTRAINT "EmployeeOpeningDetails_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "Truck"("truck_id") ON DELETE RESTRICT ON UPDATE CASCADE;
