import { z } from "zod";
import { BaseEntitySchema } from "./BaseEntitySchema";
import { BotAppFieldSchema } from "./BotAppFieldSchema";

export const BotAppSchema = BaseEntitySchema.extend({
  botId: z.string(),
  appId: z.string(),
  botAppFields: BotAppFieldSchema.array(),
});

export type BotAppType = z.infer<typeof BotAppSchema>;
export type BotAppInputType = z.input<typeof BotAppSchema>;
