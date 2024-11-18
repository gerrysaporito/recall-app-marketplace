import { WebhookEventType } from "@/lib/constants/WebhookEventType";
import { DbService } from "@/server/services/DbService";
import cuid from "cuid";
import { BaseLogger } from "@/server/services/LoggerService/BaseLogger";
import { WebhookQueueingService } from "@/server/services/WebhookQueueingService";

const handler = async () => {
  const webhookId = "test123";
  const userId = "test123";

  const logger = new BaseLogger({
    traceId: cuid(),
    spanId: cuid(),
    service: "heartbeat",
  });

  let { user } = await DbService.user.getUserById({ userId });
  if (!user) {
    const { user: newUser } = await DbService.user.createUser({
      userId: userId,
      userArgs: { email: userId + "@test.com" },
    });
    user = newUser;
  }

  let { webhook } = await DbService.webhook.getWebhookById({ webhookId });
  if (!webhook) {
    const { webhook: newWebhook } = await DbService.webhook.createWebhook({
      webhookId,
      webhookArgs: {
        url: "https://webhook.site/88518b03-9c26-4160-bb58-f20bb8da6720",
        userId: user.id,
      },
    });
    webhook = newWebhook;
  }

  WebhookQueueingService.enqueueJob({
    type: WebhookEventType.event_triggered,
    userId: webhook.userId,
    webhookId: webhook.id,
    webhookEventId: cuid(),
    logger,
    data: {
      message: "this is a test",
    },
  });

  return new Response("doki doki");
};

export { handler as GET };
