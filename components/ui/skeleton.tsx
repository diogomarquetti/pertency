import * as React from "react";

import { cn } from "@/lib/utils";

/** Bloco de espera no formato do conteúdo que ainda vai chegar. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("rounded-sm bg-line motion-safe:animate-pulse", className)}
      {...props}
    />
  );
}

export { Skeleton };
