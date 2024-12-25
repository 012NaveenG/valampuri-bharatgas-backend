-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('UPI', 'Cash', 'Both');

-- CreateTable
CREATE TABLE "Employee" (
    "emp_id" TEXT NOT NULL,
    "emp_name" TEXT NOT NULL,
    "emp_contact" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("emp_id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "cust_id" TEXT NOT NULL,
    "cust_name" TEXT,
    "area_no" INTEGER,
    "area_name" TEXT,
    "full_delivered" INTEGER NOT NULL DEFAULT 0,
    "empty_delivered" INTEGER DEFAULT 0,
    "extra_empty_delivered" INTEGER DEFAULT 0,
    "balance_empty" INTEGER DEFAULT 0,
    "pending_payment" DOUBLE PRECISION DEFAULT 0.0,
    "deposit" DOUBLE PRECISION DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("cust_id")
);

-- CreateTable
CREATE TABLE "Sales" (
    "sale_id" TEXT NOT NULL,
    "delivered_by" TEXT NOT NULL,
    "delivered_to" TEXT NOT NULL,
    "full_delivered" INTEGER NOT NULL DEFAULT 0,
    "empty_delivered" INTEGER NOT NULL DEFAULT 0,
    "empty_received" INTEGER NOT NULL DEFAULT 0,
    "total_amount_received" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "bal_payment" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "payment_mode" "PaymentMode" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sales_pkey" PRIMARY KEY ("sale_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_username_key" ON "Employee"("username");

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_delivered_by_fkey" FOREIGN KEY ("delivered_by") REFERENCES "Employee"("emp_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_delivered_to_fkey" FOREIGN KEY ("delivered_to") REFERENCES "Customer"("cust_id") ON DELETE RESTRICT ON UPDATE CASCADE;
