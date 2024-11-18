import { z } from "zod";
import { BaseEntitySchema } from "./BaseEntitySchema";

export const AppDataFieldSchema = BaseEntitySchema.extend({
  key: z.string(),
  value: z.string().optional(),
  appId: z.string(),
});

export type AppDataType = z.infer<typeof AppDataFieldSchema>;
export type AppDataFieldInputType = z.input<typeof AppDataFieldSchema>;
