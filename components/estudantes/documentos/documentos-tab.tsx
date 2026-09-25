"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Eye, Loader2, Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { refreshAndBlur } from "@/lib/utils";
import { toast } from "@/lib/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { adicionarDocumentoExtra, removerDocumentoExtra } from "@/app/(app)/estudantes/documentos-actions";
import { DOCUMENTO_TIPOS_FIXOS, naoSeAplicaAutomatico } from "@/app/(app)/estudantes/documentos-schema";
import type { DocumentoEstudante } from "@/app/(app)/estudantes/queries";

import { DocumentoLinha } from "./documento-linha";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export function DocumentosTab({
  estudanteId,
  escolaId,
  documentos,
  formaOrigem,
  canEdit,
}: {
  estudanteId: string;
  escolaId: string;
  documentos: DocumentoEstudante[];
  /** Forma de origem dos Dados escolares — alimenta o "não se aplica" automático. */
  formaOrigem: string | null;
  canEdit: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [novoNome, setNovoNome] = useState("");
  const [mostrarNovo, setMostrarNovo] = useState(false);
  const router = useRouter();

  const porTipo = new Map(documentos.filter((doc) => doc.tipo !== "outro").map((doc) => [doc.tipo, doc]));
  const extras = documentos.filter((doc) => doc.tipo === "outro");
  const avaliacaoDoc = porTipo.get("avaliacao_ingresso");

  const pendentes = DOCUMENTO_TIPOS_FIXOS.filter((item) => {
    const doc = porTipo.get(item.tipo);
    const pendente = !doc || doc.status === "pendente";
    return pendente && !naoSeAplicaAutomatico(item.tipo, formaOrigem);
  }).length;

  function handleVisualizarAvaliacao() {
    if (!avaliacaoDoc?.arquivoPath) return;
    startTransition(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("estudantes-documentos")
        .createSignedUrl(avaliacaoDoc.arquivoPath!, 60);

      if (error || !data) {
        toast.error("Não foi possível abrir o arquivo", "Tente novamente.");
        return;
      }

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    });
  }

  function handleAdicionar() {
    if (!novoNome.trim()) {
      toast.error("Informe um nome para o documento.");
      return;
    }
    startTransition(async () => {
      const result = await adicionarDocumentoExtra(estudanteId, novoNome);
      if (result && "error" in result) {
        toast.error("Não foi possível adicionar", result.error);
        return;
      }
      setNovoNome("");
      setMostrarNovo(false);
      refreshAndBlur(router);
    });
  }

  function handleRemover(docId: string) {
    if (!window.confirm("Remover este documento?")) return;
    startTransition(async () => {
      const result = await removerDocumentoExtra(estudanteId, docId);
      if (result && "error" in result) {
        toast.error("Não foi possível remover", result.error);
        return;
      }
      refreshAndBlur(router);
    });
  }

  return (
    <div className="flex flex-col gap-[24px]">
      {pendentes > 0 && (
        <div className="flex items-center gap-[10px] rounded-md bg-warning-tint px-[16px] py-[12px] text-warning-ink">
          <AlertTriangle size={16} strokeWidth={2} className="shrink-0" aria-hidden="true" />
          <p className="text-[13.5px]">
            {pendentes} documento{pendentes === 1 ? "" : "s"} pendente{pendentes === 1 ? "" : "s"} neste cadastro.
          </p>
        </div>
      )}

      <Card className="gap-2 p-[24px]">
        <h2 className="text-highlight text-ink">Checklist documental</h2>
        <div className="flex flex-col">
          {DOCUMENTO_TIPOS_FIXOS.map((item) => {
            const doc = porTipo.get(item.tipo);
            return (
              <DocumentoLinha
                key={item.tipo}
                kind="fixo"
                tipo={item.tipo}
                estudanteId={estudanteId}
                escolaId={escolaId}
                label={item.label}
                status={doc?.status ?? "pendente"}
                formaEntrega={doc?.formaEntrega ?? null}
                motivoNaoSeAplica={doc?.motivoNaoSeAplica ?? null}
                naoSeAplicaAutomatico={
                  naoSeAplicaAutomatico(item.tipo, formaOrigem)
                    ? "Primeira matrícula escolar (Forma de origem em Dados escolares)"
                    : null
                }
                dataEnvio={doc?.dataEnvio ?? null}
                conferidoPorNome={doc?.conferidoPorNome ?? null}
                arquivoPath={doc?.arquivoPath ?? null}
                arquivoNome={doc?.arquivoNome ?? null}
                versoesAnteriores={doc?.versoesAnteriores ?? []}
                canEdit={canEdit}
              />
            );
          })}

          <div className="flex items-center justify-between gap-3 border-b border-line py-[14px] last:border-b-0">
            <div className="min-w-0">
              <div className="font-semibold text-ink">Avaliação de Ingresso</div>
              <div className="mt-[2px] text-[12.5px] text-muted">
                {avaliacaoDoc
                  ? `${avaliacaoDoc.arquivoNome ?? "PDF gerado"}${
                      avaliacaoDoc.dataEnvio
                        ? ` · gerado em ${dateFormatter.format(new Date(avaliacaoDoc.dataEnvio))}`
                        : ""
                    }`
                  : "Gerada pelo sistema — ainda não gerada. Use \"Relatórios (PDF)\" na Aba 2."}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {avaliacaoDoc && <Badge variant="info">Gerado pelo sistema</Badge>}
              {avaliacaoDoc?.arquivoPath && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon
                  aria-label="Visualizar arquivo"
                  onClick={handleVisualizarAvaliacao}
                  disabled={isPending}
                >
                  <Eye size={14} strokeWidth={2} aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="gap-3 p-[24px]">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <h2 className="text-highlight text-ink">Outros documentos</h2>
          {canEdit && !mostrarNovo && (
            <Button type="button" variant="secondary" size="sm" onClick={() => setMostrarNovo(true)}>
              <Plus size={14} strokeWidth={2} aria-hidden="true" />
              Adicionar documento
            </Button>
          )}
        </div>

        {mostrarNovo && (
          <div className="flex items-center gap-2">
            <Input
              value={novoNome}
              onChange={(event) => setNovoNome(event.target.value)}
              placeholder="Nome do documento"
              className="max-w-[320px]"
            />
            <Button type="button" size="sm" onClick={handleAdicionar} disabled={isPending}>
              {isPending && <Loader2 size={14} strokeWidth={2} className="animate-spin" aria-hidden="true" />}
              Adicionar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setMostrarNovo(false);
                setNovoNome("");
              }}
            >
              Cancelar
            </Button>
          </div>
        )}

        {extras.length === 0 ? (
          <p className="text-[13px] text-muted">Nenhum documento extra adicionado.</p>
        ) : (
          <div className="flex flex-col">
            {extras.map((doc) => (
              <DocumentoLinha
                key={doc.id}
                kind="extra"
                docId={doc.id}
                estudanteId={estudanteId}
                escolaId={escolaId}
                label={doc.nomeDocumento ?? "Documento"}
                status={doc.status}
                formaEntrega={doc.formaEntrega}
                motivoNaoSeAplica={doc.motivoNaoSeAplica}
                dataEnvio={doc.dataEnvio}
                conferidoPorNome={doc.conferidoPorNome}
                arquivoPath={doc.arquivoPath}
                arquivoNome={doc.arquivoNome}
                versoesAnteriores={doc.versoesAnteriores}
                canEdit={canEdit}
                onRemove={() => handleRemover(doc.id)}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
