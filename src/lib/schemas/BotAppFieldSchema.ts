import { z } from "zod";
import { BaseEntitySchema } from "./BaseEntitySchema";

export const BotAppFieldSchema = BaseEntitySchema.extend({
  key: z.string(),
  value: z.string().nullable(),
  botAppId: z.string(),
  appFieldId: z.string(),
});

export type BotAppFieldType = z.infer<typeof BotAppFieldSchema>;
export type BotAppFieldInputType = z.input<typeof BotAppFieldSchema>;
