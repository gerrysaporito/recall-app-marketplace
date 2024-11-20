import { RedisValueSchema } from "@/lib/schemas/RedisValueSchema";
import type { z } from "zod";

import { redis } from "@/config/redis";

/**
 * A service class for handling Redis operations with data validation
 * using Zod schemas.
 */
export const RedisService = {
  /**
   * Retrieves a value from Redis and validates it against RedisValueSchema.
   * @param args - Contains the 'key' to retrieve.
   * @returns The validated value from Redis.
   */
  cacheGet: async function (args: { key: string }) {
    const { key } = args;
    const value = await redis.get(key);
    if (!value) {
      return null;
    }

    const validationResult = RedisValueSchema.safeParse(JSON.parse(value));
    if (!validationResult.success) {
      const error = `Invalid redis value for key: ${key}`;
      throw new Error(error, { cause: validationResult.error });
    }

    return validationResult.data;
  },

  /**
   * Sets a value in Redis without expiration.
   * @param args - Contains the 'key', 'value', and optional 'ttlSeconds'.
   */
  cacheSetNoExpiration: async function (args: {
    key: string;
    value: z.infer<typeof RedisValueSchema>;
  }) {
    const { key, value } = args;
    await this.validateAndCacheSet(key, JSON.stringify(value));
  },

  /**
   * Sets a value in Redis with a time-to-live (TTL).
   * @param args - Contains the 'key', 'value', and 'ttlSeconds'.
   */
  cacheSet: async function (args: {
    key: string;
    value: z.infer<typeof RedisValueSchema>;
    ttlSeconds: number;
  }): Promise<void> {
    const { key, value, ttlSeconds } = args;
    await this.validateAndCacheSet(key, JSON.stringify(value), ttlSeconds);
  },

  /**
   * Deletes a key from Redis.
   * @param args - Contains the 'key' to delete.
   * @returns The number of keys that were removed.
   */
  cacheDel: async function (args: { key: string }): Promise<number | null> {
    const { key } = args;
    return await redis.del(key);
  },

  /**
   * Increments the number value of a key by one.
   * @param args - Contains the 'key' to increment.
   * @returns The new value after incrementing.
   */
  cacheIncr: async function (args: { key: string }): Promise<number> {
    const { key } = args;
    return await redis.incr(key);
  },

  /**
   * Increments the number value of a key by one and sets an expiration.
   * @param args - Contains the 'key' to increment and 'ttlSeconds' for expiration.
   * @returns The new value after incrementing.
   */
  cacheIncrWithExpiration: async function (args: {
    key: string;
    ttlSeconds: number;
  }): Promise<number> {
    const { key, ttlSeconds } = args;
    const res = await redis.incr(key);
    await redis.expire(key, ttlSeconds);
    return res;
  },

  /**
   * Acquires a lock with a key in Redis. If the lock (key) already exists,
   * it won't be acquired (returns false). The lock auto-expires after 'ttlSeconds' to
   * prevent indefinite locking, important for handling process failures.
   *
   * @param args - Contains:
   *   - `key`: The key to lock.
   *   - `ttlSeconds`: Time-to-live for the lock in seconds.
   * @returns `true` if the lock was successfully acquired (set), `false` otherwise.
   */
  acquireLock: async function (args: {
    key: string;
    ttlSeconds: number;
  }): Promise<boolean> {
    const { key, ttlSeconds } = args;
    const res = await redis.set(key, "true", "EX", ttlSeconds, "NX");
    return !!res;
  },

  /**
   * Checks if a lock exists for the given key.
   * @param args - Contains the 'key' to check.
   * @returns true if the lock exists.
   */
  isLockSet: async function (args: { key: string }): Promise<boolean> {
    const { key } = args;
    const lockExists = await redis.exists(key);
    return lockExists === 1;
  },

  /**
   * Releases a lock by key name.
   * @param args - Contains the 'key' to release.
   * @returns true if the lock existed and was released, else false if no lock existed.
   */
  releaseLock: async function (args: { key: string }): Promise<boolean> {
    const { key } = args;
    return (await redis.del(key)) === 1;
  },

  /**
   * Validates the given value against RedisValueSchema and saves it in Redis.
   * @param key - The key under which to save the value.
   * @param value - The value to save.
   * @param ttlSeconds - Optional TTL for the key.
   */
  validateAndCacheSet: async function (
    key: string,
    value: string,
    ttlSeconds?: number
  ): Promise<void> {
    const validationResult = RedisValueSchema.safeParse(JSON.parse(value));
    if (!validationResult.success) {
      throw validationResult.error;
    }

    if (ttlSeconds !== undefined) {
      await redis.setex(key, ttlSeconds, value);
    } else {
      await redis.set(key, value);
    }
  },
};
