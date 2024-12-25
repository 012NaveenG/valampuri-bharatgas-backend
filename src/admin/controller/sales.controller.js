import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { AsyncHandler } from "../../utils/AsyncHandler.js";
import { prismaDB } from "../../DB/prismaClient.js";

const getAllSalesOfLastDays = AsyncHandler(async (req, res) => {
  const { lastDays } = req.query; // Expecting lastDays as a number

  if (!lastDays || isNaN(lastDays) || lastDays <= 0) {
    throw new ApiError(400, "Please provide a valid number of days");
  }

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - Number(lastDays)); // Calculate date N days ago

  const salesData = await prismaDB.sales.findMany({
    where: {
      created_at: {
        gte: fromDate, // Records created on or after the fromDate
      },
    },
    orderBy: {
      created_at: "desc", // Optional: Order by newest first
    },
    include: {
      Employee: {
        select: {
          emp_name: true,
          emp_id: true,
        },
      },
      Customer: {
        select: {
          cust_id: true,
          cust_name: true,
        },
      },
      Truck:{
        select:{
          truck_id:true,
          truck_name:true
        }
      }
    },
   
  });

  if (!salesData || salesData.length === 0) {
    throw new ApiError(
      404,
      `No sales data available for the last ${lastDays} days`
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        salesData,
        `Sales data fetched for the last ${lastDays} days`
      )
    );
});

const getSalesReportFromDtToDt = AsyncHandler(async (req, res) => {
  const { fromDate, ToDate } = req.query;

  // Validate date inputs
  if (!fromDate || !ToDate) {
    throw new ApiError(400, "Please provide both start date and end date.");
  }

  const from = new Date(fromDate);
  const to = new Date(ToDate);

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD.");
  }

  // Query sales data between the date range
  const salesdata = await prismaDB.sales.findMany({
    where: {
      created_at: {
        gte: from, // Greater than or equal to the start date
        lte: to, // Less than or equal to the end date
      },
    },
    include: {
      Customer: {
        select: {
          cust_name: true,
          area_name: true,
          area_no: true,
        },
      },
      Employee: {
        select: {
          emp_name: true,
        },
      },
    },
  });

  if (!salesdata || salesdata.length === 0) {
    throw new ApiError(
      404,
      `No sales data found from ${fromDate} to ${ToDate}`
    );
  }

  // Return success response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        salesdata,
        `Sales data from ${fromDate} to ${ToDate} fetched successfully`
      )
    );
});

export { getAllSalesOfLastDays, getSalesReportFromDtToDt };
