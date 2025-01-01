import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { AsyncHandler } from "../../utils/AsyncHandler.js";
import { prismaDB } from "../../DB/prismaClient.js";

const overview = AsyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfYear = new Date(today.getFullYear(), 0, 1);

  const [todaysSales, salesData, totalEmployees, totalCustomers] =
    await Promise.all([
      // Today's sales
      prismaDB.sales.findMany({
        where: {
          created_at: {
            gte: today,
          },
        },
        include:{
          Customer:{
            select:{
              cust_id:true,
              cust_name:true
            }
          },
          Employee:{
            select:{
              emp_id:true,
              emp_name:true
            }
          }
        }
      }),
      prismaDB.sales.groupBy({
        by: ["created_at"],
        _sum: {
          total_amount_received: true,
          bal_payment: true,
        },
        where: {
          created_at: {
            gte: startOfYear,
          },
        },
      }),
      // Total employees
      prismaDB.employee.count(),
      // Total customers
      prismaDB.customer.count(),
    ]);

  // Process today's sales data
  const todaystotalSalesAmt = todaysSales.reduce(
    (acc, sale) => acc + sale.total_amount_received + sale.bal_payment,
    0
  );

  // Step 1: Group sales by month
  const monthlySales = {};

  salesData.forEach((entry) => {
    const date = new Date(entry.created_at);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    if (!monthlySales[month]) {
      monthlySales[month] = { total_amount_received: 0, bal_payment: 0 };
    }

    monthlySales[month].total_amount_received +=
      entry._sum.total_amount_received;
    monthlySales[month].bal_payment += entry._sum.bal_payment;
  });

  // Step 2: Ensure all months are represented (from January to December)
  const allMonths = Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    const monthKey = `${today.getFullYear()}-${month}`;

    if (!monthlySales[monthKey]) {
      monthlySales[monthKey] = { total_amount_received: 0, bal_payment: 0 };
    }

    return {
      month: `${today.getFullYear()}-${month}`,
      total_amount_received: monthlySales[monthKey].total_amount_received,
      bal_payment: monthlySales[monthKey].bal_payment,
    };
  });

  // Step 3: Sort months in ascending order (from January to December)
  const result = allMonths;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        todaysSales,
        todaystotalSalesAmt,
        monthlySales: result,
        totalEmployees,
        totalCustomers,
      },
      "success"
    )
  );
});

export { overview };
