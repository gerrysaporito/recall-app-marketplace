import { redirect } from "next/navigation";

export default function AppsPage() {
  redirect("/dashboard/apps/me");
}
