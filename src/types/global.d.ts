/* eslint-disable no-var */
import type { PrismaClient } from "@prisma/client";
import type { WebhookQueueingService } from "~/server/services/WebhookQueueingService";
import type { redis } from "@/config/redis";
import type { REST } from '@discordjs/rest';

declare global {
  var prisma: PrismaClient;
  var redis: typeof redis | undefined;
  var discord: REST;
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
      discord: REST | undefined;
      queues: {
        webhook: typeof WebhookQueueingService;
      };
      initializedServices: {
        nodeJsRuntime: boolean;
      };
    }
  }
}
