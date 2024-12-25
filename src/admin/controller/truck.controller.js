import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { AsyncHandler } from "../../utils/AsyncHandler.js";
import { prismaDB } from "../../DB/prismaClient.js";

const addTruck = AsyncHandler(async (req, res) => {
  const { truck_name, truck_number, capacity } = req.body;

  // Validate required fields
  if (!(truck_name && truck_number)) {
    throw new ApiError(400, "Truck name and Truck number are required");
  }

  // Check if the truck already exists
  const isTruckAlreadyExists = await prismaDB.truck.findUnique({
    where: {
      truck_number,
    },
  });

  if (isTruckAlreadyExists) {
    throw new ApiError(409, `Truck ${truck_number} already exists`);
  }

  // Add the new truck
  const addedTruck = await prismaDB.truck.create({
    data: {
      truck_name,
      truck_number,
      capacity: capacity || null, // Ensure capacity is handled gracefully
    },
  });

  // Return the response
  return res
    .status(201)
    .json(new ApiResponse(201, addedTruck, "Truck added successfully"));
});

const updateTruck = AsyncHandler(async (req, res) => {
  const { truck_id, truck_name, truck_number, capacity, is_active } = req.body;

  // Validate that `truck_id` is provided
  if (!truck_id) {
    throw new ApiError(400, "Truck ID is required");
  }

  // Check if the truck exists
  const existingTruck = await prismaDB.truck.findUnique({
    where: { truck_id },
  });

  if (!existingTruck) {
    throw new ApiError(404, "Truck not found");
  }

  // Build dynamic update data
  const updateData = {};
  if (truck_name !== undefined) updateData.truck_name = truck_name;
  if (truck_number !== undefined) updateData.truck_number = truck_number;
  if (capacity !== undefined) updateData.capacity = capacity;
  if (is_active !== undefined) updateData.is_active = is_active;

  // Perform the update
  const updatedTruck = await prismaDB.truck.update({
    where: { truck_id },
    data: updateData,
  });

  // Return the updated truck details
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedTruck, "Truck details updated successfully")
    );
});

const deleteTruck = AsyncHandler(async (req, res) => {
  const { truck_id } = req.body;

  // Validate if `truck_id` is provided
  if (!truck_id) {
    throw new ApiError(400, "Truck ID is required");
  }

  // Check if the truck exists
  const existingTruck = await prismaDB.truck.findUnique({
    where: { truck_id },
  });

  if (!existingTruck) {
    throw new ApiError(404, "Truck not found");
  }

  // Delete the truck
  const deletedTruck = await prismaDB.truck.delete({
    where: { truck_id },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, deletedTruck, "Truck deleted successfully"));
});

const getAllTrucks = AsyncHandler(async (req, res) => {
  const allTrucks = await prismaDB.truck.findMany();

  if (allTrucks.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No trucks found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, allTrucks, "Trucks fetched successfully"));
});
const getTruckById = AsyncHandler(async (req, res) => {
  const { truck_id } = req.params;

  if (!truck_id) {
    throw new ApiError(400, "Truck ID is required");
  }

  // Fetch truck details
  const truck = await prismaDB.truck.findUnique({
    where: {
      truck_id,
    },
  });

  if (!truck) {
    throw new ApiError(404, `No truck found with ID: ${truck_id}`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, truck, "Truck details fetched successfully"));
});

export { addTruck, updateTruck, deleteTruck, getAllTrucks, getTruckById };
