"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("flex items-center gap-[28px] border-b border-line", className)}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative py-[12px] text-control font-semibold text-muted outline-none",
        "transition-colors duration-fast ease-standard",
        "hover:text-ink",
        "after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:rounded-full after:bg-transparent after:transition-colors after:duration-fast after:ease-standard",
        "data-[state=active]:text-ink data-[state=active]:after:bg-brand",
        "focus-visible:text-ink",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
