import Equipment from "./equipment.model.js";
import ApiError from "../../utils/ApiError.js";
import redisClient from "../../config/redis.js";

const RADIUS_IN_METERS = 90000; 
const CACHE_KEY_ALL = "equipment:list:all";

export const createEquipmentService = async (user, data) => {
  if (!user.isProfileComplete) {
    throw new ApiError(403, "Complete profile first");
  }

  const { title, description, type, pricePerDay, latitude, longitude, availableFrom, availableTo, images = [] } = data;

  const finalLng = longitude ?? user.location.coordinates[0];
  const finalLat = latitude ?? user.location.coordinates[1];

  if (new Date(availableFrom) >= new Date(availableTo)) {
    throw new ApiError(400, "Invalid availability dates");
  }

  const equipment = await Equipment.create({
    owner: user._id,
    title,
    description,
    type: type.toLowerCase(),
    pricePerDay,
    images,
    location: { type: "Point", coordinates: [finalLng, finalLat] },
    availableFrom: new Date(availableFrom),
    availableTo: new Date(availableTo)
  });

  //  CACHE BUSTING: Clear the list whenever new gear is added
  await redisClient.del(CACHE_KEY_ALL);
  console.log("🧹 Cache cleared due to new listing");

  return equipment;
};


export const getEquipmentListService = async () => {
  // 1. Try Cache
  const cachedData = await redisClient.get(CACHE_KEY_ALL);
  if (cachedData) return JSON.parse(cachedData);

  // 2. Database Fallback
  const equipment = await Equipment.find({ isActive: true })
    .sort({ createdAt: -1 })
    .populate("owner", "name mobileNumber")
    .lean();

  // 3. Set Cache (10 mins)
  await redisClient.setEx(CACHE_KEY_ALL, 600, JSON.stringify(equipment));
  return equipment;
};


export const getNearbyEquipmentService = async (userLocation, filters = {}) => {
  const query = {
    isActive: true,
    location: {
      $near: {
        $geometry: userLocation,
        $maxDistance: RADIUS_IN_METERS
      }
    }
  };

  if (filters.type) query.type = filters.type.toLowerCase();

  return await Equipment.find(query)
    .populate("owner", "name mobileNumber address")
    .lean();
};

export const getMyEquipmentsService = async (userId) => {
  return await Equipment.find({ owner: userId }).sort({ createdAt: -1 });
};