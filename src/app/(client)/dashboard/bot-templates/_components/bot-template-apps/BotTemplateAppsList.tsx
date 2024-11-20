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
import { BotTemplateAppsUpdateDialog } from "./BotTemplateAppsUpdateDialog";
import { BotTemplateAppsDeleteDialog } from "./BotTemplateAppsDeleteDialog";
import { BotTemplateAppsViewDialog } from "./BotTemplateAppsViewDialog";
import { BotTemplateAppType } from "@/lib/schemas/BotTemplateAppSchema";
import { Badge } from "@/components/ui/badge";
import { BotTemplateAppsCreateDialog } from "./BotTemplateAppsCreateDialog";
import { BotTemplateType } from "@/lib/schemas/BotTemplateSchema";

interface BotTemplateAppsListProps {
  botTemplate: BotTemplateType;
  botTemplateApps: BotTemplateAppType[];
  isOwner: boolean;
}

export function BotTemplateAppsList({
  botTemplate,
  botTemplateApps,
  isOwner,
}: BotTemplateAppsListProps) {
  const [selectedBotApp, setSelectedBotApp] =
    useState<BotTemplateAppType | null>(null);
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

      {!botTemplateApps.length ? (
        <div className="text-center text-xs text-muted-foreground py-6">
          No apps connected to this botTemplate. Add one to get started
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
            {botTemplateApps.map((botTemplateApp) => (
              <TableRow key={botTemplateApp.app.name}>
                <TableCell>{botTemplateApp.app.name}</TableCell>
                <TableCell>
                  {botTemplateApp.botTemplateAppDataFields.length} configured
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
                          setSelectedBotApp(botTemplateApp);
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
                              setSelectedBotApp(botTemplateApp);
                              setIsUpdateOpen(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBotApp(botTemplateApp);
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

      <BotTemplateAppsCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        botTemplateId={botTemplate.id}
      />
      <BotTemplateAppsViewDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        botTemplateApp={selectedBotApp}
        bot={botTemplate}
      />
      <BotTemplateAppsUpdateDialog
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        botTemplateApp={selectedBotApp}
      />
      <BotTemplateAppsDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        botTemplateApp={selectedBotApp}
      />
    </div>
  );
}
