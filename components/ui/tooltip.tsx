"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider delayDuration={300}>
      <TooltipPrimitive.Root {...props} />
    </TooltipProvider>
  );
}

const TooltipTrigger = TooltipPrimitive.Trigger;

function TooltipContent({
  className,
  side = "bottom",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        side={side}
        sideOffset={sideOffset}
        className={cn(
          "z-50 rounded-sm bg-ink px-[10px] py-[5px] text-[12.5px] font-medium text-bg shadow-md",
          "duration-base ease-standard data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
