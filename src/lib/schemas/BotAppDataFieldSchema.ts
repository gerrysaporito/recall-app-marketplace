import { z } from "zod";
import { BaseEntitySchema } from "./BaseEntitySchema";

export const BotAppDataFieldSchema = BaseEntitySchema.extend({
  type: z.enum(["command", "constant", "editable"]),
  key: z.string(),
  value: z.string().nullish(),
  botAppId: z.string(),
  appDataFieldId: z.string(),
});

export type BotAppFieldType = z.infer<typeof BotAppDataFieldSchema>;
export type BotAppFieldInputType = z.input<typeof BotAppDataFieldSchema>;
