import { z } from "zod";
import { BaseEntitySchema } from "./BaseEntitySchema";

export const AppDataFieldSchema = BaseEntitySchema.extend({
  type: z.enum(["command", "constant", "editable"]),
  key: z.string(),
  value: z.string().nullish(),
  appId: z.string(),
});

export type AppDataType = z.infer<typeof AppDataFieldSchema>;
export type AppDataFieldInputType = z.input<typeof AppDataFieldSchema>;
