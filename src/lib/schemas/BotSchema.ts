import { z } from "zod";
import { BaseEntitySchema } from "./BaseEntitySchema";
import { BotAppSchema } from "./BotAppSchema";

export const BotSchema = BaseEntitySchema.extend({
  name: z.string(),
  meetingUrl: z.string(),
  recallBotId: z.string(),
  userId: z.string(),
  userEmail: z.string(),
  botApps: BotAppSchema.array(),
});

export type BotType = z.infer<typeof BotSchema>;
export type BotInputType = z.input<typeof BotSchema>;
