import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm transition-colors duration-fast ease-standard outline-none",
        "placeholder:text-muted",
        "focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-red-500 aria-invalid:ring-red-500/30",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
