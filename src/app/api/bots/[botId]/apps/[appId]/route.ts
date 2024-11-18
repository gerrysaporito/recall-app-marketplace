import { getServerSession } from "next-auth";
import { authOptions } from "@/config/nextAuth";
import { NextRequest } from "next/server";
import { DbService } from "@/server/services/DbService";

// Update bot app configuration
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const pathParts = new URL(request.url).pathname.split("/");
    const botId = pathParts[3];
    const appId = pathParts[5];

    if (!botId || !appId) {
      return new Response("Bot ID and App ID are required", { status: 400 });
    }

    const { bot } = await DbService.bot.getBotById({ botId });
    if (!bot || bot.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const body = await request.json();
    const { botApp } = await DbService.botApp.updateBotApp({
      botAppId: `${botId}_${appId}`,
      botAppArgs: body,
    });

    return Response.json({ botApp });
  } catch (error) {
    console.error("Error updating bot app", error);
    return Response.json(
      { error: "Failed to update bot app" },
      { status: 500 }
    );
  }
}

// Remove app from bot
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const pathParts = new URL(request.url).pathname.split("/");
    const botId = pathParts[3];
    const appId = pathParts[5];

    if (!botId || !appId) {
      return new Response("Bot ID and App ID are required", { status: 400 });
    }

    const { bot } = await DbService.bot.getBotById({ botId });
    if (!bot || bot.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    await DbService.botApp.updateBotApp({
      botAppId: `${botId}_${appId}`,
      botAppArgs: {
        deletedAt: new Date(),
      },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error removing app from bot", error);
    return Response.json({ error: "Failed to remove app" }, { status: 500 });
  }
}
