import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { AsyncHandler } from "../../utils/AsyncHandler.js";
import { prismaDB } from "../../DB/prismaClient.js";

const addEmployee = AsyncHandler(async (req, res) => {
  const { emp_name, emp_contact, username, password } = req.body;

  // Validate input fields
  if (!emp_name || !username || !password) {
    throw new ApiError(
      400,
      "All fields (emp_name, username, password) are required"
    );
  }

  // Check if the username already exists
  const isEmployeeAlreadyExists = await prismaDB.employee.findUnique({
    where: { username },
  });

  if (isEmployeeAlreadyExists) {
    throw new ApiError(
      400,
      `Employee with username ${username} already exists`
    );
  }

  // Add the new employee
  const addedEmp = await prismaDB.employee.create({
    data: {
      emp_name,
      emp_contact,
      username,
      password, // here is risk storing password in a plain text
    },
  });

  if (!addedEmp) {
    throw new ApiError(500, "Employee cannot be added. Try again");
  }

  // Send a successful response
  return res
    .status(200)
    .json(new ApiResponse(200, addedEmp, "Employee added successfully"));
});

const updateEmployee = AsyncHandler(async (req, res) => {
  const { emp_id, emp_name, emp_contact, username, password, isAdmin } =
    req.body;

  // Validate required fields
  if (!emp_id) {
    throw new ApiError(400, "Employee ID is required");
  }

  if (!(emp_name && username && password)) {
    throw new ApiError(
      400,
      "All fields (emp_name, username, password) are required"
    );
  }

  // Check if the employee exists
  const existingEmployee = await prismaDB.employee.findUnique({
    where: { emp_id },
  });

  if (!existingEmployee) {
    throw new ApiError(404, `Employee with ID ${emp_id} does not exist`);
  }

  // Update the employee
  const updatedEmployee = await prismaDB.employee.update({
    where: { emp_id },
    data: {
      emp_name,
      emp_contact,
      username,
      password,
      isAdmin,
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedEmployee,
        "Employee information updated successfully"
      )
    );
});

const deleteEmployee = AsyncHandler(async (req, res) => {
  const { emp_id } = req.params;

  // Validate if emp_id is provided
  if (!emp_id) {
    throw new ApiError(400, "Employee ID is required");
  }

  // Check if the employee exists
  const employee = await prismaDB.employee.findUnique({
    where: { emp_id },
  });

  if (!employee) {
    throw new ApiError(404, `Employee with ID ${emp_id} not found`);
  }

  // Delete the employee
  await prismaDB.employee.delete({
    where: { emp_id },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Employee deleted successfully"));
});

const getAllEmployee = AsyncHandler(async (req, res) => {
  // Fetch all employees from the database
  const allEmployees = await prismaDB.employee.findMany();

  // Check if no employees exist
  if (!allEmployees || allEmployees.length === 0) {
    throw new ApiError(404, "No employees found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, allEmployees, "All employees fetched successfully")
    );
});

const getEmpById = AsyncHandler(async (req, res) => {
  const { emp_id } = req.params;

  // Ensure emp_id is provided
  if (!emp_id) {
    throw new ApiError(400, "Employee ID is required");
  }

  // Fetch the employee by ID
  const employee = await prismaDB.employee.findUnique({
    where: {
      emp_id,
    },
  });

  // If employee not found, throw an error
  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  // Return success response
  return res
    .status(200)
    .json(new ApiResponse(200, employee, "Employee data fetched successfully"));
});

// Export the function
export {
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getAllEmployee,
  getEmpById,
};
