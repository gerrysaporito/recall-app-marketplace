import { z } from "zod";

import { BaseEntitySchema } from "./BaseEntitySchema";

export const WebhookSchema = BaseEntitySchema.extend({
  url: z.string().url(),
  userId: z.string(),
});

export type WebhookType = z.infer<typeof WebhookSchema>;
export type WebhookInputType = z.input<typeof WebhookSchema>;
