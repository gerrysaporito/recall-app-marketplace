import { z } from "zod";
import { BaseEntitySchema } from "./BaseEntitySchema";

export const BotTriggerEventSchema = BaseEntitySchema.extend({
  actionName: z.string(),
  recordingId: z.string(),
  speakerName: z.string().nullable(),
  speakerId: z.string(),
  recallBotId: z.string(),
  data: z.record(z.string(), z.string()),
  botId: z.string(),
  botTemplateAppId: z.string(),
  triggerEventId: z.string(),
});

export type BotTriggerEventType = z.infer<typeof BotTriggerEventSchema>;
export type BotTriggerEventInputType = z.input<typeof BotTriggerEventSchema>;
