import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { BotTemplateType } from "@/lib/schemas/BotTemplateSchema";

export function useFetchBotTemplates(botTemplateId: string) {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/auth");
    },
  });

  return useQuery({
    queryKey: ["bot-templates", botTemplateId],
    queryFn: async () => {
      const response = await fetch(`/api/bot-templates/${botTemplateId}`, {
        credentials: "include",
        headers: { "Cache-Control": "no-cache" },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await signOut({ redirect: false });
          router.push("/auth");
          throw new Error("Session expired. Please sign in again.");
        }
        throw new Error("Failed to fetch bot");
      }

      return response.json() as Promise<{ botTemplate: BotTemplateType }>;
    },
    enabled: !!session && !!botTemplateId,
  });
}
