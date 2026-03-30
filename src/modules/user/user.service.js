import User from "./user.model.js";
import ApiError from "../../utils/ApiError.js";

export const completeProfileService = async (userId, data) => {
  const { mobileNumber, address, latitude, longitude } = data;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        mobileNumber,
        address,
        location: {
          type: "Point",
          coordinates: [longitude, latitude], 
        },
        isProfileComplete: true,
      },
    },
    { new: true, runValidators: true } 
  ).select("-googleId");

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return updatedUser;
};

export const getCurrentUserService = async (userId) => {
  const user = await User.findById(userId).select("-googleId").lean();
  if (!user) throw new ApiError(404, "User not found");
  return user;
};