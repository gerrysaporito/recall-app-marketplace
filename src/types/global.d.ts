/* eslint-disable no-var */
import type { PrismaClient } from "@prisma/client";
import type { WebhookQueueingService } from "~/server/services/WebhookQueueingService";
import type { redis } from "@/config/redis";

declare global {
  var prisma: PrismaClient;
  var redis: typeof redis | undefined;
  var queues: {
    webhook: typeof WebhookQueueingService;
  };
  var initializedServices: {
    nodeJsRuntime: boolean;
  };

  namespace NodeJS {
    interface Global {
      prisma: PrismaClient | undefined;
      redis: typeof redis | undefined;
      queues: {
        webhook: typeof WebhookQueueingService;
      };
      initializedServices: {
        nodeJsRuntime: boolean;
      };
    }
  }
}
