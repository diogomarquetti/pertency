import { User as UserIcon } from "lucide-react";

import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SITUACAO_BADGE, SITUACAO_LABEL } from "@/app/(app)/estudantes/schema";

/**
 * Identificação do estudante no topo do Cadastro — acompanha as abas
 * (Tabs) logo abaixo, no mesmo card. Nome/situação são passados já
 * resolvidos pelo formulário (reativos ao que está sendo digitado, não só
 * ao valor salvo) — turma atual/matrícula não fazem parte do formulário,
 * então continuam vindo dos dados carregados do servidor.
 */
export function EstudanteHeroCard({
  mode,
  nomeCompleto,
  fotoUrl,
  situacao,
  turmaAtualLabel,
  matriculaInterna,
}: {
  mode: "create" | "edit";
  nomeCompleto: string;
  fotoUrl?: string | null;
  situacao?: string;
  turmaAtualLabel?: string | null;
  matriculaInterna?: string | null;
}) {
  const titulo = mode === "edit" ? nomeCompleto || "—" : nomeCompleto || "Novo estudante";

  return (
    <div className="flex flex-wrap items-center gap-4 p-[24px]">
      <Avatar size="lg">
        {fotoUrl && <AvatarImage src={fotoUrl} alt={titulo} />}
        <AvatarFallback>
          {nomeCompleto ? getInitials(nomeCompleto) : <UserIcon size={20} strokeWidth={2} aria-hidden="true" />}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0">
        <h1 className="truncate text-highlight text-ink">{titulo}</h1>

        {mode === "edit" && situacao && (
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
            <Badge variant={SITUACAO_BADGE[situacao]}>{SITUACAO_LABEL[situacao] ?? situacao}</Badge>
            <span>· Turma: {turmaAtualLabel || "—"}</span>
            <span>· Matrícula: {matriculaInterna || "—"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
