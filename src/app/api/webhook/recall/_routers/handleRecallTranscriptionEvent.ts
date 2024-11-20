import { DbService } from "@/server/services/DbService";
import { z } from "zod";
import { RecallWebhookEventSchema } from "../route";
import { OpenAiService } from "@/server/services/OpenAiService";
import { ServerLogger } from "@/server/services/LoggerService/ServerLogger";
import {
  TriggerEventTemplateSchema,
  TriggerEventTemplateType,
} from "@/lib/schemas/TriggerEventSchema";
import {
  BotTriggerEventSchema,
  BotTriggerEventType,
} from "@/lib/schemas/BotTriggerEventSchema";
import { WebhookQueueingService } from "@/server/services/WebhookQueueingService";
import { WebhookEventType } from "@/lib/constants/WebhookEventType";

export const handleRecallTranscription = async (
  data: z.infer<typeof RecallWebhookEventSchema>["data"],
  logger: ServerLogger
) => {
  // Find our bot using Recall's bot ID
  const { bot } = await DbService.bot.getBotByRecallBotId({
    recallBotId: data.bot_id,
  });
  if (!bot) {
    throw new Error("Bot not found");
  }

  // Save chat transcript for current event
  const latestWords = data.transcript.words.map((word) => ({
    speakerId: data.transcript.speaker_id.toString(),
    speakerName: data.transcript.speaker,
    word: word.text.toLowerCase(),
    startTime: word.start_time,
    endTime: word.end_time,
    confidence: word.confidence,
  }));
  await DbService.botTranscript.createBotTranscripts({
    botId: bot.id,
    recordingId: data.recording_id,
    words: latestWords,
  });

  // Check for trigger word in latest data within 30s
  const { botTranscripts: latestBotTranscripts } =
    await DbService.botTranscript.searchBotTranscripts({
      filters: {
        botId: bot.id,
        recordingId: data.recording_id,
        speakerId: data.transcript.speaker_id.toString(),
        startTime: latestWords[0].startTime - 30, // This is in seconds from when the meeting started
      },
      page: 1,
      itemsPerPage: 10000,
    });
  const recallWord = latestBotTranscripts.find((transcript) =>
    transcript.word.toLowerCase().includes(bot.name.toLowerCase())
  );
  if (!recallWord) {
    logger.info({
      message: `No ${bot.name} word seen in the last 30s`,
      metadata: {
        botId: bot.id,
        recordingId: data.recording_id,
        latestPhrase: latestWords.map((word) => word.word).join(" "),
      },
    });
    return;
  }

  // Get all chat transcripts for this speaker
  const { botTranscripts } = await DbService.botTranscript.searchBotTranscripts(
    {
      filters: {
        botId: bot.id,
        recordingId: data.recording_id,
        speakerId: data.transcript.speaker_id.toString(),
      },
      page: 1,
      itemsPerPage: 10000,
    }
  );
  const { botTemplate } = bot;

  // Parse the template data into trigger events
  const triggerEventTemplates = botTemplate.botTemplateApps.map((app) => {
    const appData = app.botTemplateAppDataFields.reduce((acc, field) => {
      if (field.value) {
        acc[field.key] = field.value;
      }
      return acc;
    }, {} as Record<string, string>);

    return TriggerEventTemplateSchema.parse({
      actionName: app.app.name,
      recordingId: data.recording_id,
      speakerName: data.transcript.speaker ?? null,
      speakerId: data.transcript.speaker_id.toString(),
      recallBotId: data.bot_id,
      missingData: appData,
      botId: bot.id,
      botTemplateAppId: app.id,
    } satisfies TriggerEventTemplateType);
  });

  // Pass transcripts and trigger event templates to OpenAI
  const matchedEvents = await OpenAiService.analyzeTranscript({
    triggerName: bot.name,
    triggerEventTemplates,
    transcriptWords: botTranscripts, // latestBotTranscripts,
    logger,
  });

  const rawTriggerEvents = matchedEvents.map((event) =>
    BotTriggerEventSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
    }).parse({
      ...event,
      // AI hallucinates this number slightly so round up to the nearest 10 to keep it consistent
      triggerEventId: (Math.ceil(event.recallTimestamp / 10) * 10).toString(),
      data: {
        ...triggerEventTemplates.find(
          (template) => template.actionName === event.actionName
        )?.missingData,
        ...event.missingData,
      },
      actionName: event.actionName,
    } satisfies Omit<BotTriggerEventType, "id" | "createdAt" | "updatedAt">)
  );

  logger.info({
    message: "Trigger events parsed",
    metadata: {
      count: rawTriggerEvents.length,
      triggerEvents: rawTriggerEvents,
    },
  });

  // Create trigger events for matched templates
  const rawBotTriggerEvents = await Promise.all(
    rawTriggerEvents.map(async (event) => {
      const { botTriggerEvent: existingBotTriggerEvent } =
        await DbService.botTriggerEvent.getTriggerEventForBot({
          botId: bot.id,
          recordingId: data.recording_id,
          triggerEventId: event.triggerEventId,
        });
      if (existingBotTriggerEvent) {
        return;
      }
      const { botTriggerEvent: newBotTriggerEvent } =
        await DbService.botTriggerEvent.createBotTriggerEvent({
          botTriggerEventArgs: event,
        });
      return newBotTriggerEvent;
    })
  );
  const botTriggerEvents = rawBotTriggerEvents.filter((v) => !!v);

  logger.info({
    message: "Bot trigger events created",
    metadata: {
      botId: bot.id,
      recordingId: data.recording_id,
      count: botTriggerEvents.length,
      botTriggerEvents,
    },
  });

  // Emit webhook
  let webhookCount = 0;
  for (const botTriggerEvent of botTriggerEvents) {
    const { botTemplateApp } =
      await DbService.botTemplateApp.getBotTemplateAppById({
        botTemplateAppId: botTriggerEvent.botTemplateAppId,
      });
    if (!botTemplateApp) {
      continue;
    }
    await WebhookQueueingService.enqueueJob({
      webhookId: botTemplateApp.app.webhookId,
      type: WebhookEventType.event_triggered,
      data: botTriggerEvent,
      userId: botTemplateApp.app.userId,
      logger,
    });
    webhookCount += 1;
  }

  logger.info({
    message: "Webhooks enqueued",
    metadata: { count: webhookCount },
  });

  logger.info({
    message: "Recall transcription processed",
    metadata: {
      botId: bot.id,
      recordingId: data.recording_id,
      matchedEventsCount: matchedEvents.length,
    },
  });
};
