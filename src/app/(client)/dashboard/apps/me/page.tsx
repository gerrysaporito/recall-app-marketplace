import { getSession } from "next-auth/react";
import { AppsContainer } from "../_components/AppsContainer";

export default async function MyAppsPage() {
  const session = await getSession();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Apps</h1>
      <AppsContainer filters={{ userId: session?.user?.id }} />
    </div>
  );
}
