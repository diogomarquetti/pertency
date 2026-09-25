"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      // Quando as abas não cabem na largura (ex: mobile), a lista rola na
      // horizontal em vez de quebrar linha — a aba cortada na borda já
      // sinaliza que há mais conteúdo, então a barra de rolagem fica oculta.
      // A linha de base é um box-shadow inset em vez de `border-b`: com
      // `overflow-x-auto` o indicador da aba ativa (`-bottom-px`, por cima da
      // borda) seria cortado; o shadow é pintado dentro da caixa, então o
      // indicador em `bottom-0` o cobre como antes.
      className={cn(
        "flex items-center gap-[28px] overflow-x-auto shadow-[inset_0_-1px_0_var(--line)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
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
        "relative shrink-0 py-[12px] text-control whitespace-nowrap font-semibold text-muted outline-none",
        "transition-colors duration-fast ease-standard",
        "hover:text-ink",
        "after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-full after:bg-transparent after:transition-colors after:duration-fast after:ease-standard",
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
