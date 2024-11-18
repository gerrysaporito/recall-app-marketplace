import { z } from "zod";
import { BaseEntitySchema } from "./BaseEntitySchema";

export const BotAppSchema = BaseEntitySchema.extend({
  botId: z.string(),
  appId: z.string(),
});

export type BotAppType = z.infer<typeof BotAppSchema>;
export type BotAppInputType = z.input<typeof BotAppSchema>;
