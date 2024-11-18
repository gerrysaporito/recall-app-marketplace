import { z } from 'zod';

import { WebhookEventStatus } from '@/lib/constants/WebhookEventStatus';
import { WebhookEventType } from '@/lib/constants/WebhookEventType';
import { BaseEntitySchema } from '@/lib/schemas/BaseEntitySchema';

export const WebhookEventSchema = BaseEntitySchema.extend({
  webhookId: z.string(),
  userId: z.string(),
  status: z.nativeEnum(WebhookEventStatus),
  type: z.nativeEnum(WebhookEventType),
  requestBody: z.any().nullish(),
  responseStatus: z.number().nullish(),
  responseBody: z.any().nullish(),
  requestSentAt: z.date().nullish(),
  responseReceivedAt: z.date().nullish(),
  retryCount: z.number().int().nullish(),
  lastRetryAt: z.date().nullish(),
  failureReason: z.string().nullish(),
});
