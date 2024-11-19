import type { User, Webhook, WebhookEvent } from "@prisma/client";
import cuid from "cuid";
import { z } from "zod";
import { prisma } from "@/config/prisma";
import { WebhookEventSchema } from "@/lib/schemas/WebhookEventSchema";
import { WebhookEventType } from "@/lib/constants/WebhookEventType";
import { WebhookEventStatus } from "@/lib/constants/WebhookEventStatus";

const WriteWebhookEventSchema = WebhookEventSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const ReadWebhookEventSchema = WebhookEventSchema;

const CreateWebhookEventSchema = z.object({
  webhookEventId: z.string().optional(),
  webhookEventArgs: WriteWebhookEventSchema,
});

const UpdateWebhookEventSchema = z.object({
  webhookEventId: z.string(),
  webhookEventArgs: WriteWebhookEventSchema.partial(),
});

export const WebhookEventDbService = {
  include: {
    webhook: true,
    user: true,
  } as const,

  _parseModel: (args: {
    model: WebhookEvent & { webhook: Webhook; user: User };
  }): z.infer<typeof ReadWebhookEventSchema> => {
    const { model } = args;
    return ReadWebhookEventSchema.parse({
      ...model,
      type: model.type as WebhookEventType,
      status: model.status as WebhookEventStatus,
    } satisfies z.input<typeof ReadWebhookEventSchema>);
  },

  createWebhookEvent: async function (
    args: z.infer<typeof CreateWebhookEventSchema>
  ): Promise<{ webhookEvent: z.infer<typeof ReadWebhookEventSchema> }> {
    const { webhookEventId, webhookEventArgs } =
      CreateWebhookEventSchema.parse(args);
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        ...webhookEventArgs,
        id: webhookEventId ?? `webhookEvent_${cuid()}`,
      },
      include: this.include,
    });
    const result = this._parseModel({ model: webhookEvent });
    return { webhookEvent: result };
  },

  updateWebhookEvent: async function (
    args: { webhookEventId: string } & z.infer<typeof UpdateWebhookEventSchema>
  ): Promise<{ webhookEvent: z.infer<typeof ReadWebhookEventSchema> }> {
    const { webhookEventId, webhookEventArgs } =
      UpdateWebhookEventSchema.parse(args);
    const webhookEvent = await prisma.webhookEvent.update({
      where: { id: webhookEventId },
      data: webhookEventArgs,
      include: this.include,
    });
    const result = this._parseModel({ model: webhookEvent });
    return { webhookEvent: result };
  },

  getWebhookEventById: async function (args: {
    webhookEventId: string;
  }): Promise<{
    webhookEvent: z.infer<typeof ReadWebhookEventSchema> | null;
  }> {
    const { webhookEventId } = z
      .object({ webhookEventId: z.string() })
      .parse(args);
    const webhookEvent = await prisma.webhookEvent.findUnique({
      where: { id: webhookEventId, deletedAt: null },
      include: this.include,
    });
    if (!webhookEvent) {
      return { webhookEvent: null };
    }
    const result = this._parseModel({ model: webhookEvent });
    return { webhookEvent: result };
  },

  getWebhookEventsByWebhookId: async function (args: {
    webhookId: string;
  }): Promise<{ webhookEvents: z.infer<typeof ReadWebhookEventSchema>[] }> {
    const { webhookId } = z.object({ webhookId: z.string() }).parse(args);
    const webhookEvents = await prisma.webhookEvent.findMany({
      where: { webhookId, deletedAt: null },
      include: this.include,
      orderBy: { createdAt: "desc" },
    });
    const result = webhookEvents.map((webhookEvent) =>
      this._parseModel({ model: webhookEvent })
    );
    return { webhookEvents: result };
  },
};
