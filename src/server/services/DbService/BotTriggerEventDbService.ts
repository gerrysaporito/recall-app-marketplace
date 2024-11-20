import type { BotTriggerEvent, Prisma } from "@prisma/client";
import cuid from "cuid";
import { z } from "zod";
import { prisma } from "@/config/prisma";
import { BotTriggerEventSchema } from "@/lib/schemas/BotTriggerEventSchema";

const WriteBotTriggerEventSchema = BotTriggerEventSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const ReadBotTriggerEventSchema = BotTriggerEventSchema;

const CreateBotTriggerEventSchema = z.object({
  botTriggerEventId: z.string().optional(),
  botTriggerEventArgs: WriteBotTriggerEventSchema,
});

export const BotTriggerEventFiltersSchema = z.object({
  botId: z.string().optional(),
  botTemplateAppId: z.string().optional(),
  recordingId: z.string().optional(),
  speakerId: z.string().optional(),
  speakerName: z.string().optional(),
  actionName: z.string().optional(),
  triggerEventId: z.string().optional(),
});
export type BotTriggerEventFilterType = z.infer<
  typeof BotTriggerEventFiltersSchema
>;

export const SearchBotTriggerEventsSchema = z.object({
  filters: BotTriggerEventFiltersSchema,
  page: z.number().min(1),
  itemsPerPage: z.number().min(1),
});
export type SearchBotTriggerEventsType = z.infer<
  typeof SearchBotTriggerEventsSchema
>;

export const BotTriggerEventDbService = {
  _parseModel: (args: {
    model: BotTriggerEvent;
  }): z.infer<typeof ReadBotTriggerEventSchema> => {
    const { model } = args;
    return ReadBotTriggerEventSchema.parse({
      ...model,
      data: JSON.parse(model.data),
    } satisfies z.input<typeof ReadBotTriggerEventSchema>);
  },

  createBotTriggerEvent: async function (
    args: z.infer<typeof CreateBotTriggerEventSchema>
  ): Promise<{ botTriggerEvent: z.infer<typeof ReadBotTriggerEventSchema> }> {
    const { botTriggerEventId, botTriggerEventArgs } =
      CreateBotTriggerEventSchema.parse(args);

    const botTriggerEvent = await prisma.botTriggerEvent.create({
      data: {
        ...botTriggerEventArgs,
        data: JSON.stringify(botTriggerEventArgs.data),
        id: botTriggerEventId ?? `botTriggerEvent_${cuid()}`,
      },
    });

    const result = this._parseModel({ model: botTriggerEvent });
    return { botTriggerEvent: result };
  },

  getBotTriggerEventById: async function (args: {
    botTriggerEventId: string;
  }): Promise<{
    botTriggerEvent: z.infer<typeof ReadBotTriggerEventSchema> | null;
  }> {
    const { botTriggerEventId } = args;

    const botTriggerEvent = await prisma.botTriggerEvent.findUnique({
      where: { id: botTriggerEventId },
    });
    if (!botTriggerEvent) {
      return { botTriggerEvent: null };
    }

    const result = this._parseModel({ model: botTriggerEvent });
    return { botTriggerEvent: result };
  },

  getTriggerEventForBot: async function (args: {
    botId: string;
    recordingId: string;
    triggerEventId: string;
  }): Promise<{
    botTriggerEvent: z.infer<typeof ReadBotTriggerEventSchema> | null;
  }> {
    const { botId, recordingId, triggerEventId } = args;

    const botTriggerEvent = await prisma.botTriggerEvent.findFirst({
      where: { botId, recordingId, triggerEventId },
    });
    if (!botTriggerEvent) {
      return { botTriggerEvent: null };
    }

    const result = this._parseModel({ model: botTriggerEvent });
    return { botTriggerEvent: result };
  },

  searchBotTriggerEvents: async function (
    args: z.infer<typeof SearchBotTriggerEventsSchema>
  ): Promise<{
    botTriggerEvents: z.infer<typeof ReadBotTriggerEventSchema>[];
    totalCount: number;
  }> {
    const { filters, page, itemsPerPage } =
      SearchBotTriggerEventsSchema.parse(args);

    const where: Prisma.BotTriggerEventWhereInput = {
      ...(filters.botId && { botId: filters.botId }),
      ...(filters.botTemplateAppId && {
        botTemplateAppId: filters.botTemplateAppId,
      }),
      ...(filters.recordingId && { recordingId: filters.recordingId }),
      ...(filters.speakerId && { speakerId: filters.speakerId }),
      ...(filters.speakerName && { speakerName: filters.speakerName }),
      ...(filters.actionName && { actionName: filters.actionName }),
      ...(filters.triggerEventId && { triggerEventId: filters.triggerEventId }),
      deletedAt: null,
    };

    const [botTriggerEvents, totalCount] = await Promise.all([
      prisma.botTriggerEvent.findMany({
        where,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: { createdAt: "desc" },
      }),
      prisma.botTriggerEvent.count({ where }),
    ]);

    const results = botTriggerEvents.map((botTriggerEvent) =>
      this._parseModel({ model: botTriggerEvent })
    );
    return { botTriggerEvents: results, totalCount };
  },
};
