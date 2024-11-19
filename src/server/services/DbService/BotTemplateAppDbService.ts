import type {
  BotTemplateApp,
  Bot,
  App,
  AppDataField,
  Webhook,
  User,
  BotTemplateAppDataField,
  BotTemplate,
} from "@prisma/client";
import cuid from "cuid";
import { z } from "zod";
import { prisma } from "@/config/prisma";
import { BotTemplateAppSchema } from "@/lib/schemas/BotTemplateAppSchema";

const WriteBotTemplateAppSchema = BotTemplateAppSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  app: true,
  botTemplateAppDataFields: true,
});

const ReadBotTemplateAppSchema = BotTemplateAppSchema;

const CreateBotTemplateAppSchema = z.object({
  botTemplateAppId: z.string().optional(),
  botTemplateAppArgs: WriteBotTemplateAppSchema,
});

const UpdateBotTemplateAppSchema = z.object({
  botTemplateAppId: z.string(),
  botTemplateAppArgs: WriteBotTemplateAppSchema.partial(),
});

export const BotTemplateAppDbService = {
  include: {
    botTemplate: true,
    app: {
      include: {
        user: true,
        dataFields: true,
        webhook: true,
      },
    },
    botTemplateAppDataFields: {
      include: {
        appDataField: true,
      },
    },
  } as const,

  parseModel: (args: {
    model: BotTemplateApp & {
      botTemplate: BotTemplate;
      app: App & {
        user: User;
        dataFields: AppDataField[];
        webhook: Webhook;
      };
      botTemplateAppDataFields: (BotTemplateAppDataField & {
        appDataField: AppDataField;
      })[];
    };
  }): z.infer<typeof ReadBotTemplateAppSchema> => {
    const { model } = args;
    return ReadBotTemplateAppSchema.parse({
      ...model,
      app: {
        ...model.app,
        userEmail: model.app.user.email ?? "",
        dataFields: model.app.dataFields.map((field) => ({
          ...field,
          type: field.type as any,
        })),
      },
      botTemplateAppDataFields: model.botTemplateAppDataFields.map(
        (botTemplateAppDataField) => ({
          ...botTemplateAppDataField,
          type: botTemplateAppDataField.type as any,
          key: botTemplateAppDataField.appDataField.key,
          appDataFieldId: botTemplateAppDataField.appDataField.id,
        })
      ),
    } satisfies z.input<typeof ReadBotTemplateAppSchema>);
  },

  createBotTemplateApp: async function (
    args: z.infer<typeof CreateBotTemplateAppSchema>
  ): Promise<{
    botTemplateApp: z.infer<typeof ReadBotTemplateAppSchema>;
  }> {
    const { botTemplateAppId, botTemplateAppArgs } =
      CreateBotTemplateAppSchema.parse(args);

    const createdBotTemplateApp = await prisma.botTemplateApp.create({
      data: {
        ...botTemplateAppArgs,
        id: botTemplateAppId ?? `botTemplateApp_${cuid()}`,
      },
      include: this.include,
    });

    if (!createdBotTemplateApp) {
      throw new Error("Failed to create bot template app");
    }

    const result = this.parseModel({ model: createdBotTemplateApp });
    return { botTemplateApp: result };
  },

  updateBotTemplateApp: async function (
    args: z.infer<typeof UpdateBotTemplateAppSchema>
  ): Promise<{
    botTemplateApp: z.infer<typeof ReadBotTemplateAppSchema>;
  }> {
    const { botTemplateAppId, botTemplateAppArgs } =
      UpdateBotTemplateAppSchema.parse(args);

    await prisma.botTemplateApp.update({
      where: { id: botTemplateAppId },
      data: botTemplateAppArgs,
    });

    const botTemplateApp = await prisma.botTemplateApp.findUnique({
      where: { id: botTemplateAppId },
      include: this.include,
    });

    if (!botTemplateApp) {
      throw new Error("Failed to fetch updated bot template app");
    }

    return {
      botTemplateApp: this.parseModel({ model: botTemplateApp }),
    };
  },

  getBotTemplateAppById: async function (args: {
    botTemplateAppId: string;
  }): Promise<{
    botTemplateApp: z.infer<typeof ReadBotTemplateAppSchema> | null;
  }> {
    const { botTemplateAppId } = z
      .object({ botTemplateAppId: z.string() })
      .parse(args);

    const botTemplateApp = await prisma.botTemplateApp.findUnique({
      where: { id: botTemplateAppId, deletedAt: null },
      include: this.include,
    });

    if (!botTemplateApp) {
      return { botTemplateApp: null };
    }

    const result = this.parseModel({ model: botTemplateApp });
    return { botTemplateApp: result };
  },
};
