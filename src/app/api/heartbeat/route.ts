import { RecallService } from "@/server/services/RecallService";

const handler = async () => {
  try {
    const botId = "38bc7f6e-fdc1-4d15-a5d6-5b5427cdee69";
    const message = "This is a test message";

    await RecallService.sendMessage({ recallBotId: botId, message });

    return new Response("doki doki");
  } catch (error) {
    console.error("Error in heartbeat", error);
    return Response.json({ error: "Failed to heartbeat" }, { status: 500 });
  }
};

export { handler as GET };
