import { z } from "zod";
import { BaseEntitySchema } from "./BaseEntitySchema";
import { AppDataFieldSchema } from "./AppDataFieldSchema";
import { WebhookSchema } from "./WebhookSchema";

export const AppSchema = BaseEntitySchema.extend({
  name: z.string(),
  userId: z.string(),
  webhookId: z.string(),
  dataFields: z.array(AppDataFieldSchema),
  webhook: WebhookSchema,
});

export type AppType = z.infer<typeof AppSchema>;
export type AppInputType = z.input<typeof AppSchema>;
