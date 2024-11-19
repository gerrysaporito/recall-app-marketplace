import { z } from "zod";
import { BaseEntitySchema } from "./BaseEntitySchema";
import { BotTemplateAppDataFieldSchema } from "./BotTemplateAppDataFieldSchema";
import { AppSchema } from "./AppSchema";

export const BotTemplateAppSchema = BaseEntitySchema.extend({
  appId: z.string(),
  app: AppSchema,
  botTemplateId: z.string(),
  botTemplateAppDataFields: BotTemplateAppDataFieldSchema.array(),
});

export type BotTemplateAppType = z.infer<typeof BotTemplateAppSchema>;
export type BotTemplateAppInputType = z.input<typeof BotTemplateAppSchema>;
