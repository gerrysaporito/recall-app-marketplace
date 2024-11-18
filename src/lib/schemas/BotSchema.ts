import { z } from "zod";
import { BaseEntitySchema } from "./BaseEntitySchema";

export const BotSchema = BaseEntitySchema.extend({
  name: z.string(),
  meetingUrl: z.string(),
  recallBotId: z.string(),
  userId: z.string(),
});

export type BotType = z.infer<typeof BotSchema>;
export type BotInputType = z.input<typeof BotSchema>;
