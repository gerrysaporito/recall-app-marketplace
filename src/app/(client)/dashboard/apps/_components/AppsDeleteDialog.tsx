"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function AppsDeleteDialog({
  open,
  onOpenChange,
  app,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: any;
}) {
  const queryClient = useQueryClient();

  const deleteApp = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/apps/${app?.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete app");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      onOpenChange(false);
      toast.success("App deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete app");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete App</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {app?.name}? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteApp.mutate()}
            disabled={deleteApp.isPending}
          >
            {deleteApp.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
