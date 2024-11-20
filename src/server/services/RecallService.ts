import { env } from "@/config/env.mjs";
import { APP_URL } from "@/lib/routes";
import { z } from "zod";
import { RedisValueType } from "@/lib/schemas/RedisValueSchema";
import { RedisService } from "./RedisService";

const CreateBotSchema = z.object({
  botName: z.string(),
  meetingUrl: z.string(),
});

const SendMessageSchema = z.object({
  recallBotId: z.string(),
  message: z.string(),
});

const baseUrl = "https://us-west-2.recall.ai/api/v1";
const webhookUrl = `${APP_URL}/api/webhook/recall`;

export const RecallService = {
  _headers: {
    Authorization: `${env.RECALL_API_KEY}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  },

  createBot: async function (args: z.infer<typeof CreateBotSchema>) {
    const { botName, meetingUrl } = CreateBotSchema.parse(args);

    const url = `${baseUrl}/bot`;
    const response = await fetch(url, {
      method: "POST",
      headers: this._headers,
      body: JSON.stringify({
        bot_name: botName,
        meeting_url: meetingUrl,
        transcription_options: {
          provider: "assembly_ai",
        },
        real_time_transcription: {
          destination_url: webhookUrl,
        },
      }),
    });

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(`Failed to create Recall bot: ${response.statusText}`);
    }

    const result = JSON.parse(responseText);
    return z.object({ id: z.string() }).parse(result);
  },

  sendMessage: async function (args: z.infer<typeof SendMessageSchema>) {
    const { recallBotId, message } = SendMessageSchema.parse(args);

    const url = `${baseUrl}/bot/${recallBotId}/send_chat_message`;
    const response = await fetch(url, {
      method: "POST",
      headers: this._headers,
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to send message to Recall bot: ${response.statusText}`
      );
    }

    return response.json();
  },

  sendProcessingMessage: async function (args: { recallBotId: string }) {
    const { recallBotId } = z.object({ recallBotId: z.string() }).parse(args);

    const lockKey = `bot.processingLock.${recallBotId}`;

    const lock = await RedisService.cacheGet({ key: lockKey });
    if (lock) {
      return;
    }
    // Only send one processing message at a time for a given bot
    await RedisService.cacheSet({
      key: lockKey,
      value: { type: RedisValueType.bot_processingLock, data: {} },
      ttlSeconds: 15,
    });

    const messages = [
      "On it, give me a few seconds", // Serious
      "Got it. Please bear with me while I work on this", // Business Professional
      "Hang tight, I'm taking care of it", // Casual
      "Hold your horses. I'm on it", // Funny
      "Working on it right now", // Business Professional
      "Way ahead of you, I'm addressing this as we speak", // Serious
      "Just a sec", // Casual
      "Keep your shirt on; I'm working on it", // Funny
      "One moment please", // Business Professional
      "Sit tight while I deal with it", // Casual
      "I don't get paid enough to deal with this but I'll do it anyways", // Funny
      "Give me a moment to sort this one out", // Business Professional
      "I'm on the case, hold on", // Casual
      "Please wait while I resolve this", // Business Professional
      "Hang on, I'm working through it", // Casual
      "I'm currently working on it", // Serious
      "Wait a tick, I'm on the case", // Funny
      "Let me get back to you shortly", // Business Professional
      "Don't worry I've got this", // Casual
      "Don't touch that dial, I'm handling it", // Funny
      "Hold up, I'm getting to it", // Casual
      "I'll get this sorted out right away", // Serious
      "I'm taking care of it, please stand by", // Business Professional
      "Working on it won't be long now", // Casual
      "I'll have an update for you soon", // Business Professional
      "Let me look into that for you", // Casual
      "I'm on top of it just a minute", // Serious
      "I'll get on it quicker than a hiccup", // Funny
    ];

    await this.sendMessage({
      recallBotId,
      message: messages[Math.floor(Math.random() * messages.length)],
    });
  },
};
