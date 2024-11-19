"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash, Eye } from "lucide-react";
import { useState } from "react";
import { BotAppsUpdateDialog } from "./BotAppsUpdateDialog";
import { BotAppsDeleteDialog } from "./BotAppsDeleteDialog";
import { BotAppsViewDialog } from "./BotAppsViewDialog";
import { BotAppType } from "@/lib/schemas/BotAppSchema";
import { Badge } from "@/components/ui/badge";
import { BotAppsCreateDialog } from "./BotAppsCreateDialog";

interface BotAppsListProps {
  botId: string;
  botApps: BotAppType[];
  isOwner: boolean;
}

export function BotAppsList({ botId, botApps, isOwner }: BotAppsListProps) {
  const [selectedBotApp, setSelectedBotApp] = useState<BotAppType | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">
          Connected Apps
        </h3>
        {isOwner && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
          >
            Add App
          </Button>
        )}
      </div>

      {!botApps.length ? (
        <div className="text-center text-xs text-muted-foreground py-6">
          No apps connected to this bot. Add one to get started
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>App Name</TableHead>
              <TableHead>Fields</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {botApps.map((botApp) => (
              <TableRow key={botApp.appId}>
                <TableCell>{botApp.appId}</TableCell>
                <TableCell>
                  {botApp.botAppDataFields.length} configured
                </TableCell>
                <TableCell>
                  <Badge variant="outline">Active</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedBotApp(botApp);
                          setIsViewOpen(true);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      {isOwner && (
                        <>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBotApp(botApp);
                              setIsUpdateOpen(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBotApp(botApp);
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <BotAppsCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        botId={botId}
      />
      <BotAppsViewDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        botApp={selectedBotApp}
      />
      <BotAppsUpdateDialog
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        botApp={selectedBotApp}
      />
      <BotAppsDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        botApp={selectedBotApp}
      />
    </div>
  );
}
