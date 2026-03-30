import redisClient from "../config/redis.js";

export const acquireLock = async (key, ttl = 5000) => {
  const lockKey = `lock:${key}`;
  const acquired = await redisClient.set(lockKey, "locked", {
    NX: true,
    PX: ttl,
  });
  return acquired === "OK";
};

export const releaseLock = async (key) => {
  await redisClient.del(`lock:${key}`);
};