import Redis from "ioredis";
import { env } from "@/config/env.mjs";

if (!global?.redis) {
  global.redis = new Redis(env.REDIS_URL, {
    ...(env.REDIS_URL.includes("localhost") ? {} : { tls: {} }),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}

const redis = global.redis;

export { redis };
