"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AppType } from "@/lib/schemas/AppSchema";
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
import { useSession } from "next-auth/react";

interface AppsViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: AppType | null;
}

export function AppsViewDialog({
  open,
  onOpenChange,
  app,
}: AppsViewDialogProps) {
  const { data: session } = useSession();
  if (!app) return null;

  const isOwner = session?.user?.email === app.userEmail;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{app.name}</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            {app.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Created By
                </label>
                <p className="text-sm">{app.userEmail}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Created At
                </label>
                <p className="text-sm">
                  {new Date(app.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {app.dataFields.map((field) => (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium">{field.key}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {field.value || "Not specified"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Webhook Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    URL
                  </label>
                  <p className="text-sm break-all font-mono bg-muted p-2 rounded-md">
                    {app.webhook.url}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
