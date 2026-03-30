import mongoose from "mongoose";
import redisClient from "../../config/redis.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const checkHealth = asyncHandler(async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";

  let redisStatus = "Disconnected";
  try {
    const ping = await redisClient.ping();
    if (ping === "PONG") redisStatus = "Connected (Cloud)";
  } catch (err) {
    redisStatus = `Error: ${err.message}`;
  }

  const healthInfo = {
    status: "Active",
    uptime: `${process.uptime().toFixed(2)}s`,
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      redis: redisStatus,
    },
    server: {
      memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
      nodeVersion: process.version,
    }
  };

  return res.status(200).json(
    new ApiResponse(200, healthInfo, "System Health Check Successful")
  );
}); 