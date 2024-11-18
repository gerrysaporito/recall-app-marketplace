import { getServerSession } from "next-auth";
import { authOptions } from "@/config/nextAuth";
import { NextRequest } from "next/server";
import { DbService } from "@/server/services/DbService";

// Add app to bot
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const botId = new URL(request.url).pathname.split("/")[3];
    if (!botId) {
      return new Response("Bot ID is required", { status: 400 });
    }

    const { bot } = await DbService.bot.getBotById({ botId });
    if (!bot) {
      return new Response("Bot not found", { status: 404 });
    }
    if (bot.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const body = await request.json();
    const { botApp } = await DbService.botApp.createBotApp({
      botAppArgs: {
        ...body,
        botId,
      },
    });

    return Response.json({ botApp }, { status: 201 });
  } catch (error) {
    console.error("Error adding app to bot", error);
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
