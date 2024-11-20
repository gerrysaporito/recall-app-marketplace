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
import { BotTemplateUpdateDialog } from "./BotTemplateUpdateDialog";
import { BotTemplateDeleteDialog } from "./BotTemplateDeleteDialog";
import { BotTemplatesFilterType } from "@/server/services/DbService/BotTemplateDbService";
import { useFilteredBotTemplates } from "@/components/api/useFilteredBotTemplates";
import { BotTemplateType } from "@/lib/schemas/BotTemplateSchema";
import { useSession } from "next-auth/react";
import { BotTemplateViewDialog } from "./BotTemplateViewDialog";
import { BotTemplateAppsList } from "./bot-template-apps/BotTemplateAppsList";
import { BotTemplateDeployButton } from "./BotTemplateDeployButton";

export function BotTemplateList({
  searchTerm,
  filters,
}: {
  searchTerm: string;
  filters: BotTemplatesFilterType;
}) {
  const { data: session } = useSession();
  const [selectedBot, setSelectedBot] = useState<BotTemplateType | null>(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const { data, isLoading } = useFilteredBotTemplates(searchTerm, filters);

  if (isLoading) return <div>Loading...</div>;

  if (!data?.botTemplates.length) {
    return (
      <div className="text-center text-xs text-muted-foreground py-10">
        No bots found. Create one to get started
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {data?.botTemplates.map((botTemplate) => (
          <Card key={botTemplate.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{botTemplate.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <BotTemplateDeployButton botTemplate={botTemplate} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedBot(botTemplate);
                          setIsViewOpen(true);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      {session?.user?.email === botTemplate.userEmail && (
                        <>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBot(botTemplate);
                              setIsUpdateOpen(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBot(botTemplate);
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
              </div>
            </CardHeader>
            <CardContent>
              <BotTemplateAppsList
                botTemplate={botTemplate}
                botTemplateApps={botTemplate.botTemplateApps}
                isOwner={session?.user?.id === botTemplate.userId}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <BotTemplateViewDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        botTemplate={selectedBot}
      />
      <BotTemplateUpdateDialog
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        botTemplate={selectedBot}
      />
      <BotTemplateDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        botTemplate={selectedBot}
      />
    </>
  );
}
