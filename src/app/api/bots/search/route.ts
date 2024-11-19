import { getServerSession } from "next-auth";
import { authOptions } from "@/config/nextAuth";
import { NextRequest } from "next/server";
import { DbService } from "@/server/services/DbService";
import { SearchBotsSchema } from "@/server/services/DbService/BotDbService";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    // Let the DbService handle the validation
    const { bots, totalCount } = await DbService.bot.searchBots({
      filters: {
        ...body.filters,
        userId: session.user.id, // Ensure user can only search their own bots
      },
      page: body.page,
      itemsPerPage: body.itemsPerPage,
    });

    return Response.json({
      bots,
      totalCount,
      pagination: {
        page: body.page,
        itemsPerPage: body.itemsPerPage,
        totalPages: Math.ceil(totalCount / body.itemsPerPage),
      },
    });
  } catch (error) {
    console.error("Error searching bots", error);
    return Response.json({ error: "Failed to search bots" }, { status: 500 });
  }
}
