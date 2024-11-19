import { z } from "zod";
import { BaseEntitySchema } from "./BaseEntitySchema";
import { BotTemplateAppSchema } from "./BotTemplateAppSchema";

export const BotTemplateSchema = BaseEntitySchema.extend({
  name: z.string(),
  userId: z.string(),
  userEmail: z.string(),
  botTemplateApps: BotTemplateAppSchema.array(),
});

export type BotTemplateType = z.infer<typeof BotTemplateSchema>;
export type BotTemplateInputType = z.input<typeof BotTemplateSchema>;
