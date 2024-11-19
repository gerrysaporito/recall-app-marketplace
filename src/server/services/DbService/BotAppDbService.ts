import type {
  BotApp,
  Bot,
  App,
  AppDataField,
  Webhook,
  User,
  BotAppDataField,
} from "@prisma/client";
import cuid from "cuid";
import { z } from "zod";
import { prisma } from "@/config/prisma";
import { BotAppSchema } from "@/lib/schemas/BotAppSchema";

const WriteBotAppSchema = BotAppSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  app: true,
  botAppDataFields: true,
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

export const BotAppDbService = {
  include: {
    bot: true,
    app: {
      include: {
        user: true,
        dataFields: true,
        webhook: true,
      },
    },
    botAppDataFields: {
      include: {
        appDataField: true,
      },
    },
  } as const,

  parseModel: (args: {
    model: BotApp & {
      bot: Bot;
      app: App & {
        user: User;
        dataFields: AppDataField[];
        webhook: Webhook;
      };
      botAppDataFields: (BotAppDataField & { appDataField: AppDataField })[];
    };
  }): z.infer<typeof ReadBotAppSchema> => {
    const { model } = args;
    return ReadBotAppSchema.parse({
      ...model,
      app: {
        ...model.app,
        userEmail: model.app.user.email ?? "",
        dataFields: model.app.dataFields.map((field) => ({
          ...field,
          type: field.type as any,
        })),
      },
      botAppDataFields: model.botAppDataFields.map((botAppField) => ({
        ...botAppField,
        type: botAppField.type as any,
        key: botAppField.appDataField.key,
        appDataFieldId: botAppField.appDataField.id,
      })),
    } satisfies z.input<typeof ReadBotAppSchema>);
  },

  createBotApp: async function (
    args: z.infer<typeof CreateBotAppSchema>
  ): Promise<{ botApp: z.infer<typeof ReadBotAppSchema> }> {
    const { botAppId, botAppArgs } = CreateBotAppSchema.parse(args);

    const createdBotApp = await prisma.botApp.create({
      data: {
        ...botAppArgs,
        id: botAppId ?? `botApp_${cuid()}`,
      },
      include: this.include,
    });

    if (!createdBotApp) {
      throw new Error("Failed to create bot app");
    }

    const result = this.parseModel({ model: createdBotApp });
    return { botApp: result };
  },

  updateBotApp: async function (
    args: z.infer<typeof UpdateBotAppSchema>
  ): Promise<{ botApp: z.infer<typeof ReadBotAppSchema> }> {
    const { botAppId, botAppArgs } = UpdateBotAppSchema.parse(args);

    await prisma.botApp.update({
      where: { id: botAppId },
      data: botAppArgs,
    });

    const botApp = await prisma.botApp.findUnique({
      where: { id: botAppId },
      include: this.include,
    });

    if (!botApp) {
      throw new Error("Failed to fetch updated bot app");
    }

    return { botApp: this.parseModel({ model: botApp }) };
  },

  getBotAppById: async function (args: {
    botAppId: string;
  }): Promise<{ botApp: z.infer<typeof ReadBotAppSchema> | null }> {
    const { botAppId } = z.object({ botAppId: z.string() }).parse(args);

    const botApp = await prisma.botApp.findUnique({
      where: { id: botAppId, deletedAt: null },
      include: this.include,
    });

    if (!botApp) {
      return { botApp: null };
    }

    const result = this.parseModel({ model: botApp });
    return { botApp: result };
  },
};
