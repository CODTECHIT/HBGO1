import { Request, Response, NextFunction } from "express";
import { getRedisClient, getIsRedisConnected } from "../config/redis";

export const cache = (durationInSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Graceful fallback: If Redis is offline, bypass cache entirely
    if (!getIsRedisConnected()) {
      return next();
    }

    const redisClient = getRedisClient();
    if (!redisClient) {
      return next();
    }

    // Create a unique key based on the full URL (includes query parameters)
    const key = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }

      // If not in cache, we intercept the res.json method to save the data before sending
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        // Only cache successful requests
        if (res.statusCode === 200 || res.statusCode === 201) {
          redisClient.setEx(key, durationInSeconds, JSON.stringify(body))
            .catch(err => console.error("Redis set error", err));
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error("Redis Cache Middleware Error", error);
      // Graceful fallback on error during get
      next();
    }
  };
};

export const clearCachePrefix = async (prefix: string) => {
  if (!getIsRedisConnected()) return;
  const redisClient = getRedisClient();
  if (!redisClient) return;

  try {
    const keys = await redisClient.keys(`cache:${prefix}*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error(`Failed to clear cache for prefix ${prefix}`, error);
  }
};
