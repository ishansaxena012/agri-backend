import dotenv from "dotenv";
import path from "path";

// 1. Force load from the root .env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const _config = {
  // Server
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",

  // Databases
  MONGO_URI: process.env.MONGO_URI,
  REDIS_URL: process.env.REDIS_URL || "redis://127.0.0.1:6379",

  // Auth & Security
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

  // AI Service
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  // Cloudinary (Image Uploads)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // Payment Gateway (Razorpay)
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
};

//  Fail-Safe: Check for missing critical keys
const criticalKeys = [
  "MONGO_URI", 
  "JWT_SECRET", 
  "GEMINI_API_KEY", 
  "GOOGLE_CLIENT_ID",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
];

criticalKeys.forEach((key) => {
  if (!_config[key]) {
    console.error(`❌ CRITICAL ERROR: ${key} is missing in .env`);
    process.exit(1);
  }
});

export const env = Object.freeze(_config);