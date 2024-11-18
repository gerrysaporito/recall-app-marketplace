"use server";

import { getServerSession } from "next-auth";
import { BotsContainer } from "../_components/BotsContainer";
import { authOptions } from "@/config/nextAuth";

export default async function MyBotsPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Bots</h1>
      <BotsContainer filters={{ userId: session?.user?.id }} />
    </div>
  );
}
