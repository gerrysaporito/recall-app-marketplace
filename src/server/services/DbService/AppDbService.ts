import type { App, AppDataField, User, Prisma, Webhook } from "@prisma/client";
import cuid from "cuid";
import { z } from "zod";
import { prisma } from "@/config/prisma";
import { AppSchema } from "@/lib/schemas/AppSchema";
import { AppDataFieldSchema } from "@/lib/schemas/AppDataFieldSchema";
import { skip } from "@prisma/client/runtime/library";

const WriteAppSchema = AppSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  webhookId: true,
  webhook: true,
}).extend({
  webhookUrl: z.string(),
  dataFields: z.array(
    AppDataFieldSchema.omit({
      id: true,
      appId: true,
      createdAt: true,
      updatedAt: true,
    })
  ),
});

const ReadAppSchema = AppSchema;

const CreateAppSchema = z.object({
  appId: z.string().optional(),
  appArgs: WriteAppSchema,
});

const UpdateAppSchema = z.object({
  appId: z.string(),
  appArgs: WriteAppSchema.partial(),
});

export const AppsFiltersSchema = z.object({
  userId: z.string().optional(),
  userEmail: z.string().optional(),
  name: z.string().optional(),
});
export type AppsFilterType = z.infer<typeof AppsFiltersSchema>;

export const SearchAppsSchema = z.object({
  filters: AppsFiltersSchema,
  page: z.number().min(1),
  itemsPerPage: z.number().min(1),
});
export type SearchAppsType = z.infer<typeof SearchAppsSchema>;

export const AppDbService = {
  _parseModel: (args: {
    model: App & { user: User; webhook: Webhook; dataFields: AppDataField[] };
  }): z.infer<typeof ReadAppSchema> => {
    const { model } = args;
    return ReadAppSchema.parse({
      ...model,
      userEmail: model.user.email ?? "",
      dataFields: model.dataFields.map((field) =>
        AppDataFieldSchema.parse(field)
      ),
    } satisfies z.input<typeof ReadAppSchema>);
  },

  createApp: async function (
    args: z.infer<typeof CreateAppSchema>
  ): Promise<{ app: z.infer<typeof ReadAppSchema> }> {
    const { appId, appArgs } = CreateAppSchema.parse(args);
    const { dataFields, webhookUrl, userEmail, ...appData } = appArgs;

    // First verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: appData.userId },
    });
    if (!user) {
      throw new Error(`User with id ${appData.userId} not found`);
    }

    // Create webhook first
    const webhook = await prisma.webhook.create({
      data: {
        id: `webhook_${cuid()}`,
        url: webhookUrl,
        userId: appData.userId,
      },
    });

    // Then create app with webhook reference
    const app = await prisma.app.create({
      data: {
        id: appId ?? `app_${cuid()}`,
        ...appData,
        webhookId: webhook.id,
        dataFields: {
          create: dataFields.map((field) => ({
            ...field,
            id: `field_${cuid()}`,
          })),
        },
      },
      include: {
        user: true,
        webhook: true,
        dataFields: { where: { deletedAt: null } },
      },
    });

    const result = this._parseModel({ model: app });
    return { app: result };
  },

  updateApp: async function (
    args: z.infer<typeof UpdateAppSchema>
  ): Promise<{ app: z.infer<typeof ReadAppSchema> }> {
    const { appId, appArgs } = UpdateAppSchema.parse(args);
    const { dataFields, userEmail, webhookUrl, ...appData } = appArgs;

    // Update webhook if URL provided
    if (webhookUrl) {
      const app = await prisma.app.findUnique({
        where: { id: appId },
        select: { webhookId: true },
      });
      await prisma.webhook.update({
        where: { id: app!.webhookId },
        data: { url: webhookUrl },
      });
    }

    const app = await prisma.app.update({
      where: { id: appId },
      data: {
        ...appData,
        ...(dataFields
          ? {
              dataFields: {
                deleteMany: {},
                create: dataFields.map((field) => ({
                  ...field,
                  id: `field_${cuid()}`,
                })),
              },
            }
          : {}),
      },
      include: {
        user: true,
        webhook: true,
        dataFields: { where: { deletedAt: null } },
      },
    });

    const result = this._parseModel({ model: app });
    return { app: result };
  },

  getAppById: async function (args: {
    appId: string;
  }): Promise<{ app: z.infer<typeof ReadAppSchema> | null }> {
    const { appId } = z.object({ appId: z.string() }).parse(args);
    const app = await prisma.app.findUnique({
      where: { id: appId, deletedAt: null },
      include: {
        user: true,
        webhook: true,
        dataFields: { where: { deletedAt: null } },
      },
    });

    if (!app) {
      return { app: null };
    }

    const result = this._parseModel({ model: app });
    return { app: result };
  },

  getAppsByUserId: async function (args: {
    userId: string;
  }): Promise<{ apps: z.infer<typeof ReadAppSchema>[] }> {
    const { userId } = z.object({ userId: z.string() }).parse(args);
    const apps = await prisma.app.findMany({
      where: { userId, deletedAt: null },
      include: {
        user: true,
        webhook: true,
        dataFields: { where: { deletedAt: null } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = apps.map((app) => this._parseModel({ model: app }));
    return { apps: result };
  },

  searchApps: async function (args: z.infer<typeof SearchAppsSchema>): Promise<{
    apps: z.infer<typeof ReadAppSchema>[];
    totalCount: number;
  }> {
    const { filters, page, itemsPerPage } = SearchAppsSchema.parse(args);

    const where: Prisma.AppWhereInput = {
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.userEmail || filters.name
        ? {
            OR: [
              !!filters.userEmail
                ? { user: { email: { contains: filters.userEmail } } }
                : undefined,
              !!filters.name ? { name: { contains: filters.name } } : undefined,
            ].filter((v) => !!v),
          }
        : {}),
      deletedAt: null,
    };

    const [apps, totalCount] = await Promise.all([
      prisma.app.findMany({
        where,
        include: {
          user: true,
          webhook: true,
          dataFields: { where: { deletedAt: null } },
        },
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: { createdAt: "desc" },
      }),
      prisma.app.count({ where }),
    ]);

    const results = apps.map((app) => this._parseModel({ model: app }));
    return { apps: results, totalCount };
  },
};
