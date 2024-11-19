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

const UpdateBotTriggerEventSchema = z.object({
  botTriggerEventId: z.string(),
  botTriggerEventArgs: WriteBotTriggerEventSchema.partial(),
});

export const BotTriggerEventDbService = {
  _parseModel: (args: {
    model: BotTriggerEvent;
  }): z.infer<typeof ReadBotTriggerEventSchema> => {
    const { model } = args;
    return ReadBotTriggerEventSchema.parse({
      ...model,
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
        id: botTriggerEventId ?? `botTriggerEvent_${cuid()}`,
      },
    });

    const result = this._parseModel({ model: botTriggerEvent });
    return { botTriggerEvent: result };
  },
};
