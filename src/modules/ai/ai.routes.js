import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import { aiRateLimiter } from "../../middlewares/rateLimit.middleware.js"; 
import { equipmentSuggestionSchema } from "./ai.validation.js";
import { getEquipmentSuggestions } from "./ai.controller.js";

const router = express.Router();

router.post(
  "/equipment-suggestions",
  authMiddleware,         
  aiRateLimiter,         
  validate(equipmentSuggestionSchema), 
  getEquipmentSuggestions
);

export default router;