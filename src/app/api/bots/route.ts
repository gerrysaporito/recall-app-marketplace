import { getServerSession } from "next-auth";
import { authOptions } from "@/config/nextAuth";
import { NextRequest } from "next/server";
import { DbService } from "@/server/services/DbService";

// Create new bot
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { bot } = await DbService.bot.createBot({
      botArgs: {
        ...body,
        userId: session.user.id,
        userEmail: session.user.email,
      },
    });

    return Response.json({ bot }, { status: 201 });
  } catch (error) {
    console.error("Error creating bot", error);
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
