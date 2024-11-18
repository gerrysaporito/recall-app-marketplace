/* eslint-disable no-var */
import type { PrismaClient } from '@prisma/client';
import type { WebhookQueueingClass } from '~/server/services/QueueingService/WebhookQueueingClass';

declare global {
  var prisma: PrismaClient;
  var queues: {
    webhook: WebhookQueueingClass;
  };
  var initializedServices: {
    nodeJsRuntime: boolean;
  };

  namespace NodeJS {
    interface Global {
      prisma: PrismaClient | undefined;
      queues: {
        webhook: WebhookQueueingClass;
      };
      initializedServices: {
        nodeJsRuntime: boolean;
      };
    }
  }
}
