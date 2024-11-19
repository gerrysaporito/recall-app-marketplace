import { z } from "zod";
import { BaseEntitySchema } from "./BaseEntitySchema";
import { BotTemplateSchema } from "./BotTemplateSchema";

export const BotSchema = BaseEntitySchema.extend({
  name: z.string(),
  meetingUrl: z.string(),
  recallBotId: z.string(),
  botTemplateId: z.string(),
  botTemplate: BotTemplateSchema,
});

export type BotType = z.infer<typeof BotSchema>;
export type BotInputType = z.input<typeof BotSchema>;
