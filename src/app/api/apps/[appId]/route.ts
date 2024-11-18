import { getServerSession } from "next-auth";
import { authOptions } from "@/config/nextAuth";
import { AppDbService } from "@/server/services/DbService/AppDbService";
import { NextRequest } from "next/server";

// Get specific app
export async function GET(
  request: NextRequest,
  { params }: { params: { appId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { app } = await AppDbService.getAppById({ appId: params.appId });

    if (!app) {
      return new Response("Not found", { status: 404 });
    }

    // Only allow access if user owns the app
    if (app.userId !== session.user?.email) {
      return new Response("Forbidden", { status: 403 });
    }

    return Response.json({ app });
  } catch (error) {
    console.error("Error getting app", error);
    return Response.json({ error: "Failed to get app" }, { status: 500 });
  }
}

// Update app
export async function PATCH(
  request: NextRequest,
  { params }: { params: { appId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { app } = await AppDbService.updateApp({
      appId: params.appId,
      appArgs: body,
    });

    return Response.json({ app });
  } catch (error) {
    console.error("Error updating app", error);
    return Response.json({ error: "Failed to update app" }, { status: 500 });
  }
}

// Delete app
export async function DELETE(
  request: NextRequest,
  { params }: { params: { appId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    // First check if the app exists and belongs to the user
    const { app } = await AppDbService.getAppById({ appId: params.appId });

    if (!app) {
      return new Response("Not found", { status: 404 });
    }

    if (app.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    // Since I notice there's no delete function in AppDbService,
    // we'll use update to set deletedAt
    await AppDbService.updateApp({
      appId: params.appId,
      appArgs: {
        deletedAt: new Date(),
      },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting app", error);
    return Response.json({ error: "Failed to delete app" }, { status: 500 });
  }
}
