/* eslint-disable no-var */
import type { PrismaClient } from "@prisma/client";
import type { WebhookQueueingClass } from "~/server/services/QueueingService/WebhookQueueingClass";
import type { redis } from "@/config/redis";

declare global {
  var prisma: PrismaClient;
  var redis: typeof redis | undefined;
  var queues: {
    webhook: WebhookQueueingClass;
  };
  var initializedServices: {
    nodeJsRuntime: boolean;
  };

  namespace NodeJS {
    interface Global {
      prisma: PrismaClient | undefined;
      redis: typeof redis | undefined;
      queues: {
        webhook: WebhookQueueingClass;
      };
      initializedServices: {
        nodeJsRuntime: boolean;
      };
    }
  }
}
