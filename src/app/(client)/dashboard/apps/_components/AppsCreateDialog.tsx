"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoIconTooltip } from "@/components/ui/custom/info-icon-tooltip";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { Textarea } from "@/components/ui/textarea";

interface AppDataField {
  key: string;
  value?: string;
}

interface CreateAppForm {
  name: string;
  description: string;
  webhookUrl: string;
  dataFields: AppDataField[];
}

export function AppsCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, watch, setValue } =
    useForm<CreateAppForm>({
      defaultValues: {
        dataFields: [{ key: "", value: "" }],
      },
    });

  const dataFields = watch("dataFields");

  const addDataField = () => {
    setValue("dataFields", [...dataFields, { key: "", value: "" }]);
  };

  const removeDataField = (index: number) => {
    const newFields = dataFields.filter((_, i) => i !== index);
    setValue("dataFields", newFields);
  };

  const createApp = useMutation({
    mutationFn: async (data: CreateAppForm) => {
      const response = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dataFields: data.dataFields.map((field) => ({
            ...field,
            value: field.value?.trim().includes("{{")
              ? "{{command}}"
              : field.value?.trim(),
            type: !field.value
              ? "editable"
              : field.value.trim().includes("{{")
              ? "command"
              : "constant",
          })),
        }),
      });
      if (!response.ok) throw new Error("Failed to create app");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      onOpenChange(false);
      reset();
      toast.success("App created successfully");
    },
    onError: () => {
      toast.error("Failed to create app");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New App</DialogTitle>
          <DialogDescription>
            Configure your app and its data fields. Data fields will be sent to
            your app via webhook.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => createApp.mutate(data))}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register("name", { required: true })}
                placeholder="My App"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description", { required: true })}
                placeholder="Describe what your app does..."
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                {...register("webhookUrl", {
                  required: true,
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message:
                      "Must be a valid URL starting with http:// or https://",
                  },
                })}
                placeholder="https://api.example.com/webhook"
              />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Label>Data Fields</Label>
                    <InfoIconTooltip>
                      <div className="space-y-1 text-xs">
                        <p className="font-medium">Value Types:</p>
                        <ul className="list-disc ml-4">
                          <li>
                            <span className="font-medium">Empty value:</span>{" "}
                            User must provide this value when adding app to
                            their bot (e.g., API keys)
                          </li>
                          <li>
                            <span className="font-medium">
                              "{`{{command}}`}":
                            </span>{" "}
                            User must say trigger word (key name) + value in
                            real-time
                          </li>
                          <li>
                            <span className="font-medium">"constant":</span>{" "}
                            Fixed value that you set and cannot be seen or
                            modified by users
                          </li>
                        </ul>
                      </div>
                    </InfoIconTooltip>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDataField}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field
                  </Button>
                </div>
                <div className="space-y-2">
                  {dataFields.map((field, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="space-y-1 flex-1">
                        <Input
                          placeholder="Key (e.g., apiKey, eventName)"
                          {...register(`dataFields.${index}.key`)}
                        />
                        <div className="text-xs text-muted-foreground px-2">
                          The identifier for this field
                        </div>
                      </div>
                      <div className="space-y-1 flex-1">
                        <Input
                          placeholder="Value (leave empty, {{command}}, or constant)"
                          {...register(`dataFields.${index}.value`)}
                        />
                        <div className="text-xs text-muted-foreground px-2">
                          How this value will be collected
                        </div>
                      </div>
                      {dataFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDataField(index)}
                          className="mt-1"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createApp.isPending}
              >
                {createApp.isPending ? "Creating..." : "Create App"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
