import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import Equipment from "./equipment.model.js"; 
import {
  createEquipmentService,
  getNearbyEquipmentService,
  getMyEquipmentsService
} from "./equipment.service.js";

export const createEquipment = asyncHandler(async (req, res) => {
  const equipment = await createEquipmentService(req.user, req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, equipment, "Equipment listed successfully"));
});

export const getNearbyEquipment = asyncHandler(async (req, res) => {
  const lat = req.query.latitude || req.user?.location?.coordinates[1];
  const lng = req.query.longitude || req.user?.location?.coordinates[0];
  const category = req.query.category; 
  const radius = parseInt(req.query.radius) || 90;

  // 2. Validation
  if (!lat || !lng) {
    throw new ApiError(400, "Location coordinates are required to find nearby equipment.");
  }

  // 3. Build Filters 
  const filters = (category && category.toLowerCase() !== 'all') ? { category } : {};

  const equipments = await getNearbyEquipmentService(
    {
      type: "Point",
      coordinates: [parseFloat(lng), parseFloat(lat)] 
    },
    filters,
    radius
  );

  return res
    .status(200)
    .json(new ApiResponse(200, equipments, `Found equipment within ${radius}km`));
});

export const getMyEquipments = asyncHandler(async (req, res) => {
  const equipments = await getMyEquipmentsService(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, equipments, "Your equipment listings fetched"));
});

export const getEquipmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Format Validation
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid Equipment ID format");
  }

  // 2. Database Fetch (Corrected from 'equipment.findById' to 'Equipment.findById')
  const equipment = await Equipment.findById(id)
    .populate("owner", "name mobileNumber profileImage location")
    .lean();

  if (!equipment) {
    throw new ApiError(404, "Equipment not found");
  }

  // 3. Availability Check
  if (!equipment.isActive) {
    throw new ApiError(400, "This equipment is currently not available for rent.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, equipment, "Equipment details fetched successfully"));
});