"use client";

import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  AvatarFotoEditavel,
  RemoverFotoButton,
  useFotoEditavel,
} from "@/components/avatar-foto-editavel";
import { SITUACAO_BADGE, SITUACAO_LABEL } from "@/app/(app)/estudantes/schema";

type FotoEdicao = {
  estudanteId: string;
  escolaId: string;
  fotoUrlInicial: string | null;
  canEdit: boolean;
};

/**
 * Identificação do estudante no topo do Cadastro — acompanha as abas
 * (Tabs) logo abaixo, no mesmo card. Nome/situação são passados já
 * resolvidos pelo formulário (reativos ao que está sendo digitado, não só
 * ao valor salvo) — turma atual/matrícula não fazem parte do formulário,
 * então continuam vindo dos dados carregados do servidor.
 *
 * Upload/remoção de foto fica no próprio avatar (ver avatar-foto-editavel.tsx).
 * Só em modo edição, porque precisa do estudanteId.
 *
 * `acoes` fica na extremidade direita (ex.: botão do Histórico de alterações).
 */
export function EstudanteHeroCard({
  mode,
  nomeCompleto,
  foto,
  situacao,
  turmaAtualLabel,
  matriculaInterna,
  acoes,
}: {
  mode: "create" | "edit";
  nomeCompleto: string;
  foto?: FotoEdicao;
  situacao?: string;
  turmaAtualLabel?: string | null;
  matriculaInterna?: string | null;
  acoes?: ReactNode;
}) {
  const titulo = mode === "edit" ? nomeCompleto || "—" : nomeCompleto || "Novo estudante";
  const { fotoUrl, isPending, enviar, remover } = useFotoEditavel(
    foto && {
      bucket: "estudantes-fotos",
      tabela: "estudantes",
      registroId: foto.estudanteId,
      escolaId: foto.escolaId,
      fotoUrlInicial: foto.fotoUrlInicial,
    },
  );
  const podeEditarFoto = mode === "edit" && !!foto?.canEdit;

  return (
    <div className="flex flex-wrap items-center gap-4 p-[24px]">
      <AvatarFotoEditavel
        nome={nomeCompleto}
        fotoUrl={fotoUrl}
        editavel={podeEditarFoto}
        isPending={isPending}
        onFile={enviar}
      />

      <div className="min-w-0 flex-1 basis-[160px]">
        <h1 className="truncate text-highlight text-ink">{titulo}</h1>

        {mode === "edit" && situacao && (
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
            <Badge variant={SITUACAO_BADGE[situacao]}>{SITUACAO_LABEL[situacao] ?? situacao}</Badge>
            <span>· Turma: {turmaAtualLabel || "—"}</span>
            <span>· Nº de matrícula: {matriculaInterna || "—"}</span>
            {podeEditarFoto && fotoUrl && <RemoverFotoButton onClick={remover} disabled={isPending} />}
          </div>
        )}
      </div>

      {acoes && <div className="shrink-0">{acoes}</div>}
    </div>
  );
}
