import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { getEquipmentSuggestionsService } from "./ai.service.js";

/**
 * @desc    Get AI-based equipment suggestions (Chat & RAG)
 * @route   POST /api/ai/equipment-suggestions
 * @access  Private
 */
export const getEquipmentSuggestions = asyncHandler(async (req, res) => {
  // 1. Pass both req.body (the message) AND req.user (user context)
  const result = await getEquipmentSuggestionsService(req.body, req.user);

  // 2. Return a standardized response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200, 
        result, 
        "AI response generated successfully"
      )
    );
});