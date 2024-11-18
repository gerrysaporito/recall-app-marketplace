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
  eventId: z.string().optional(),
  eventArgs: WriteBotTriggerEventSchema,
});

export const BotTriggerEventDbService = {
  _parseBotTriggerEvent: (args: {
    model: BotTriggerEvent;
  }): z.infer<typeof ReadBotTriggerEventSchema> => {
    const { model } = args;
    return ReadBotTriggerEventSchema.parse(model);
  },

  createBotTriggerEvent: async function (
    args: z.infer<typeof CreateBotTriggerEventSchema>
  ): Promise<{ event: z.infer<typeof ReadBotTriggerEventSchema> }> {
    const { eventId, eventArgs } = CreateBotTriggerEventSchema.parse(args);

    const event = await prisma.botTriggerEvent.create({
      data: {
        id: eventId ?? `event_${cuid()}`,
        ...eventArgs,
      },
    });

    const result = this._parseBotTriggerEvent({ model: event });
    return { event: result };
  },

  getBotTriggerEventById: async function (args: {
    eventId: string;
  }): Promise<{ event: z.infer<typeof ReadBotTriggerEventSchema> | null }> {
    const { eventId } = z.object({ eventId: z.string() }).parse(args);

    const event = await prisma.botTriggerEvent.findUnique({
      where: { id: eventId, deletedAt: null },
    });

    if (!event) {
      return { event: null };
    }

    const result = this._parseBotTriggerEvent({ model: event });
    return { event: result };
  },

  getRecentBotTriggerEvents: async function (args: {
    recallBotId: string;
    limit?: number;
  }): Promise<{ events: z.infer<typeof ReadBotTriggerEventSchema>[] }> {
    const { recallBotId, limit = 10 } = z
      .object({
        recallBotId: z.string(),
        limit: z.number().optional(),
      })
      .parse(args);

    const events = await prisma.botTriggerEvent.findMany({
      where: {
        recallBotId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    const results = events.map((event) =>
      this._parseBotTriggerEvent({ model: event })
    );
    return { events: results };
  },
};
