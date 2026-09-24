"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { refreshAndBlur } from "@/lib/utils";
import { toast } from "@/lib/use-toast";

import { removerCondicao } from "@/app/(app)/estudantes/condicoes-actions";
import { TIPO_CONDICAO_OPTIONS } from "@/app/(app)/estudantes/condicoes-schema";
import type { CondicaoEstudante, DocumentoEstudante } from "@/app/(app)/estudantes/queries";

import { CondicaoDrawer } from "./condicao-drawer";

const TIPO_LABEL: Record<string, string> = Object.fromEntries(
  TIPO_CONDICAO_OPTIONS.map((opcao) => [opcao.value, opcao.label]),
);

/** O sistema permite mais de uma condição por estudante (HU-EST-001 v2.0, seção 14.2). */
export function CondicoesCard({
  estudanteId,
  condicoes,
  documentosDisponiveis,
  canEdit,
}: {
  estudanteId: string;
  condicoes: CondicaoEstudante[];
  documentosDisponiveis: DocumentoEstudante[];
  canEdit: boolean;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<CondicaoEstudante | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleAdicionar() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function handleEditar(condicao: CondicaoEstudante) {
    setEditing(condicao);
    setDrawerOpen(true);
  }

  function handleRemover(condicaoId: string) {
    if (!window.confirm("Remover esta condição?")) return;
    startTransition(async () => {
      const result = await removerCondicao(estudanteId, condicaoId);
      if (result && "error" in result) {
        toast.error("Não foi possível remover", result.error);
        return;
      }
      refreshAndBlur(router);
    });
  }

  return (
    <Card className="gap-3 p-[24px]">
      <div className="flex items-center justify-between">
        <h2 className="flex items-baseline gap-2 text-highlight text-ink">
          <span className="text-brand">1.</span> Condições e documentos relacionados
        </h2>
        {canEdit && (
          <Button type="button" variant="secondary" size="sm" onClick={handleAdicionar}>
            <Plus size={14} strokeWidth={2} aria-hidden="true" />
            Adicionar condição
          </Button>
        )}
      </div>

      {condicoes.length === 0 ? (
        <p className="text-[13px] text-muted">Nenhuma condição registrada ainda.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Condição</TableHead>
              <TableHead>Documento vinculado</TableHead>
              <TableHead>Observações</TableHead>
              {canEdit && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {condicoes.map((condicao) => (
              <TableRow key={condicao.id}>
                <TableCell className="font-semibold">
                  {TIPO_LABEL[condicao.tipoCondicao] ?? condicao.tipoCondicao}
                </TableCell>
                <TableCell>{condicao.documentoLabel || "—"}</TableCell>
                {/* Texto completo (e CID, quando houver) fica no drawer de edição. */}
                <TableCell className="max-w-[360px]">
                  <span className="line-clamp-2" title={condicao.observacoes || undefined}>
                    {condicao.observacoes || "—"}
                  </span>
                </TableCell>
                {canEdit && (
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        icon
                        aria-label="Editar condição"
                        onClick={() => handleEditar(condicao)}
                        disabled={isPending}
                      >
                        <Pencil size={14} strokeWidth={2} aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        icon
                        aria-label="Remover condição"
                        onClick={() => handleRemover(condicao.id)}
                        disabled={isPending}
                      >
                        <Trash2 size={14} strokeWidth={2} className="text-danger" aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CondicaoDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        estudanteId={estudanteId}
        editing={editing}
        documentosDisponiveis={documentosDisponiveis}
      />
    </Card>
  );
}
