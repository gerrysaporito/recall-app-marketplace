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

export type BotTemplateType = z.infer<typeof BotSchema>;
export type BotTemplateInputType = z.input<typeof BotSchema>;
