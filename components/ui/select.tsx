"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        // altura 42px e padding 14px/38px são exceções intencionais fora da
        // grade de espaçamento — ver pertency-componentes-v1.html § Select
        "relative flex h-[42px] w-full min-w-0 items-center justify-between rounded-sm border-[1.5px] border-line bg-surface py-0 pr-[38px] pl-[14px] text-control text-ink outline-none",
        "transition-colors duration-base ease-standard",
        "data-[placeholder]:text-[#94A3B8]",
        "hover:border-[#C7D0DB]",
        "focus:border-brand focus:shadow-[0_0_0_var(--focus-ring-inner)_var(--brand-tint)]",
        "disabled:cursor-not-allowed disabled:border-line disabled:bg-bg disabled:text-muted",
        "aria-invalid:border-danger aria-invalid:focus:shadow-[0_0_0_var(--focus-ring-inner)_var(--danger-tint)]",
        "[&>span]:line-clamp-1",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className="pointer-events-none absolute right-[13px] shrink-0 text-muted"
          aria-hidden="true"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        className={cn(
          "relative z-50 max-h-(--radix-select-content-available-height) min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-line bg-surface p-1 text-ink shadow-md outline-none",
          "duration-base ease-standard data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={cn(
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-1 pr-[12px] pl-[28px] text-[13.5px] font-medium outline-none select-none",
        "transition-colors duration-fast ease-standard",
        "focus:bg-brand-tint data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute left-[8px] flex size-[16px] items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check size={14} strokeWidth={2} className="text-brand" aria-hidden="true" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem };
