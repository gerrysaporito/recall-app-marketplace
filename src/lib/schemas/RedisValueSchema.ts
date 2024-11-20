import { z } from "zod";

/**
 * Enum representing valid Redis types.
 *
 * This enum is used to define and restrict the types that can be used
 * in the RedisGenericValueSchema. Each enum value corresponds to a specific
 * data schema and represents a unique type in the Redis system.
 */
export enum RedisValueType {
  bot_processingLock = "bot.processingLock",
}
/**
 * Union schema combining different Redis types with their associated data schemas.
 *
 * This union allows for the validation of objects with different structures based on
 * the 'type' field's value. Each schema in the union corresponds to a specific
 * RedisValueType value and validates the 'data' field against its associated schema.
 */
export const RedisValueSchema = z.union([
  z.object({
    type: z.literal(RedisValueType.bot_processingLock),
    data: z.object({}),
  }),
  z.object({
    type: z.literal(RedisValueType.bot_processingLock),
    data: z.object({}),
  }),
]);
