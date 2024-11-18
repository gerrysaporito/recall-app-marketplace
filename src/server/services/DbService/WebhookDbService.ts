import type { Account, User, Webhook } from '@prisma/client';
import cuid from 'cuid';
import { z } from 'zod';
import { prisma } from '@/config/prisma';
import { WebhookEventDbService } from '@/server/services/DbService/WebhookEventDbService';
import { WebhookSchema } from '@/lib/schemas/WebhookSchema';
import { WebhookEventType } from '@/lib/constants/WebhookEventType';

const WriteWebhookSchema = WebhookSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const ReadWebhookSchema = WebhookSchema;

const CreateWebhookSchema = z.object({
  webhookId: z.string().optional(),
  webhookArgs: WriteWebhookSchema,
});

const UpdateWebhookSchema = z.object({
  webhookId: z.string(),
  webhookArgs: WriteWebhookSchema.partial(),
});

export const WebhookDbService = {
  webhookEvent: WebhookEventDbService,

  _parseWebhook: (args: {
    model: Webhook & { user: User };
  }): z.infer<typeof ReadWebhookSchema> => {
    const { model } = args;
    return ReadWebhookSchema.parse({
      ...model,
    } satisfies z.input<typeof ReadWebhookSchema>);
  },

  createWebhook: async function (
    args: z.infer<typeof CreateWebhookSchema>,
  ): Promise<{ webhook: z.infer<typeof ReadWebhookSchema> }> {
    const { webhookId, webhookArgs } = CreateWebhookSchema.parse(args);
    const webhook = await prisma.webhook.create({
      data: {
        ...webhookArgs,
        id: webhookId ?? `webhook_${cuid()}`,
      },
      include: { user: true },
    });
    const result = this._parseWebhook({ model: webhook });
    return { webhook: result };
  },

  updateWebhook: async function (
    args: { webhookId: string } & z.infer<typeof UpdateWebhookSchema>,
  ): Promise<{ webhook: z.infer<typeof ReadWebhookSchema> }> {
    const { webhookId, webhookArgs } = UpdateWebhookSchema.parse(args);
    const webhook = await prisma.webhook.update({
      where: { id: webhookId },
      data: webhookArgs,
      include: { user: true },
    });
    const result = this._parseWebhook({ model: webhook });
    return { webhook: result };
  },

  getWebhookById: async function (args: {
    webhookId: string;
  }): Promise<{ webhook: z.infer<typeof ReadWebhookSchema> | null }> {
    const { webhookId } = z.object({ webhookId: z.string() }).parse(args);
    const webhook = await prisma.webhook.findUnique({
      where: { id: webhookId },
      include: { user: true },
    });
    if (!webhook) {
      return { webhook: null };
    }
    const result = this._parseWebhook({ model: webhook });
    return { webhook: result };
  },

  getWebhooksByUserId: async function (args: {
    userId: string;
  }): Promise<{ webhooks: z.infer<typeof ReadWebhookSchema>[] }> {
    const { userId } = z.object({ userId: z.string() }).parse(args);
    const webhooks = await prisma.webhook.findMany({
      where: { userId: userId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    const result = webhooks.map((webhook) =>
      this._parseWebhook({ model: webhook }),
    );
    return { webhooks: result };
  },
};
