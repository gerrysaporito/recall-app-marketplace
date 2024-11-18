"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash, Eye } from "lucide-react";
import { useState } from "react";
import { BotsUpdateDialog } from "./BotsUpdateDialog";
import { BotsDeleteDialog } from "./BotsDeleteDialog";
import { BotsFilterType } from "@/server/services/DbService/BotDbService";
import { useFilteredBots } from "@/components/api/useFilteredBots";
import { BotType } from "@/lib/schemas/BotSchema";
import { useSession } from "next-auth/react";
import { BotsViewDialog } from "./BotsViewDialog";

export function BotsList({
  searchTerm,
  filters,
}: {
  searchTerm: string;
  filters: BotsFilterType;
}) {
  const { data: session } = useSession();
  const [selectedBot, setSelectedBot] = useState<BotType | null>(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const { data, isLoading } = useFilteredBots(searchTerm, filters);

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {data?.bots.map((bot) => (
          <Card key={bot.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{bot.name}</CardTitle>
                  <CardDescription>
                    Meeting URL: {bot.meetingUrl}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedBot(bot);
                        setIsViewOpen(true);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    {session?.user?.email === bot.userEmail && (
                      <>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedBot(bot);
                            setIsUpdateOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedBot(bot);
                            setIsDeleteOpen(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <BotsViewDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        bot={selectedBot}
      />
      <BotsUpdateDialog
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        bot={selectedBot}
      />
      <BotsDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        bot={selectedBot}
      />
    </>
  );
}
