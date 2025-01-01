import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { prismaDB } from "../DB/prismaClient.js";
import jwt from "jsonwebtoken";

const loginEmployee = AsyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!(username && password)) {
    return res
      .status(400)
      .json(new ApiError(400, "Please fill the credentials"));
  }

  // Find employee by username
  const isEmployeeExists = await prismaDB.employee.findUnique({
    where: { username },
  });

  if (!isEmployeeExists) {
    return res.status(404).json(new ApiError(404, "Invalid Credentials"));
  }

  // Verify password
  if (isEmployeeExists.password !== password) {
    return res.status(404).json(new ApiError(404, "Invalid Credentials"));
  }

  // Generate token
  const token = jwt.sign(
    {
      id: isEmployeeExists.emp_id,
      name: isEmployeeExists.emp_name,
      username: isEmployeeExists.username,
      isAdmin: isEmployeeExists.isAdmin,
    },
    process.env.TOKEN_SECRET_KEY,
    { expiresIn: "1h" } // Set token expiration for better security
  );

  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if an entry already exists for the employee today
  const isEmployeeFilledOpeningDetailsAlready = await prismaDB.employeeOpeningDetails.findFirst({
    where: {
      emp_id: isEmployeeExists.emp_id,
      opening_date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // End of the day
      },
    },
  });

  // Set cookie options
  const Options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure cookies only in production
    sameSite: "Strict",
    maxAge: 3600000, // 1 hour in milliseconds
  };

  // Exclude the password field
  const { password: _, ...responseData } = isEmployeeExists;

  // Respond with token cookie
  return res
    .status(200)
    .cookie("token", token, Options)
    .json(new ApiResponse(isEmployeeFilledOpeningDetailsAlready?409:200, responseData, "Logged in successfully"));
});

const logoutEmployee = AsyncHandler(async (req, res) => {
  const token = req.cookies?.token;

  // Check if token exists
  if (!token) {
    throw new ApiError(401, "Unauthorized access");
  }

  try {
    // Verify the token
    jwt.verify(token, process.env.TOKEN_SECRET_KEY);

    // Clear the cookie
    return res
      .status(200)
      .clearCookie("token", { httpOnly: true, sameSite: "Strict" }) // Match cookie options with login
      .json(new ApiResponse(200, {}, "Logged out successfully"));
  } catch (error) {
    // Handle token verification errors
    throw new ApiError(401, "Invalid or expired token");
  }
});

const CreateOpeningDetails = AsyncHandler(async (req, res) => {
  const { emp_id, truck_id, total_full, total_empty, assigned_area } = req.body;

  if (!emp_id || !truck_id || total_full == null || total_empty == null) {
    return res
      .status(400)
      .json(new ApiError(400, "All required fields must be provided."));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if an entry already exists for the employee today
  const existingEntry = await prismaDB.employeeOpeningDetails.findFirst({
    where: {
      emp_id: emp_id,
      opening_date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // End of the day
      },
    },
  });

  if (existingEntry) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "Opening details for this employee have already been filled today."
        )
      );
  }

  // Create a new opening detail entry
  const openingDetail = await prismaDB.employeeOpeningDetails.create({
    data: {
      emp_id: emp_id,
      truck_id: truck_id,
      total_full_cylinders: total_full,
      total_empty_cylinders: total_empty,
      assigned_area: assigned_area,
      opening_date: new Date(),
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        openingDetail,
        "Opening details recorded successfully."
      )
    );
});

const getAreasAndTrucks = AsyncHandler(async (req, res) => {
  const [areas, trucks] = await Promise.all([
    prismaDB.customer.findMany({
      select: {
        area_name: true,
        area_no: true,
      },
    }),

    prismaDB.truck.findMany({
      select: {
        truck_id: true,
        truck_name: true,
        truck_number: true,
      },
    }),
  ]);

  if (!areas || areas.length === 0) {
    return res.status(404).json(new ApiError(404, "no area record found"));
  }

  if (!trucks || trucks.length === 0) {
    return res.status(404).json(new ApiError(404, "no trucks record found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { areas, trucks }, "Areas found successfully"));
});

const getCustomerDetails = AsyncHandler(async (req, res) => {
  const { cust_name } = req.query;

  const customer = await prismaDB.customer.findMany({
    where: {
      cust_name,
    },
  });

  return res.status(200).json(new ApiResponse(200, customer, "Success"));
});

const deliverCylinderToCustomer = AsyncHandler(async (req, res) => {
  const {
    emp_id,
    cust_id,
    truck_id,
    full_cylinder_delivered,
    empty_cylinder_delivered,
    empty_received,
    total_payment_amount,
    payment_received,
    payment_mode,
    rate_per_unit,
  } = req.body;

  // Validate required fields
  if (
    [
      emp_id,
      cust_id,
      truck_id,
      full_cylinder_delivered,
      empty_cylinder_delivered,
      empty_received,
      payment_received,
      rate_per_unit,
    ].some((field) => field === undefined || field === null || field === "")
  ) {
    return res.status(400).json(new ApiError(400, "All fields are required"));
  }

  // Fetch delivery man and customer
  const [delivery_man, customer] = await Promise.all([
    prismaDB.employee.findUnique({ where: { emp_id } }),
    prismaDB.customer.findUnique({ where: { cust_id } }),
  ]);

  if (!delivery_man) {
    throw new ApiError(404, "Invalid Delivery man");
  }

  if (!customer) {
    throw new ApiError(404, "Invalid Customer");
  }

  // Calculate pending payment and deposit
  const pending_payment = total_payment_amount - payment_received;
  if (pending_payment > 0) {
    customer.pending_payment += pending_payment;
  }

  if (pending_payment < 0) {
    const excessPayment = Math.abs(pending_payment);

    const paymentToDeposite = Math.abs(
      excessPayment - customer.pending_payment
    );

    if (excessPayment > customer.pending_payment) {
      customer.pending_payment = 0;
    }

    if (paymentToDeposite > 0) {
      customer.deposit += paymentToDeposite;
    }
  }

  if (pending_payment !== 0 || pending_payment <= 0) {
    // Update customer data
    await prismaDB.customer.update({
      where: { cust_id },
      data: {
        pending_payment: customer.pending_payment,
        deposit: customer.deposit,
      },
    });
  }

  // Create sales entry
  const delivery = await prismaDB.sales.create({
    data: {
      delivered_by: emp_id,
      delivered_to: cust_id,
      truck_id: truck_id,
      full_delivered: full_cylinder_delivered,
      empty_delivered: empty_cylinder_delivered,
      empty_received: empty_received,
      total_amount_received: payment_received,
      bal_payment: pending_payment > 0 ? pending_payment : 0,
      payment_mode,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, delivery, "Delivered successfully"));
});

const getTodaysOpeningData = AsyncHandler(async (req, res) => {
  const { emp_id } = req.params;

  if (!emp_id) {
    return res.status(400).json(new ApiError(400, "Unauthorized access"));
  }

  // Get today's date in ISO format without the time
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  try {
    // Fetch the data for the current day
    const data = await prismaDB.employeeOpeningDetails.findFirst({
      where: {
        emp_id: emp_id,
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        total_full_cylinders: true,
        total_empty_cylinders: true,
        assigned_area: true,
        created_at: true,
        Employee: {
          select: {
            emp_name: true,
            emp_contact: true,
          },
        },
        Truck: {
          select: {
            truck_id: true,
            truck_name: true,
            truck_number: true,
          },
        },
      },
    });

    if (!data) {
      return res
        .status(404)
        .json(new ApiError(404, "Data not found for today"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, data, "Data fetched successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
});
const getTodaysAllDeliveries = AsyncHandler(async (req, res) => {
  const { emp_id } = req.params;

  if (!emp_id) {
    return res.status(400).json(new ApiError(400, "Unauthorized access"));
  }

  // Get today's start and end timestamps
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  try {
    // Fetch today's deliveries by the employee
    const deliveries = await prismaDB.sales.findMany({
      where: {
        delivered_by: emp_id, // Match the employee ID who made the delivery
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        full_delivered: true,
        empty_delivered: true,
        Customer: {
          select: {
            cust_id: true,
            cust_name: true,
          },
        },
      },
    });

    if (!deliveries || deliveries.length === 0) {
      return res
        .status(404)
        .json(new ApiError(404, "No record found for today"));
    }

    // Return the data if deliveries exist
    return res
      .status(200)
      .json(new ApiResponse(200, deliveries, "Data found successfully"));
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
});

export {
  loginEmployee,
  logoutEmployee,
  getAreasAndTrucks,
  CreateOpeningDetails,
  deliverCylinderToCustomer,
  getCustomerDetails,
  getTodaysOpeningData,
  getTodaysAllDeliveries,
};
