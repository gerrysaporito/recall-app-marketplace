import type { BotTriggerEvent } from "@prisma/client";
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
};
