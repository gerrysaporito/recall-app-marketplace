import type {
  BotApp,
  Bot,
  App,
  BotAppField,
  AppDataField,
  Prisma,
} from "@prisma/client";
import cuid from "cuid";
import { z } from "zod";
import { prisma } from "@/config/prisma";
import { BotAppSchema } from "@/lib/schemas/BotAppSchema";
import { BotAppFieldSchema } from "@/lib/schemas/BotAppFieldSchema";

const WriteBotAppSchema = BotAppSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  botAppFields: z.array(
    BotAppFieldSchema.omit({
      id: true,
      botAppId: true,
      createdAt: true,
      updatedAt: true,
    })
  ),
});

const ReadBotAppSchema = BotAppSchema;

const CreateBotAppSchema = z.object({
  botAppId: z.string().optional(),
  botAppArgs: WriteBotAppSchema,
});

const UpdateBotAppSchema = z.object({
  botAppId: z.string(),
  botAppArgs: WriteBotAppSchema.partial(),
});

export const BotAppsFiltersSchema = z.object({
  botId: z.string().optional(),
  appId: z.string().optional(),
});
export type BotAppsFilterType = z.infer<typeof BotAppsFiltersSchema>;

export const BotAppDbService = {
  _parseBotApp: (args: {
    model: BotApp & {
      bot: Bot;
      app: App;
      botAppFields: (BotAppField & { appField: AppDataField })[];
    };
  }): z.infer<typeof ReadBotAppSchema> => {
    const { model } = args;
    return ReadBotAppSchema.parse({
      ...model,
      botAppFields: model.botAppFields.map((botAppField) => ({
        ...botAppField,
        key: botAppField.appField.key,
        appField: botAppField.appField,
      })),
    } satisfies z.input<typeof ReadBotAppSchema>);
  },

  createBotApp: async function (
    args: z.infer<typeof CreateBotAppSchema>
  ): Promise<{ botApp: z.infer<typeof ReadBotAppSchema> }> {
    const { botAppId, botAppArgs } = CreateBotAppSchema.parse(args);
    const { botAppFields, ...botAppData } = botAppArgs;

    const botApp = await prisma.botApp.create({
      data: {
        id: botAppId ?? `botapp_${cuid()}`,
        ...botAppData,
        botAppFields: {
          create: botAppFields.map((field) => ({
            ...field,
            id: `botappfield_${cuid()}`,
          })),
        },
      },
      include: {
        bot: true,
        app: true,
        botAppFields: { include: { appField: true } },
      },
    });

    const result = this._parseBotApp({ model: botApp });
    return { botApp: result };
  },

  updateBotApp: async function (
    args: z.infer<typeof UpdateBotAppSchema>
  ): Promise<{ botApp: z.infer<typeof ReadBotAppSchema> }> {
    const { botAppId, botAppArgs } = UpdateBotAppSchema.parse(args);
    const { botAppFields, ...botAppData } = botAppArgs;

    const botApp = await prisma.botApp.update({
      where: { id: botAppId },
      data: {
        ...botAppData,
        ...(botAppFields
          ? {
              botAppFields: {
                deleteMany: {},
                create: botAppFields.map((field) => ({
                  ...field,
                  id: `botappfield_${cuid()}`,
                })),
              },
            }
          : {}),
      },
      include: {
        bot: true,
        app: true,
        botAppFields: { include: { appField: true } },
      },
    });

    const result = this._parseBotApp({ model: botApp });
    return { botApp: result };
  },

  getBotAppById: async function (args: {
    botAppId: string;
  }): Promise<{ botApp: z.infer<typeof ReadBotAppSchema> | null }> {
    const { botAppId } = z.object({ botAppId: z.string() }).parse(args);

    const botApp = await prisma.botApp.findUnique({
      where: { id: botAppId, deletedAt: null },
      include: {
        bot: true,
        app: true,
        botAppFields: { include: { appField: true } },
      },
    });

    if (!botApp) {
      return { botApp: null };
    }

    const result = this._parseBotApp({ model: botApp });
    return { botApp: result };
  },
};
