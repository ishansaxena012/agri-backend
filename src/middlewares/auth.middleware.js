import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../modules/user/user.model.js";
import { verifyToken } from "../utils/jwt.js"; 

const authMiddleware = asyncHandler(async (req, res, next) => {
  // 1.Authorization header
  const authHeader = req.headers.authorization;

  // 2. Check if it exists and follows the 'Bearer <token>' format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized: Access denied, token missing");
  }

  // 3. Extract the actual token string
  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    // 4. Use your Utility to verify against JWT_SECRET
    decoded = verifyToken(token);
  } catch (error) {
    throw new ApiError(401, "Unauthorized: Your session has expired, please login again");
  }

  // 5. Find the user and attach to the request object
  const user = await User.findById(decoded.userId).select("-googleId");

  if (!user) {
    throw new ApiError(401, "Unauthorized: User account no longer exists");
  }

  req.user = user;
  next();
});

export default authMiddleware;