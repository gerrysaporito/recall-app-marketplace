"use client";

import { Info } from "lucide-react";
import React, { useState, type PropsWithChildren } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/components/lib/utils";

export const InfoIconTooltip: React.FC<
  {
    className?: string;
    iconSize?: number;
    tooltipContentClassName?: string;
    side?: "top" | "bottom" | "left" | "right";
    sideOffset?: number;
  } & PropsWithChildren
> = (props) => {
  const {
    children,
    className,
    iconSize = 16,
    tooltipContentClassName,
    side,
    sideOffset,
  } = props;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full cursor-pointer",
              className
            )}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            onClick={() => setIsOpen(!isOpen)}
          >
            <Info size={iconSize} className="text-blue-500" />
          </span>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={sideOffset}
          className={cn("max-w-sm", tooltipContentClassName)}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
