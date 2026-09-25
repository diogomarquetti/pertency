"use client";

import type { ReactNode } from "react";
import { Mail } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  AvatarFotoEditavel,
  RemoverFotoButton,
  useFotoEditavel,
} from "@/components/avatar-foto-editavel";
import { funcaoExibicao } from "@/app/(app)/usuarios/schema";

type FotoEdicao = {
  usuarioId: string;
  escolaId: string;
  fotoUrlInicial: string | null;
  canEdit: boolean;
};

/**
 * Identificação do usuário no topo do cadastro — mesmo padrão do Cadastro de
 * Estudante (sem abas). Nome, função e status acompanham o que está sendo
 * digitado no formulário. A função mostra a área de atuação quando houver
 * (mesma regra dos relatórios, ver funcaoExibicao). Foto é enviada/removida
 * no próprio avatar, só em modo edição.
 */
export function UsuarioHeroCard({
  mode,
  nomeCompleto,
  email,
  funcao,
  areaAtuacao,
  areaAtuacaoOutro,
  status,
  foto,
  acoes,
}: {
  mode: "create" | "edit";
  nomeCompleto: string;
  email: string;
  funcao: string;
  areaAtuacao?: string;
  areaAtuacaoOutro?: string;
  status: "ativo" | "inativo";
  foto?: FotoEdicao;
  acoes?: ReactNode;
}) {
  const titulo = nomeCompleto || (mode === "edit" ? "—" : "Novo usuário");
  const { fotoUrl, isPending, enviar, remover } = useFotoEditavel(
    foto && {
      bucket: "usuarios-fotos",
      tabela: "usuarios",
      registroId: foto.usuarioId,
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

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
          <Badge variant={status === "ativo" ? "success" : "neutral"}>
            {status === "ativo" ? "Ativo" : "Inativo"}
          </Badge>
          {funcao && (
            <span>
              · {funcaoExibicao({ funcao, area_atuacao: areaAtuacao, area_atuacao_outro: areaAtuacaoOutro })}
            </span>
          )}
          {email && (
            <span className="flex min-w-0 items-center gap-[5px]">
              · <Mail size={13} strokeWidth={2} className="shrink-0" aria-hidden="true" />
              <span className="truncate">{email}</span>
            </span>
          )}
          {podeEditarFoto && fotoUrl && <RemoverFotoButton onClick={remover} disabled={isPending} />}
        </div>
      </div>

      {acoes && <div className="shrink-0">{acoes}</div>}
    </div>
  );
}
