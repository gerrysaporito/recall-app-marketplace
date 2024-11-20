import { NextResponse } from "next/server";
import { ServerLogger } from "@/server/services/LoggerService/ServerLogger";
import cuid from "cuid";
import { WebhookEventType } from "@/lib/constants/WebhookEventType";
import { z } from "zod";
import { BotTriggerEventSchema } from "@/lib/schemas/BotTriggerEventSchema";
import { DiscordService } from "@/server/services/DiscordService";

export async function POST(request: Request) {
  const logger = new ServerLogger({
    traceId: cuid(),
    spanId: "dummy-web-app-webhook",
  });

  let body;

  try {
    body = await request.json();

    const result = z
      .object({
        webhookId: z.string(),
        webhookEventId: z.string(),
        type: z.nativeEnum(WebhookEventType),
        data: BotTriggerEventSchema.omit({ createdAt: true, updatedAt: true }),
      })
      .safeParse(body);

    if (!result.success) {
      logger.error({
        message: "Invalid webhook event",
        error: result.error,
        metadata: { body },
      });
      return NextResponse.json({}, { status: 400 });
    }
    const { type, data } = result.data;

    logger.info({
      message: "Received Recall webhook event",
      metadata: { ...result.data },
    });

    if (type !== WebhookEventType.event_triggered) {
      return NextResponse.json({}, { status: 200 });
    }

    // Handle the different types of events
    if (data.actionName.toLowerCase().includes("slack")) {
      logger.info({
        message: "Pinging slack channel",
        metadata: { ...data },
      });
      await DiscordService.sendSev2Alert({
        content: `You have been summoned to the google meets call`,
        error: new Error(`You have been summoned`),
      });
      const url = `http://localhost:3000/api/v1/bot/${data.botId}/message`;
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          message: `Notified the slack peeps, we'll see if they can make it`,
        }),
      });
      const responseData = await response.json();
      logger.info({
        message: "Created and sent google docs message",
        metadata: { responseData },
      });
    } else if (data.actionName.toLowerCase().includes("doc")) {
      logger.info({
        message: "Opening google docs",
        metadata: { ...data },
      });
      const url = `http://localhost:3000/api/v1/bot/${data.botId}/message`;
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          message: `Here's a link to the google docs: https://docs.new`,
        }),
      });
      const responseData = await response.json();
      logger.info({
        message: "Created and sent google docs message",
        metadata: { responseData },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({
      message: "Failed to process Recall webhook",
      error: error as Error,
      metadata: {
        origin: request.url,
        body,
      },
    });
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
