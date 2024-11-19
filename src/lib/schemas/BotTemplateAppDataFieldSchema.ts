import { z } from "zod";
import { BaseEntitySchema } from "./BaseEntitySchema";

export const BotTemplateAppDataFieldSchema = BaseEntitySchema.extend({
  type: z.enum(["command", "constant", "editable"]),
  key: z.string(),
  value: z.string().nullish(),
  botTemplateAppId: z.string(),
  appDataFieldId: z.string(),
});

export type BotTemplateAppFieldType = z.infer<
  typeof BotTemplateAppDataFieldSchema
>;
export type BotTemplateAppFieldInputType = z.input<
  typeof BotTemplateAppDataFieldSchema
>;
