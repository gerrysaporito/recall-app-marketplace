import { z } from "zod";
import { BaseEntitySchema } from "./BaseEntitySchema";
import { BotAppDataFieldSchema } from "./BotAppDataFieldSchema";
import { AppSchema } from "./AppSchema";

export const BotAppSchema = BaseEntitySchema.extend({
  botId: z.string(),
  appId: z.string(),
  botAppDataFields: BotAppDataFieldSchema.array(),
  app: AppSchema,
});

export type BotAppType = z.infer<typeof BotAppSchema>;
export type BotAppInputType = z.input<typeof BotAppSchema>;
