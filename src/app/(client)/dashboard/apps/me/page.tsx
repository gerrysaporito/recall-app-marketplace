"use server";

import { getServerSession } from "next-auth";
import { AppsContainer } from "../_components/AppsContainer";
import { authOptions } from "@/config/nextAuth";

export default async function MyAppsPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Apps</h1>
      <AppsContainer filters={{ userId: session?.user?.id }} />
    </div>
  );
}
