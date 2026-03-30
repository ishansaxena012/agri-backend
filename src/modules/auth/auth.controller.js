import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { googleLoginService } from "./auth.service.js";

export const googleLogin = asyncHandler(async (req, res) => {
  const tokenToVerify = req.body.idToken || req.body.token;
  const result = await googleLoginService(tokenToVerify);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Login successful"));
});