import type { BotAppDataField, AppDataField } from "@prisma/client";
import cuid from "cuid";
import { z } from "zod";
import { prisma } from "@/config/prisma";
import { BotAppDataFieldSchema } from "@/lib/schemas/BotAppDataFieldSchema";

const WriteBotAppDataFieldSchema = BotAppDataFieldSchema.omit({
  id: true,
  key: true,
  createdAt: true,
  updatedAt: true,
});

const CreateBotAppDataFieldSchema = z.object({
  botAppDataFieldId: z.string().optional(),
  botAppDataFieldArgs: WriteBotAppDataFieldSchema,
});

const UpdateBotAppDataFieldSchema = z.object({
  botAppDataFieldId: z.string(),
  botAppDataFieldArgs: WriteBotAppDataFieldSchema.partial(),
});

export const BotAppDataFieldDbService = {
  include: {
    appDataField: true,
  } as const,

  _parseModel: (args: {
    model: BotAppDataField & { appDataField: AppDataField };
  }): z.infer<typeof BotAppDataFieldSchema> => {
    const { model } = args;
    return BotAppDataFieldSchema.parse({
      ...model,
      key: model.appDataField.key,
      appDataFieldId: model.appDataField.id,
    });
  },

  createBotAppDataField: async function (
    args: z.infer<typeof CreateBotAppDataFieldSchema>
  ) {
    const { botAppDataFieldId, botAppDataFieldArgs } =
      CreateBotAppDataFieldSchema.parse(args);

    const botAppDataField = await prisma.botAppDataField.create({
      data: {
        id: botAppDataFieldId ?? `botAppDataField_${cuid()}`,
        ...botAppDataFieldArgs,
      },
      include: this.include,
    });

    return this._parseModel({ model: botAppDataField });
  },

  updateBotAppDataField: async function (
    args: z.infer<typeof UpdateBotAppDataFieldSchema>
  ) {
    const { botAppDataFieldId, botAppDataFieldArgs } =
      UpdateBotAppDataFieldSchema.parse(args);

    const botAppDataField = await prisma.botAppDataField.update({
      where: { id: botAppDataFieldId },
      data: botAppDataFieldArgs,
      include: this.include,
    });

    return this._parseModel({ model: botAppDataField });
  },

  deleteBotAppDataFields: async function (args: { botAppId: string }) {
    const { botAppId } = args;

    return await prisma.botAppDataField.deleteMany({
      where: { botAppId },
    });
  },

  getBotAppDataFields: async function (args: { botAppId: string }) {
    const { botAppId } = args;

    const fields = await prisma.botAppDataField.findMany({
      where: { botAppId },
      include: this.include,
    });

    return fields.map((field) => this._parseModel({ model: field }));
  },
};
