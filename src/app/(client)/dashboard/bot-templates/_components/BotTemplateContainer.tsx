"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BotTemplateList } from "./BotTemplateList";
import { BotTemplateCreateDialog } from "./BotTemplateCreateDialog";
import { BotTemplatesFilterType } from "@/server/services/DbService/BotTemplateDbService";

export function BotTemplateContainer({
  filters,
}: {
  filters: BotTemplatesFilterType;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="w-1/3">
          <Input
            placeholder="Search bot templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Bot Tmeplate
        </Button>
      </div>

      <BotTemplateList searchTerm={searchTerm} filters={filters} />
      <BotTemplateCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}
