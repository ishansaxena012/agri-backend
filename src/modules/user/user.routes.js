import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import { completeProfileSchema } from "./user.validation.js";
import {
  completeProfile,
  getCurrentUser
} from "./user.controller.js";

const router = express.Router();

/**
 * @route   GET /api/user/me
 * @desc    Get current authenticated user profile
 * @access  Private
 */
router.get("/me", authMiddleware, getCurrentUser);

/**
 * @route   PUT /api/user/complete-profile
 * @desc    Update user profile with contact and GeoJSON location
 * @access  Private
 */
router.put(
  "/complete-profile",
  authMiddleware,
  validate(completeProfileSchema), 
  completeProfile
);

export default router;