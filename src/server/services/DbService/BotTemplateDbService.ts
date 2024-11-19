import type {
  Bot,
  User,
  App,
  Prisma,
  BotTemplateApp,
  BotTemplateAppDataField,
  Webhook,
  AppDataField,
  BotTemplate,
} from "@prisma/client";
import cuid from "cuid";
import { z } from "zod";
import { prisma } from "@/config/prisma";
import { BotTemplateSchema } from "@/lib/schemas/BotTemplateSchema";

const WriteBotTemplateSchema = BotTemplateSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  botTemplateApps: true,
});

const ReadBotTemplateSchema = BotTemplateSchema;

const CreateBotTemplateSchema = z.object({
  botTemplateId: z.string().optional(),
  botTemplateArgs: WriteBotTemplateSchema,
});

const UpdateBotTemplateSchema = z.object({
  botTemplateId: z.string(),
  botTemplateArgs: WriteBotTemplateSchema.partial(),
});

export const BotTemplatesFiltersSchema = z.object({
  userId: z.string().optional(),
  name: z.string().optional(),
});
export type BotTemplatesFilterType = z.infer<typeof BotTemplatesFiltersSchema>;

export const SearchBotTemplatesSchema = z.object({
  filters: BotTemplatesFiltersSchema,
  page: z.number().min(1),
  itemsPerPage: z.number().min(1),
});
export type SearchBotTemplatesType = z.infer<typeof SearchBotTemplatesSchema>;

export const BotTemplateDbService = {
  include: {
    user: true,
    botTemplateApps: {
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
        botTemplateAppDataFields: {
          include: {
            appDataField: true,
          },
        },
      },
    },
  } as const,

  _parseModel: (args: {
    model: BotTemplate & {
      user: User;
      botTemplateApps: (BotTemplateApp & {
        app: App & {
          dataFields: AppDataField[];
          webhook: Webhook;
        };
        botTemplateAppDataFields: (BotTemplateAppDataField & {
          appDataField: AppDataField;
        })[];
      })[];
    };
  }): z.infer<typeof ReadBotTemplateSchema> => {
    const { model } = args;
    return ReadBotTemplateSchema.parse({
      ...model,
      userEmail: model.user.email ?? "",
      botTemplateApps: model.botTemplateApps.map((botTemplateApp) => ({
        ...botTemplateApp,
        app: {
          ...botTemplateApp.app,
          userEmail: model.user.email ?? "",
          dataFields: botTemplateApp.app.dataFields.map((field) => ({
            ...field,
            type: field.type as any,
          })),
        },
        botTemplateAppDataFields: botTemplateApp.botTemplateAppDataFields.map(
          (botTemplateAppDataField) => ({
            ...botTemplateAppDataField,
            type: botTemplateAppDataField.type as any,
            appDataFieldId: botTemplateAppDataField.appDataField.id,
            key: botTemplateAppDataField.appDataField.key,
          })
        ),
      })),
    } satisfies z.input<typeof ReadBotTemplateSchema>);
  },

  createBotTemplate: async function (
    args: z.infer<typeof CreateBotTemplateSchema>
  ): Promise<{ botTemplate: z.infer<typeof ReadBotTemplateSchema> }> {
    const { botTemplateId, botTemplateArgs } =
      CreateBotTemplateSchema.parse(args);
    const { userEmail, ...restArgs } = botTemplateArgs;

    const botTemplate = await prisma.botTemplate.create({
      data: {
        id: botTemplateId ?? `botTemplate_${cuid()}`,
        ...restArgs,
      },
      include: this.include,
    });

    const result = this._parseModel({ model: botTemplate });
    return { botTemplate: result };
  },

  updateBotTemplate: async function (
    args: z.infer<typeof UpdateBotTemplateSchema>
  ): Promise<{ botTemplate: z.infer<typeof ReadBotTemplateSchema> }> {
    const { botTemplateId, botTemplateArgs } =
      UpdateBotTemplateSchema.parse(args);
    const { userEmail, ...restArgs } = botTemplateArgs;

    const botTemplate = await prisma.botTemplate.update({
      where: { id: botTemplateId },
      data: restArgs,
      include: this.include,
    });

    const result = this._parseModel({ model: botTemplate });
    return { botTemplate: result };
  },

  getBotTemplateById: async function (args: {
    botTemplateId: string;
  }): Promise<{
    botTemplate: z.infer<typeof ReadBotTemplateSchema> | null;
  }> {
    const { botTemplateId } = z
      .object({ botTemplateId: z.string() })
      .parse(args);
    const botTemplate = await prisma.botTemplate.findUnique({
      where: { id: botTemplateId },
      include: this.include,
    });

    if (!botTemplate) {
      return { botTemplate: null };
    }

    const result = this._parseModel({ model: botTemplate });
    return { botTemplate: result };
  },

  searchBotTemplates: async function (
    args: z.infer<typeof SearchBotTemplatesSchema>
  ): Promise<{
    botTemplates: z.infer<typeof ReadBotTemplateSchema>[];
    totalCount: number;
  }> {
    const { filters, page, itemsPerPage } =
      SearchBotTemplatesSchema.parse(args);

    const where: Prisma.BotTemplateWhereInput = {
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.name ? { name: { contains: filters.name } } : {}),
      deletedAt: null,
    };

    const [botTemplates, totalCount] = await Promise.all([
      prisma.botTemplate.findMany({
        where,
        include: this.include,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: { createdAt: "desc" },
      }),
      prisma.botTemplate.count({ where }),
    ]);

    const results = botTemplates.map((botTemplate) =>
      this._parseModel({ model: botTemplate })
    );
    return { botTemplates: results, totalCount };
  },
};
