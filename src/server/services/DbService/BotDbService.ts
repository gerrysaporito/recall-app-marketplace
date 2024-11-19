import type { Bot } from "@prisma/client";
import cuid from "cuid";
import { z } from "zod";
import { prisma } from "@/config/prisma";
import { BotSchema } from "@/lib/schemas/BotSchema";
import { BotTemplateType } from "@/lib/schemas/BotTemplateSchema";
import { BotTemplateDbService } from "./BotTemplateDbService";

const WriteBotSchema = BotSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  botTemplate: true,
});

const ReadBotSchema = BotSchema;

const CreateBotSchema = z.object({
  botId: z.string().optional(),
  botArgs: WriteBotSchema,
});

const UpdateBotSchema = z.object({
  botId: z.string(),
  botArgs: WriteBotSchema.partial(),
});

export const BotDbService = {
  include: {
    botTemplate: true,
  } as const,

  _parseModel: (args: {
    model: Bot & { botTemplate: BotTemplateType };
  }): z.infer<typeof ReadBotSchema> => {
    const { model } = args;
    return ReadBotSchema.parse({
      ...model,
    } satisfies z.input<typeof ReadBotSchema>);
  },

  createBot: async function (
    args: z.infer<typeof CreateBotSchema>
  ): Promise<{ bot: z.infer<typeof ReadBotSchema> }> {
    const { botId, botArgs } = CreateBotSchema.parse(args);

    const { botTemplate } = await BotTemplateDbService.getBotTemplateById({
      botTemplateId: botArgs.botTemplateId,
    });
    if (!botTemplate) {
      throw new Error("Bot template not found");
    }

    const bot = await prisma.bot.create({
      data: {
        id: botId ?? `bot_${cuid()}`,
        ...botArgs,
      },
      include: this.include,
    });

    const result = this._parseModel({ model: { ...bot, botTemplate } });
    return { bot: result };
  },

  updateBot: async function (
    args: z.infer<typeof UpdateBotSchema>
  ): Promise<{ bot: z.infer<typeof ReadBotSchema> }> {
    const { botId, botArgs } = UpdateBotSchema.parse(args);

    const bot = await prisma.bot.update({
      where: { id: botId },
      data: botArgs,
      include: this.include,
    });

    const { botTemplate } = await BotTemplateDbService.getBotTemplateById({
      botTemplateId: bot.botTemplateId,
    });
    if (!botTemplate) {
      throw new Error("Bot template not found");
    }

    const result = this._parseModel({ model: { ...bot, botTemplate } });
    return { bot: result };
  },

  deleteBot: async function (args: { botId: string }): Promise<void> {
    const { botId } = z.object({ botId: z.string() }).parse(args);

    await prisma.bot.delete({
      where: { id: botId },
    });
  },

  getBotById: async function (args: {
    botId: string;
  }): Promise<{ bot: z.infer<typeof ReadBotSchema> | null }> {
    const { botId } = z.object({ botId: z.string() }).parse(args);

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      include: this.include,
    });

    if (!bot) {
      return { bot: null };
    }

    const { botTemplate } = await BotTemplateDbService.getBotTemplateById({
      botTemplateId: bot.botTemplateId,
    });
    if (!botTemplate) {
      return { bot: null };
    }

    const result = this._parseModel({ model: { ...bot, botTemplate } });
    return { bot: result };
  },

  getBotByRecallBotId: async function (args: {
    recallBotId: string;
  }): Promise<{ bot: z.infer<typeof ReadBotSchema> | null }> {
    const { recallBotId } = z.object({ recallBotId: z.string() }).parse(args);

    const bot = await prisma.bot.findFirst({
      where: { recallBotId },
      include: this.include,
    });

    if (!bot) {
      return { bot: null };
    }

    const { botTemplate } = await BotTemplateDbService.getBotTemplateById({
      botTemplateId: bot.botTemplateId,
    });
    if (!botTemplate) {
      return { bot: null };
    }

    const result = this._parseModel({ model: { ...bot, botTemplate } });
    return { bot: result };
  },
};
