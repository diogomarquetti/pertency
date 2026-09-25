"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { refreshAndBlur } from "@/lib/utils";
import { toast } from "@/lib/use-toast";

import { removerContribuicao } from "@/app/(app)/estudantes/contribuicoes-actions";
import { AREA_CONTRIBUICAO_OPTIONS } from "@/app/(app)/estudantes/contribuicoes-schema";
import type { ContribuicaoAvaliacao, UsuarioElegivel } from "@/app/(app)/estudantes/queries";

import { ContribuicaoDrawer } from "./contribuicao-drawer";

const AREA_LABEL: Record<string, string> = Object.fromEntries(
  AREA_CONTRIBUICAO_OPTIONS.map((opcao) => [opcao.value, opcao.label]),
);

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

/**
 * "Só o autor edita a própria contribuição" (HU-EST-001 v2.0, seção 11.3,
 * CA09) — agora backed por RLS de verdade (Onda 4, fatia 2: perfil
 * "Profissional complementar"). `canEdit` é a permissão geral da aba
 * (administrador/secretaria/coordenação) e fica false pro profissional
 * complementar, que só pode mexer na própria contribuição — por isso as
 * três permissões abaixo são calculadas separadamente em vez de reusar
 * `canEdit` puro: adicionar/editar aceitam também
 * `viewerCanEditContribuicaoPropria`, excluir continua exclusivo de quem
 * tem `canEdit` (CA09 só fala em editar, não em remover).
 */
export function ContribuicoesCard({
  estudanteId,
  avaliacaoId,
  contribuicoes,
  equipeElegivel,
  viewerId,
  viewerCanEditQualquer,
  viewerCanEditContribuicaoPropria,
  canEdit,
}: {
  estudanteId: string;
  avaliacaoId: string;
  contribuicoes: ContribuicaoAvaliacao[];
  equipeElegivel: UsuarioElegivel[];
  viewerId: string | null;
  viewerCanEditQualquer: boolean;
  viewerCanEditContribuicaoPropria: boolean;
  canEdit: boolean;
}) {
  const podeAdicionar = canEdit || viewerCanEditContribuicaoPropria;
  // Quem só tem viewerCanEditContribuicaoPropria (não canEdit) é o
  // profissional complementar mexendo na própria — trava o campo
  // "Profissional" no drawer pra evitar tentar (e ser barrado por engano)
  // escolher outra pessoa.
  const travarProfissional = !canEdit && viewerCanEditContribuicaoPropria;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ContribuicaoAvaliacao | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleAdicionar() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function handleEditar(contribuicao: ContribuicaoAvaliacao) {
    setEditing(contribuicao);
    setDrawerOpen(true);
  }

  function handleRemover(contribuicaoId: string) {
    if (!window.confirm("Remover esta contribuição?")) return;
    startTransition(async () => {
      const result = await removerContribuicao(estudanteId, contribuicaoId);
      if (result && "error" in result) {
        toast.error("Não foi possível remover", result.error);
        return;
      }
      refreshAndBlur(router);
    });
  }

  return (
    <Card className="gap-3 p-[24px]">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <h2 className="text-highlight text-ink">Contribuições complementares</h2>
        {podeAdicionar && (
          <Button type="button" variant="secondary" size="sm" onClick={handleAdicionar}>
            <Plus size={14} strokeWidth={2} aria-hidden="true" />
            Adicionar contribuição
          </Button>
        )}
      </div>

      {contribuicoes.length === 0 ? (
        <p className="text-[13px] text-muted">Nenhuma contribuição registrada ainda.</p>
      ) : (
        <div className="flex flex-col">
          {contribuicoes.map((contribuicao) => {
            const autorOuQualquer =
              viewerCanEditQualquer || contribuicao.profissionalId === viewerId;
            const podeEditar = podeAdicionar && autorOuQualquer;
            const podeExcluir = canEdit && autorOuQualquer;

            return (
              <div
                key={contribuicao.id}
                className="flex flex-col gap-2 border-b border-line py-[14px] last:border-b-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-ink">{contribuicao.profissionalNome}</div>
                    <div className="mt-[2px] text-[12.5px] text-muted">
                      {AREA_LABEL[contribuicao.areaContribuicao] ?? contribuicao.areaContribuicao} ·{" "}
                      {dateFormatter.format(new Date(contribuicao.criadoEm))}
                    </div>
                  </div>
                  {(podeEditar || podeExcluir) && (
                    <div className="flex shrink-0 items-center gap-1">
                      {podeEditar && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          icon
                          aria-label="Editar contribuição"
                          onClick={() => handleEditar(contribuicao)}
                          disabled={isPending}
                        >
                          <Pencil size={14} strokeWidth={2} aria-hidden="true" />
                        </Button>
                      )}
                      {podeExcluir && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          icon
                          aria-label="Remover contribuição"
                          onClick={() => handleRemover(contribuicao.id)}
                          disabled={isPending}
                        >
                          <Trash2 size={14} strokeWidth={2} className="text-danger" aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-[13.5px] text-ink">{contribuicao.observacoes}</p>
              </div>
            );
          })}
        </div>
      )}

      <ContribuicaoDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        estudanteId={estudanteId}
        avaliacaoId={avaliacaoId}
        editing={editing}
        equipeElegivel={equipeElegivel}
        viewerId={viewerId}
        travarProfissional={travarProfissional}
      />
    </Card>
  );
}
