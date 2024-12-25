import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { AsyncHandler } from "../../utils/AsyncHandler.js";
import { prismaDB } from "../../DB/prismaClient.js";

const addCustomer = AsyncHandler(async (req, res) => {
  const { cust_name, area_no, area_name } = req.body;

  console.log(req.body)

  // Validate input fields
  if (!(cust_name && area_name && area_no)) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if customer already exists (optional)
  const existingCustomer = await prismaDB.customer.findFirst({
    where: {
      cust_name, // Or other field based on your requirement (e.g., area_name)
      area_name,
      area_no
    },
  });

  if (existingCustomer) {
    throw new ApiError(409, `Customer with name ${cust_name} already exists`);
  }

  // Add new customer
  const addedCustomer = await prismaDB.customer.create({
    data: {
      cust_name,
      area_no,
      area_name,
    },
  });

  // Error handling in case of failure
  if (!addedCustomer) {
    throw new ApiError(500, "Customer could not be added");
  }

  // Return success response
  return res
    .status(201) // 201 is more appropriate for resource creation
    .json(new ApiResponse(200, addedCustomer, "Customer added successfully"));
});

const updateCustomer = AsyncHandler(async (req, res) => {
  const {
    cust_id,
    cust_name,
    area_name,
    area_no,
    pending_empty,
    pending_payment,
    deposit,
  } = req.body;

  // Check if cust_id is provided
  if (!cust_id) {
    throw new ApiError(400, "Customer ID is required");
  }

  // Check if the customer exists
  const isCustomerExists = await prismaDB.customer.findUnique({
    where: {
      cust_id,
    },
  });

  if (!isCustomerExists) {
    throw new ApiError(404, "Customer not found");
  }

  // Update customer data
  const updatedCustomer = await prismaDB.customer.update({
    where: {
      cust_id,
    },
    data: {
      cust_name,
      area_name,
      area_no:Number(area_no),
      pending_empty:Number(pending_empty),
      pending_payment:Number(pending_payment),
      deposit:Number(deposit),
    },
  });

  // If the update fails
  if (!updatedCustomer) {
    throw new ApiError(500, "Failed to update customer information");
  }

  // Return success response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedCustomer,
        "Customer data updated successfully"
      )
    );
});

const deleteCustomer = AsyncHandler(async (req, res) => {
  const { cust_id } = req.params;

  // Check if cust_id is provided
  if (!cust_id) {
    throw new ApiError(400, "Customer ID is required");
  }

  // Check if the customer exists
  const isCustomerExists = await prismaDB.customer.findUnique({
    where: {
      cust_id,
    },
  });

  if (!isCustomerExists) {
    throw new ApiError(404, "Customer not found");
  }

  // Delete the customer
  await prismaDB.customer.delete({
    where: {
      cust_id,
    },
  });

  // Return success response
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Customer deleted successfully"));
});

const getCustomers = AsyncHandler(async (req, res) => {
  const customers = await prismaDB.customer.findMany({
    select: {
      cust_id: true,
      cust_name: true,
      pending_empty: true,
      pending_payment: true,
      area_name: true,
      area_no: true,
      deposit: true,
    }, // Limit the number of records returned
  });

  const totalCount = await prismaDB.customer.count(); // Get the total number of customers

  return res
    .status(200)
    .json(
      new ApiResponse(200, customers, "All customers fetched successfully")
    );
});

const getCustomerById = AsyncHandler(async (req, res) => {
  const { cust_id } = req.params;

  // Validate that cust_id is provided
  if (!cust_id) {
    throw new ApiError(400, "Customer ID is required");
  }

  // Fetch the customer from the database
  const customer = await prismaDB.customer.findUnique({
    where: {
      cust_id,
    },
  });

  // Handle case where customer is not found
  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  // Return the customer details if found
  return res
    .status(200)
    .json(
      new ApiResponse(200, customer, "Customer details fetched successfully")
    );
});

export {
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomers,
  getCustomerById,
};
