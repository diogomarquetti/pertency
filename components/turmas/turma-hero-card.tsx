import type { ReactNode } from "react";
import { Presentation } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { STATUS_OPTIONS } from "@/app/(app)/turmas/schema";

const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map((option) => [option.value, option.label]),
);

const STATUS_BADGE: Record<string, "success" | "neutral"> = {
  ativa: "success",
  inativa: "neutral",
  encerrada: "neutral",
};

/**
 * Identificação da turma no topo do cadastro — mesmo padrão dos cadastros
 * de Estudante e Usuário. Turma não tem foto: o avatar é o mesmo ícone do item Turmas do menu.
 * Nome, status e dados de oferta/ano/turno acompanham o que está sendo
 * digitado; contagens de professores/estudantes vêm do servidor.
 */
export function TurmaHeroCard({
  mode,
  nome,
  status,
  detalhes,
  acoes,
}: {
  mode: "create" | "edit";
  nome: string;
  status: string;
  /** Oferta — organização, ano letivo, turno, contagens… (já resolvidos, vazios são omitidos). */
  detalhes: (string | null | undefined)[];
  acoes?: ReactNode;
}) {
  const titulo = nome || (mode === "edit" ? "—" : "Nova turma");
  const itens = detalhes.filter(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-4 p-[24px]">
      <Avatar size="lg">
        <AvatarFallback>
          <Presentation size={20} strokeWidth={2} aria-hidden="true" />
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-highlight text-ink">{titulo}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
          <Badge variant={STATUS_BADGE[status] ?? "neutral"}>{STATUS_LABEL[status] ?? status}</Badge>
          {itens.map((item) => (
            <span key={item}>· {item}</span>
          ))}
        </div>
      </div>

      {acoes && <div className="shrink-0">{acoes}</div>}
    </div>
  );
}
