"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BotAppType } from "@/lib/schemas/BotAppSchema";
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

interface BotAppsViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botApp: BotAppType | null;
}

export function BotAppsViewDialog({
  open,
  onOpenChange,
  botApp,
}: BotAppsViewDialogProps) {
  if (!botApp) return null;

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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">App Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {botApp.botAppDataFields.map((field) => (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium">{field.key}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {field.value || "Not set"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={field.value ? "default" : "secondary"}>
                          {field.value ? "Configured" : "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                  {new Date(botApp.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
