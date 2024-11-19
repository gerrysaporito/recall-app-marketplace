"use server";

import { getServerSession } from "next-auth";
import { BotTemplateContainer } from "../_components/BotTemplateContainer";
import { authOptions } from "@/config/nextAuth";

export default async function MyBotsPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Bot Templates</h1>
      <BotTemplateContainer filters={{ userId: session?.user?.id }} />
    </div>
  );
}
