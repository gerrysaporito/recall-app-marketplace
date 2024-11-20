import { useToast } from "@/components/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BotTemplateType } from "@/lib/schemas/BotTemplateSchema";
import { useState } from "react";

interface BotTemplateDeployDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botTemplate: BotTemplateType;
  onDeploy: (deployData: DeploymentData) => Promise<void>;
}

export interface DeploymentData {
  meetingUrl: string;
  botName: string;
}

export function BotTemplateDeployDialog({
  open,
  onOpenChange,
  botTemplate,
  onDeploy,
}: BotTemplateDeployDialogProps) {
  const [meetingUrl, setMeetingUrl] = useState("");
  const [botName, setBotName] = useState(botTemplate.name);
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      await onDeploy({ meetingUrl, botName });
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      console.error("Failed to deploy:", error);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deploy Bot: {botTemplate.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="botName">Bot Name</Label>
            <p className="text-xs text-muted-foreground">
              This name will be shown in the meeting.
            </p>
            <Input
              id="botName"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              placeholder="Enter bot name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meetingUrl">Meeting URL</Label>
            <Input
              id="meetingUrl"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="Enter meeting URL"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeploying}
          >
            Cancel
          </Button>
          <Button onClick={handleDeploy} disabled={isDeploying}>
            Deploy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
