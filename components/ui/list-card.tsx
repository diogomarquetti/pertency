import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

// Versão em card das listagens (estudantes, turmas, usuários) para telas
// estreitas — a tabela continua sendo usada a partir de `md`. O card inteiro
// é clicável via "stretched link": o `::after` do ListCardLink cobre o card,
// e ListCardAction fica acima dele (z-10) para ações secundárias continuarem
// clicáveis sem aninhar um link dentro de outro.

function ListCardList({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul data-slot="list-card-list" className={cn("flex flex-col gap-1", className)} {...props} />
  );
}

function ListCard({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="list-card"
      className={cn(
        "relative flex items-center gap-2 rounded-md border border-line bg-surface px-2 py-[14px] transition-colors duration-fast ease-standard hover:bg-bg",
        className,
      )}
      {...props}
    />
  );
}

function ListCardLink({ className, ...props }: React.ComponentProps<typeof Link>) {
  return (
    <Link
      data-slot="list-card-link"
      className={cn(
        "block truncate font-semibold text-ink outline-none after:absolute after:inset-0 after:rounded-md focus-visible:after:shadow-[0_0_0_var(--focus-ring-inner)_var(--brand-tint),0_0_0_var(--focus-ring-outer)_var(--brand)]",
        className,
      )}
      {...props}
    />
  );
}

function ListCardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="list-card-action"
      className={cn("relative z-10 flex shrink-0 items-center gap-1", className)}
      {...props}
    />
  );
}

export { ListCardList, ListCard, ListCardLink, ListCardAction };
