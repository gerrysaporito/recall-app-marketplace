import { z } from "zod";
import { BaseEntitySchema } from "./BaseEntitySchema";
import { AppDataFieldSchema } from "./AppDataFieldSchema";

export const AppSchema = BaseEntitySchema.extend({
  name: z.string(),
  userId: z.string(),
  webhookId: z.string(),
  dataFields: z.array(AppDataFieldSchema),
});
