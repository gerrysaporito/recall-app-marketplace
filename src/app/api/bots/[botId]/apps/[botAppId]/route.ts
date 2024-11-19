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
    const botAppId = pathParts[5];

    if (!botId || !botAppId) {
      return new Response("Bot ID and Bot App ID are required", {
        status: 400,
      });
    }

    // Verify bot ownership
    const { bot } = await DbService.bot.getBotById({ botId });
    if (!bot || bot.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    // Verify bot app exists and belongs to this bot
    const existingBotApp = bot.botApps.find((app) => app.id === botAppId);
    if (!existingBotApp) {
      return new Response("Bot app not found", { status: 404 });
    }

    const body = await request.json();

    // Prepare data fields with defaults from app schema
    const dataFields = existingBotApp.botAppDataFields.map((field) => ({
      id: field.id,
      value:
        body.botAppDataFields?.find((f: any) => f.key === field.key)?.value ??
        null,
    }));

    // Upsert all data fields
    for (const field of dataFields) {
      await DbService.botAppDataField.updateBotAppDataField({
        botAppDataFieldId: field.id,
        botAppDataFieldArgs: field,
      });
    }

    const { botApp: updatedBotApp } = await DbService.botApp.getBotAppById({
      botAppId,
    });

    return Response.json({ botApp: updatedBotApp });
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
    const botAppId = pathParts[5];

    if (!botId || !botAppId) {
      return new Response("Bot ID and Bot App ID are required", {
        status: 400,
      });
    }

    // Verify bot ownership
    const { bot } = await DbService.bot.getBotById({ botId });
    if (!bot || bot.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    // Verify bot app exists and belongs to this bot
    const existingBotApp = bot.botApps.find((app) => app.id === botAppId);
    if (!existingBotApp) {
      return new Response("Bot app not found", { status: 404 });
    }

    // Soft delete the bot app
    await DbService.botApp.updateBotApp({
      botAppId,
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
