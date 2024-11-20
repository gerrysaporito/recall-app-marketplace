import { DiscordAPIError, REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { z } from "zod";
import { env } from "@/config/env.mjs";

enum DiscordChannelId {
  Sev1 = "1281465265548296222",
  Sev2 = "1281465294187135026",
  BillingNotifications = "1281465439410589710",
  AccountNotifications = "1281465487263272980",
  Sandbox = "1289490221838241822",
}

let discordClient: REST;

if (typeof window === "undefined") {
  if (!global.discord) {
    global.discord = new REST({ version: "10" }).setToken(
      env.DISCORD_BOT_TOKEN
    );
  }
  discordClient = global.discord;
}

export const DiscordService = {
  _sendMessage: async function (args: {
    channelId: DiscordChannelId;
    content: string;
  }) {
    if (typeof window !== "undefined") {
      console.error("DiscordService._sendMessage called on client side");
      return;
    }

    if (process.env.LOCAL_DO_NOT_SEND_DISCORD_ALERT === "true") {
      console.log("DiscordService._sendMessage: SKIPPED by env var");
      return;
    }

    const { content } = z
      .object({
        channelId: z.nativeEnum(DiscordChannelId),
        content: z.string(),
      })
      .parse(args);

    // Ignore all other channels and only post to sandbox
    const channelId = DiscordChannelId.Sandbox;

    try {
      await discordClient.post(Routes.channelMessages(channelId), {
        body: { content },
      });
    } catch (error) {
      if (error instanceof DiscordAPIError) {
        console.error(
          `Discord API Error: ${error.message}, Code: ${error.code}, Status: ${error.status}`
        );
        if (error.code === 50001) {
          console.error(
            `Bot lacks permissions for channel ${channelId}. Please check bot permissions.`
          );
        }
      } else {
        console.error(`Failed to send message to channel ${channelId}:`, error);
      }
      throw new Error(`Failed to send message to channel ${channelId}`);
    }
  },

  sendAccountNotification: async function (args: { content: string }) {
    const { content } = z.object({ content: z.string() }).parse(args);
    await this._sendMessage({
      channelId: DiscordChannelId.AccountNotifications,
      content,
    });
  },

  sendBillingNotification: async function (args: { content: string }) {
    const { content } = z.object({ content: z.string() }).parse(args);
    await this._sendMessage({
      channelId: DiscordChannelId.BillingNotifications,
      content,
    });
  },

  sendSev1Alert: async function (args: { content: string }) {
    const { content } = z.object({ content: z.string() }).parse(args);
    await this._sendMessage({
      channelId: DiscordChannelId.Sev1,
      content,
    });
  },

  sendSev2Alert: async function (args: { content: string; error: Error }) {
    const { content, error } = z
      .object({ content: z.string(), error: z.instanceof(Error) })
      .parse(args);

    const message = `🚨 Sev2 Alert 🚨
${content}

\`\`\`
${JSON.stringify({ error, cause: error.cause }, null, 2)}
\`\`\`
`;

    await this._sendMessage({
      channelId: DiscordChannelId.Sev2,
      content: message,
    });
  },

  // Abstract functions for specific events
  notifyNewSignUp: async function (args: { email: string }) {
    const { email } = z.object({ email: z.string().email() }).parse(args);
    const content = `🎉 New user signed up: ${email}`;
    await this.sendAccountNotification({ content });
  },

  notifyVerificationSuccess: async function (args: { email: string }) {
    const { email } = z.object({ email: z.string().email() }).parse(args);
    const content = `✅ User verified successfully: ${email}`;
    await this.sendAccountNotification({ content });
  },
};
