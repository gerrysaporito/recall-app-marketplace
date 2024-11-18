import { z } from "zod";
import { BaseEntitySchema } from "./BaseEntitySchema";

export const BotTriggerEventSchema = BaseEntitySchema.extend({
  recallBotId: z.string(),
  args: z.string(),
});

export type BotTriggerEventType = z.infer<typeof BotTriggerEventSchema>;
export type BotTriggerEventInputType = z.input<typeof BotTriggerEventSchema>;
