import type {
  Bot,
  User,
  App,
  Prisma,
  BotApp,
  BotAppField,
  AppDataField,
} from "@prisma/client";
import cuid from "cuid";
import { z } from "zod";
import { prisma } from "@/config/prisma";
import { BotSchema } from "@/lib/schemas/BotSchema";

const WriteBotSchema = BotSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  botApps: true,
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

export const BotsFiltersSchema = z.object({
  userId: z.string().optional(),
  name: z.string().optional(),
});
export type BotsFilterType = z.infer<typeof BotsFiltersSchema>;

export const SearchBotsSchema = z.object({
  filters: BotsFiltersSchema,
  page: z.number().min(1),
  itemsPerPage: z.number().min(1),
});
export type SearchBotsType = z.infer<typeof SearchBotsSchema>;

export const BotDbService = {
  _parseBot: (args: {
    model: Bot & {
      user: User;
      apps: App[];
      botApps: (BotApp & {
        botAppFields: (BotAppField & { appField: AppDataField })[];
      })[];
    };
  }): z.infer<typeof ReadBotSchema> => {
    const { model } = args;
    return ReadBotSchema.parse({
      ...model,
      userEmail: model.user.email ?? "",
      botApps: model.botApps.map((botApp) => ({
        ...botApp,
        botAppFields: botApp.botAppFields.map((botAppField) => ({
          ...botAppField,
          key: botAppField.appField.key,
          appField: botAppField.appField,
        })),
      })),
    } satisfies z.input<typeof ReadBotSchema>);
  },

  createBot: async function (
    args: z.infer<typeof CreateBotSchema>
  ): Promise<{ bot: z.infer<typeof ReadBotSchema> }> {
    const { botId, botArgs } = CreateBotSchema.parse(args);
    const { userEmail, ...restArgs } = botArgs;

    const bot = await prisma.bot.create({
      data: {
        id: botId ?? `bot_${cuid()}`,
        ...restArgs,
      },
      include: {
        user: true,
        apps: true,
        botApps: { include: { botAppFields: { include: { appField: true } } } },
      },
    });

    const result = this._parseBot({ model: bot });
    return { bot: result };
  },

  updateBot: async function (
    args: z.infer<typeof UpdateBotSchema>
  ): Promise<{ bot: z.infer<typeof ReadBotSchema> }> {
    const { botId, botArgs } = UpdateBotSchema.parse(args);
    const { userEmail, ...restArgs } = botArgs;

    const bot = await prisma.bot.update({
      where: { id: botId },
      data: restArgs,
      include: {
        user: true,
        apps: true,
        botApps: { include: { botAppFields: { include: { appField: true } } } },
      },
    });

    const result = this._parseBot({ model: bot });
    return { bot: result };
  },

  getBotById: async function (args: {
    botId: string;
  }): Promise<{ bot: z.infer<typeof ReadBotSchema> | null }> {
    const { botId } = z.object({ botId: z.string() }).parse(args);
    const bot = await prisma.bot.findUnique({
      where: { id: botId, deletedAt: null },
      include: {
        user: true,
        apps: true,
        botApps: { include: { botAppFields: { include: { appField: true } } } },
      },
    });

    if (!bot) {
      return { bot: null };
    }

    const result = this._parseBot({ model: bot });
    return { bot: result };
  },

  searchBots: async function (args: z.infer<typeof SearchBotsSchema>): Promise<{
    bots: z.infer<typeof ReadBotSchema>[];
    totalCount: number;
  }> {
    const { filters, page, itemsPerPage } = SearchBotsSchema.parse(args);

    const where: Prisma.BotWhereInput = {
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.name ? { name: { contains: filters.name } } : {}),
      deletedAt: null,
    };

    const [bots, totalCount] = await Promise.all([
      prisma.bot.findMany({
        where,
        include: {
          user: true,
          apps: true,
          botApps: {
            include: { botAppFields: { include: { appField: true } } },
          },
        },
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: { createdAt: "desc" },
      }),
      prisma.bot.count({ where }),
    ]);

    const results = bots.map((bot) => this._parseBot({ model: bot }));
    return { bots: results, totalCount };
  },

  getBotsByRecallBotId: async function (args: {
    recallBotId: string;
  }): Promise<{ bots: z.infer<typeof ReadBotSchema>[] }> {
    const { recallBotId } = z.object({ recallBotId: z.string() }).parse(args);

    const bots = await prisma.bot.findMany({
      where: { recallBotId, deletedAt: null },
      include: {
        user: true,
        apps: true,
        botApps: { include: { botAppFields: { include: { appField: true } } } },
      },
    });

    const results = bots.map((bot) => this._parseBot({ model: bot }));
    return { bots: results };
  },
};
