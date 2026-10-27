"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { refreshAndBlur } from "@/lib/utils";
import { toast } from "@/lib/use-toast";

import { cancelarAvaliacao, retificarAvaliacao } from "@/app/(app)/estudantes/avaliacao-actions";
import { STATUS_AVALIACAO_LABEL, avaliacaoEditavel } from "@/app/(app)/estudantes/avaliacao-schema";
import type { AvaliacaoIngresso } from "@/app/(app)/estudantes/queries";

import { JustificativaDialog } from "./justificativa-dialog";

export const STATUS_AVALIACAO_BADGE: Record<string, "neutral" | "info" | "success" | "warning" | "danger"> = {
  rascunho: "neutral",
  em_andamento: "info",
  concluida: "success",
  retificada: "warning",
  cancelada: "danger",
};

const dataFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

function formatData(valor: string | null) {
  return valor ? dataFormatter.format(new Date(valor)) : "—";
}

// PROVISÓRIO: validar com P.O — fluxo de retificação (versão N+1 em edição; a
// anterior só vira Retificada quando a nova é concluída) e cancelamento (só
// Rascunho/Em andamento, com justificativa). Retificar e cancelar: Pedagogo(a),
// Direção e Administrador (decidido pelo P.O).
/**
 * Topo da Avaliação de Ingresso: qual versão está aberta, de onde ela veio
 * (retificação/cancelamento, com justificativa), as outras versões e as
 * ações de Retificar/Cancelar.
 */
export function VersaoAvaliacaoCard({
  estudanteId,
  versao,
  versoes,
  podeFechar,
  onSelecionarVersao,
}: {
  estudanteId: string;
  versao: AvaliacaoIngresso;
  versoes: AvaliacaoIngresso[];
  /** Retificar/cancelar: Pedagogo(a), Direção e Administrador — ver pode_fechar_avaliacao(). */
  podeFechar: boolean;
  onSelecionarVersao: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<"retificar" | "cancelar" | null>(null);
  const router = useRouter();

  const emEdicao = versoes.find((v) => avaliacaoEditavel(v.statusAvaliacao));
  const outrasVersoes = versoes.filter((v) => v.id !== versao.id);
  const podeRetificar = podeFechar && versao.statusAvaliacao === "concluida" && !emEdicao;
  const podeCancelar = podeFechar && avaliacaoEditavel(versao.statusAvaliacao);

  function handleRetificar(justificativa: string) {
    startTransition(async () => {
      const result = await retificarAvaliacao(estudanteId, versao.id, justificativa);
      if ("error" in result) {
        toast.error("Não foi possível retificar", result.error);
        return;
      }
      setDialog(null);
      toast.success(`Versão ${versao.versao + 1} criada para retificação.`);
      refreshAndBlur(router);
    });
  }

  function handleCancelar(justificativa: string) {
    startTransition(async () => {
      const result = await cancelarAvaliacao(estudanteId, versao.id, justificativa);
      if ("error" in result) {
        toast.error("Não foi possível cancelar", result.error);
        return;
      }
      setDialog(null);
      toast.success("Avaliação cancelada.");
      refreshAndBlur(router);
    });
  }

  return (
    <Card className="gap-3 p-[24px]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-highlight text-ink">Versão {versao.versao}</h2>
          <Badge variant={STATUS_AVALIACAO_BADGE[versao.statusAvaliacao] ?? "neutral"}>
            {STATUS_AVALIACAO_LABEL[versao.statusAvaliacao] ?? versao.statusAvaliacao}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {emEdicao && emEdicao.id !== versao.id && (
            <Button type="button" variant="secondary" size="sm" onClick={() => onSelecionarVersao(emEdicao.id)}>
              Abrir versão {emEdicao.versao} (em edição)
            </Button>
          )}
          {podeCancelar && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setDialog("cancelar")}>
              Cancelar avaliação
            </Button>
          )}
          {podeRetificar && (
            <Button type="button" size="sm" onClick={() => setDialog("retificar")}>
              Retificar avaliação
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 text-[13px] text-muted">
        {versao.avaliacaoOrigemId && (
          <span>
            Versão {versao.versao} · Retificação de {formatData(versao.retificacaoSolicitadaEm)} por{" "}
            {versao.retificacaoSolicitadaPorNome ?? "—"}
          </span>
        )}
        {versao.concluidaEm && (
          <span>
            Concluída em {formatData(versao.concluidaEm)}
            {versao.concluidaPorNome ? ` por ${versao.concluidaPorNome}` : ""}
          </span>
        )}
        {versao.statusAvaliacao === "cancelada" && (
          <span>
            Cancelada em {formatData(versao.canceladaEm)} por {versao.canceladaPorNome ?? "—"}
          </span>
        )}
        {versao.statusAvaliacao === "concluida" && (
          <span>Avaliação concluída: só leitura. Correções só por &ldquo;Retificar avaliação&rdquo;.</span>
        )}
        {versao.statusAvaliacao === "retificada" && (
          <span>Versão substituída por uma retificação: só leitura.</span>
        )}
      </div>

      {versao.justificativaRetificacao && (
        <div className="rounded-sm border border-line bg-bg px-[14px] py-[10px] text-[13.5px] text-ink">
          <span className="font-semibold">Justificativa da retificação:</span> {versao.justificativaRetificacao}
        </div>
      )}
      {versao.justificativaCancelamento && (
        <div className="rounded-sm border border-line bg-bg px-[14px] py-[10px] text-[13.5px] text-ink">
          <span className="font-semibold">Justificativa do cancelamento:</span> {versao.justificativaCancelamento}
        </div>
      )}

      {outrasVersoes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <span className="text-[12.5px] text-muted">Outras versões:</span>
          {outrasVersoes.map((outra) => (
            <Button key={outra.id} type="button" variant="link" size="sm" onClick={() => onSelecionarVersao(outra.id)}>
              Ver versão {outra.versao} ({STATUS_AVALIACAO_LABEL[outra.statusAvaliacao] ?? outra.statusAvaliacao})
            </Button>
          ))}
        </div>
      )}

      <JustificativaDialog
        open={dialog === "retificar"}
        onOpenChange={(open) => setDialog(open ? "retificar" : null)}
        titulo="Retificar avaliação"
        descricao={`Será criada a versão ${versao.versao + 1}, cópia desta, para correção. A versão ${versao.versao} continua Concluída e intocada até a nova ser concluída.`}
        confirmarLabel="Criar retificação"
        pending={isPending}
        onConfirm={handleRetificar}
      />
      <JustificativaDialog
        open={dialog === "cancelar"}
        onOpenChange={(open) => setDialog(open ? "cancelar" : null)}
        titulo="Cancelar avaliação"
        descricao="Use só para avaliação criada por engano. A versão cancelada fica no histórico, só leitura."
        confirmarLabel="Cancelar avaliação"
        variant="danger"
        pending={isPending}
        onConfirm={handleCancelar}
      />
    </Card>
  );
}
