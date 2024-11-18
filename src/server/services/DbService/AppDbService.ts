import type { App, AppDataField, User } from "@prisma/client";
import cuid from "cuid";
import { z } from "zod";
import { prisma } from "@/config/prisma";
import { AppSchema } from "@/lib/schemas/AppSchema";
import { AppDataFieldSchema } from "@/lib/schemas/AppDataFieldSchema";

const WriteAppSchema = AppSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dataFields: z.array(
    AppDataFieldSchema.omit({
      id: true,
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

export const AppDbService = {
  _parseApp: (args: {
    model: App & { user: User; dataFields: AppDataField[] };
  }): z.infer<typeof ReadAppSchema> => {
    const { model } = args;
    return ReadAppSchema.parse({
      ...model,
      dataFields: model.dataFields.map((field) =>
        AppDataFieldSchema.parse(field)
      ),
    } satisfies z.input<typeof ReadAppSchema>);
  },

  createApp: async function (
    args: z.infer<typeof CreateAppSchema>
  ): Promise<{ app: z.infer<typeof ReadAppSchema> }> {
    const { appId, appArgs } = CreateAppSchema.parse(args);
    const { dataFields, ...appData } = appArgs;

    const app = await prisma.app.create({
      data: {
        ...appData,
        id: appId ?? `app_${cuid()}`,
        dataFields: {
          create: dataFields.map((field) => ({
            ...field,
            id: `field_${cuid()}`,
          })),
        },
      },
      include: {
        user: true,
        dataFields: { where: { deletedAt: null } },
      },
    });

    const result = this._parseApp({ model: app });
    return { app: result };
  },

  updateApp: async function (
    args: z.infer<typeof UpdateAppSchema>
  ): Promise<{ app: z.infer<typeof ReadAppSchema> }> {
    const { appId, appArgs } = UpdateAppSchema.parse(args);
    const { dataFields, ...appData } = appArgs;

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
        dataFields: { where: { deletedAt: null } },
      },
    });

    const result = this._parseApp({ model: app });
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
        dataFields: { where: { deletedAt: null } },
      },
    });

    if (!app) {
      return { app: null };
    }

    const result = this._parseApp({ model: app });
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
        dataFields: { where: { deletedAt: null } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = apps.map((app) => this._parseApp({ model: app }));
    return { apps: result };
  },
};
