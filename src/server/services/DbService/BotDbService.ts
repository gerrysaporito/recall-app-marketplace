import type {
  Bot,
  User,
  App,
  Prisma,
  BotApp,
  BotAppDataField,
  Webhook,
  AppDataField,
} from "@prisma/client";
import cuid from "cuid";
import { z } from "zod";
import { prisma } from "@/config/prisma";
import { BotSchema } from "@/lib/schemas/BotSchema";
import page from "@/app/(client)/page";

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
  include: {
    user: true,
    botApps: {
      where: {
        deletedAt: null,
      },
      include: {
        app: {
          include: {
            dataFields: true,
            webhook: true,
          },
        },
        botAppDataFields: {
          include: {
            appDataField: true,
          },
        },
      },
    },
  } as const,

  _parseModel: (args: {
    model: Bot & {
      user: User;
      botApps: (BotApp & {
        app: App & {
          dataFields: AppDataField[];
          webhook: Webhook;
        };
        botAppDataFields: (BotAppDataField & { appDataField: AppDataField })[];
      })[];
    };
  }): z.infer<typeof ReadBotSchema> => {
    const { model } = args;
    return ReadBotSchema.parse({
      ...model,
      userEmail: model.user.email ?? "",
      botApps: model.botApps.map((botApp) => ({
        ...botApp,
        app: {
          ...botApp.app,
          userEmail: model.user.email ?? "",
          dataFields: botApp.app.dataFields.map((field) => ({
            ...field,
            type: field.type as any,
          })),
        },
        botAppDataFields: botApp.botAppDataFields.map((botAppField) => ({
          ...botAppField,
          appDataFieldId: botAppField.appDataField.id,
          key: botAppField.appDataField.key,
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
      include: this.include,
    });

    const result = this._parseModel({ model: bot });
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
      include: this.include,
    });

    const result = this._parseModel({ model: bot });
    return { bot: result };
  },

  getBotById: async function (args: {
    botId: string;
  }): Promise<{ bot: z.infer<typeof ReadBotSchema> | null }> {
    const { botId } = z.object({ botId: z.string() }).parse(args);
    const bot = await prisma.bot.findUnique({
      where: { id: botId, deletedAt: null },
      include: this.include,
    });

    if (!bot) {
      return { bot: null };
    }

    const result = this._parseModel({ model: bot });
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
        include: this.include,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: { createdAt: "desc" },
      }),
      prisma.bot.count({ where }),
    ]);

    const results = bots.map((bot) => this._parseModel({ model: bot }));
    return { bots: results, totalCount };
  },

  getBotsByRecallBotId: async function (args: {
    recallBotId: string;
  }): Promise<{ bots: z.infer<typeof ReadBotSchema>[] }> {
    const { recallBotId } = z.object({ recallBotId: z.string() }).parse(args);

    const bots = await prisma.bot.findMany({
      where: { recallBotId, deletedAt: null },
      include: this.include,
    });

    const results = bots.map((bot) => this._parseModel({ model: bot }));
    return { bots: results };
  },
};
