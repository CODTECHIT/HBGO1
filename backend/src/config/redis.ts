import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;
let isRedisConnected = false;

export const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          // If it fails to connect more than 3 times, give up to avoid hanging
          if (retries > 3) {
            console.warn("Redis connection failed after 3 retries. Operating without cache.");
            return new Error("Retry time exhausted");
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error", err.message);
      isRedisConnected = false;
    });

    redisClient.on("connect", () => {
      console.log(`Redis connected successfully to ${redisUrl}`);
      isRedisConnected = true;
    });

    await redisClient.connect();
  } catch (error) {
    console.warn("Could not connect to Redis. Caching will be bypassed.", error);
    isRedisConnected = false;
  }
};

export const getRedisClient = () => redisClient;
export const getIsRedisConnected = () => isRedisConnected;
