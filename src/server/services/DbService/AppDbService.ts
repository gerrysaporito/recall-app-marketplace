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
        dataFields: true,
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

    // First update the app
    const app = await prisma.app.update({
      where: { id: appId },
      data: appData,
      include: {
        user: true,
        dataFields: true,
      },
    });

    // If dataFields are provided, update them
    if (dataFields) {
      // Delete existing fields
      await prisma.appDataField.deleteMany({
        where: { appId },
      });

      // Create new fields
      await prisma.appDataField.createMany({
        data: dataFields.map((field) => ({
          ...field,
          id: `field_${cuid()}`,
          appId,
        })),
      });

      // Fetch the updated app with all relations
      const updatedApp = await prisma.app.findUnique({
        where: { id: appId },
        include: {
          user: true,
          dataFields: true,
        },
      });

      if (!updatedApp) {
        throw new Error("App not found after update");
      }

      const result = this._parseApp({ model: updatedApp });
      return { app: result };
    }

    const result = this._parseApp({ model: app });
    return { app: result };
  },

  getAppById: async function (args: {
    appId: string;
  }): Promise<{ app: z.infer<typeof ReadAppSchema> | null }> {
    const { appId } = z.object({ appId: z.string() }).parse(args);
    const app = await prisma.app.findUnique({
      where: { id: appId },
      include: {
        user: true,
        dataFields: true,
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
      where: { userId },
      include: {
        user: true,
        dataFields: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const result = apps.map((app) => this._parseApp({ model: app }));
    return { apps: result };
  },
};
