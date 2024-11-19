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

    const botTemplateId = new URL(request.url).pathname.split("/")[3];
    if (!botTemplateId) {
      return new Response("Bot ID is required", { status: 400 });
    }

    // Check bot exists and user owns it
    const { botTemplate } = await DbService.botTemplate.getBotTemplateById({
      botTemplateId,
    });
    if (!botTemplate) {
      return new Response("Bot not found", { status: 404 });
    }
    if (botTemplate.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const body = await request.json();

    // Check app exists
    const { app } = await DbService.app.getAppById({ appId: body.appId });
    if (!app) {
      return new Response("App not found", { status: 404 });
    }

    // Create the bot app first
    const { botTemplateApp } =
      await DbService.botTemplateApp.createBotTemplateApp({
        botTemplateAppArgs: {
          botTemplateId,
          appId: body.appId,
        },
      });

    // Prepare data fields with defaults from app schema
    const dataFields = app.dataFields.map((field) => ({
      ...field,
      value:
        body.botTemplateAppDataFields?.find((f: any) => f.key === field.key)
          ?.value ?? field.value,
      appDataFieldId: field.id,
      botTemplateAppId: botTemplateApp.id,
    }));
    console.log(
      dataFields.filter((dataField) => dataField.type === "editable")
    );

    // Upsert all data fields
    for (const field of dataFields) {
      await DbService.botTemplateAppDataField.createBotTemplateAppDataField({
        botTemplateAppDataFieldArgs: field,
      });
    }

    // Fetch the complete bot app with its relations
    const { botTemplateApp: updatedBotTemplateApp } =
      await DbService.botTemplateApp.getBotTemplateAppById({
        botTemplateAppId: botTemplateApp.id,
      });

    return Response.json(
      { botTemplateApp: updatedBotTemplateApp },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding app to bot", error);
    return Response.json(
      { error: "Failed to add app to bot" },
      { status: 500 }
    );
  }
}
