import { getServerSession } from "next-auth";
import { authOptions } from "@/config/nextAuth";
import { NextRequest } from "next/server";
import { DbService } from "@/server/services/DbService";

// Get specific bot
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const botId = new URL(request.url).pathname.split("/").pop();
    if (!botId) {
      return new Response("Bot ID is required", { status: 400 });
    }
    const { bot } = await DbService.bot.getBotById({ botId });
    if (!bot) {
      return new Response("Not found", { status: 404 });
    }

    return Response.json({ bot });
  } catch (error) {
    console.error("Error getting bot", error);
    return Response.json({ error: "Failed to get bot" }, { status: 500 });
  }
}

// Update bot
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const botId = new URL(request.url).pathname.split("/").pop();
    if (!botId) {
      return new Response("Bot ID is required", { status: 400 });
    }

    const { bot: existingBot } = await DbService.bot.getBotById({ botId });
    if (!existingBot) {
      return new Response("Not found", { status: 404 });
    }
    if (existingBot.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const body = await request.json();
    const { bot } = await DbService.bot.updateBot({
      botId,
      botArgs: body,
    });

    return Response.json({ bot });
  } catch (error) {
    console.error("Error updating bot", error);
    return Response.json({ error: "Failed to update bot" }, { status: 500 });
  }
}

// Delete bot
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const botId = new URL(request.url).pathname.split("/").pop();
    if (!botId) {
      return new Response("Bot ID is required", { status: 400 });
    }

    const { bot } = await DbService.bot.getBotById({ botId });
    if (!bot) {
      return new Response("Not found", { status: 404 });
    }
    if (bot.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    await DbService.bot.updateBot({
      botId,
      botArgs: {
        deletedAt: new Date(),
      },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting bot", error);
    return Response.json({ error: "Failed to delete bot" }, { status: 500 });
  }
}
