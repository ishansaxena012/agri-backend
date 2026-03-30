import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import {
  completeProfileService,
  getCurrentUserService
} from "./user.service.js";

/**
 * @desc    Finalize user profile with location and contact info
 * @route   PUT /api/user/complete-profile
 * @access  Private
 */
export const completeProfile = asyncHandler(async (req, res) => {
  const updatedUser = await completeProfileService(
    req.user._id, 
    req.body
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile completed successfully"));
});

/**
 * @desc    Get logged-in user details
 * @route   GET /api/user/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await getCurrentUserService(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});