import type { BotTemplateAppDataField, AppDataField } from "@prisma/client";
import cuid from "cuid";
import { z } from "zod";
import { prisma } from "@/config/prisma";
import { BotTemplateAppDataFieldSchema } from "@/lib/schemas/BotTemplateAppDataFieldSchema";

const WriteBotTemplateAppDataFieldSchema = BotTemplateAppDataFieldSchema.omit({
  id: true,
  key: true,
  createdAt: true,
  updatedAt: true,
});

const CreateBotTemplateAppDataFieldSchema = z.object({
  botTemplateAppDataFieldId: z.string().optional(),
  botTemplateAppDataFieldArgs: WriteBotTemplateAppDataFieldSchema,
});

const UpdateBotTemplateAppDataFieldSchema = z.object({
  botTemplateAppDataFieldId: z.string(),
  botTemplateAppDataFieldArgs: WriteBotTemplateAppDataFieldSchema.partial(),
});

export const BotTemplateAppDataFieldDbService = {
  include: {
    appDataField: true,
  } as const,

  _parseModel: (args: {
    model: BotTemplateAppDataField & { appDataField: AppDataField };
  }): z.infer<typeof BotTemplateAppDataFieldSchema> => {
    const { model } = args;
    return BotTemplateAppDataFieldSchema.parse({
      ...model,
      key: model.appDataField.key,
      appDataFieldId: model.appDataField.id,
    });
  },

  createBotTemplateAppDataField: async function (
    args: z.infer<typeof CreateBotTemplateAppDataFieldSchema>
  ) {
    const { botTemplateAppDataFieldId, botTemplateAppDataFieldArgs } =
      CreateBotTemplateAppDataFieldSchema.parse(args);

    const botTemplateAppDataField = await prisma.botTemplateAppDataField.create(
      {
        data: {
          id: botTemplateAppDataFieldId ?? `botTemplateAppDataField_${cuid()}`,
          ...botTemplateAppDataFieldArgs,
        },
        include: this.include,
      }
    );

    return this._parseModel({ model: botTemplateAppDataField });
  },

  updateBotTemplateAppDataField: async function (
    args: z.infer<typeof UpdateBotTemplateAppDataFieldSchema>
  ) {
    const { botTemplateAppDataFieldId, botTemplateAppDataFieldArgs } =
      UpdateBotTemplateAppDataFieldSchema.parse(args);

    const botTemplateAppDataField = await prisma.botTemplateAppDataField.update(
      {
        where: { id: botTemplateAppDataFieldId },
        data: botTemplateAppDataFieldArgs,
        include: this.include,
      }
    );

    return this._parseModel({ model: botTemplateAppDataField });
  },

  deleteBotTemplateAppDataFields: async function (args: {
    botTemplateAppId: string;
  }) {
    const { botTemplateAppId } = args;

    return await prisma.botTemplateAppDataField.deleteMany({
      where: { botTemplateAppId },
    });
  },

  getBotTemplateAppDataFields: async function (args: {
    botTemplateAppId: string;
  }) {
    const { botTemplateAppId } = args;

    const fields = await prisma.botTemplateAppDataField.findMany({
      where: { botTemplateAppId },
      include: this.include,
    });

    return fields.map((field) => this._parseModel({ model: field }));
  },
};
