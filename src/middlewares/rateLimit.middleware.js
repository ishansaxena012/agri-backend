import rateLimit from "express-rate-limit";

export const aiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 5, 
  message: "AgriAI needs a short break. Please try again in a minute.",
  standardHeaders: true,
  legacyHeaders: false,
});