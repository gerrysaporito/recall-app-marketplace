"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BotTemplateAppType } from "@/lib/schemas/BotTemplateAppSchema";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BotTemplateAppsViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botTemplateApp: BotTemplateAppType | null;
}

export function BotTemplateAppsViewDialog({
  open,
  onOpenChange,
  botTemplateApp,
}: BotTemplateAppsViewDialogProps) {
  if (!botTemplateApp) return null;

  // Filter fields by type
  const editableFields = botTemplateApp.botTemplateAppDataFields.filter(
    (field) => field.type === "editable"
  );
  const commandFields = botTemplateApp.botTemplateAppDataFields.filter(
    (field) => field.type === "command"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">App Details</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            View the configuration and details for this app
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {commandFields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usage Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Follow these steps exactly:
                    </p>
                    <div className="rounded-md border-l-4 border-yellow-500 bg-yellow-50 p-4">
                      <p className="text-sm font-semibold text-yellow-800">
                        Important: All commands must be mentioned in a single
                        message
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      1. Start with:
                    </p>
                    <p className="font-mono text-sm bg-muted p-2 rounded-md">
                      hey recall
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">
                      2. Then say each of these commands and their values (you
                      can speak this naturally and recall will parse the
                      information):
                    </p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Command</TableHead>
                        <TableHead>Example</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commandFields.map((field) => (
                        <TableRow key={field.id}>
                          <TableCell className="font-medium">
                            {field.key}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {field.key} {field.value}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      3. Finally, end with:
                    </p>
                    <p className="font-mono text-sm bg-muted p-2 rounded-md">
                      thanks recall
                    </p>
                    <div className="rounded-md border-l-4 border-red-500 bg-red-50 p-4 mt-4">
                      <p className="text-sm font-semibold text-red-800">
                        ⚠️ You must include ALL commands above in a single
                        message before saying "thanks recall" or the bot will
                        fail
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">App Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              {editableFields.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editableFields.map((field) => (
                      <TableRow key={field.id}>
                        <TableCell className="font-medium">
                          {field.key}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {field.value || "Not set"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={field.value ? "default" : "secondary"}
                          >
                            {field.value ? "Configured" : "Pending"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-sm text-muted-foreground">
                  This app has no editable fields
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Integration Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Integration Status
                </label>
                <div className="mt-1">
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Added On
                </label>
                <div className="mt-1">
                  {new Date(botTemplateApp.createdAt).toLocaleString(
                    undefined,
                    {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
