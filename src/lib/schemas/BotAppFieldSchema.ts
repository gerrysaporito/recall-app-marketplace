import { z } from "zod";
import { BaseEntitySchema } from "./BaseEntitySchema";

export const BotAppFieldSchema = BaseEntitySchema.extend({
  value: z.string().optional(),
  botAppId: z.string(),
  appFieldId: z.string(),
});

export type BotAppFieldType = z.infer<typeof BotAppFieldSchema>;
export type BotAppFieldInputType = z.input<typeof BotAppFieldSchema>;
