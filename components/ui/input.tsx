import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm transition-colors duration-fast ease-standard outline-none",
        "placeholder:text-muted",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink",
        "focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-red-500 aria-invalid:ring-red-500/30",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
