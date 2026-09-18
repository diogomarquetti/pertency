"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, FileText, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { refreshAndBlur } from "@/lib/utils";

import { gerarRelatorioAvaliacao } from "@/app/(app)/estudantes/relatorios-actions";
import type { RelatorioAvaliacao } from "@/app/(app)/estudantes/queries";

const TIPO_LABEL: Record<string, string> = { padrao: "Padrão", completo: "Completo" };

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * "Desatualizado" (CA16) é calculado aqui, comparando o `updated_at` que a
 * avaliação tinha no momento da geração com o `updated_at` atual — sem
 * trigger nem flag mantida à mão.
 */
export function RelatoriosCard({
  estudanteId,
  avaliacaoId,
  relatorios,
  avaliacaoAtualizadaEm,
  canGerar,
}: {
  estudanteId: string;
  avaliacaoId: string;
  relatorios: RelatorioAvaliacao[];
  avaliacaoAtualizadaEm: string;
  canGerar: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleGerar(tipo: "padrao" | "completo") {
    startTransition(async () => {
      const result = await gerarRelatorioAvaliacao(estudanteId, avaliacaoId, tipo);
      if (result && "error" in result) {
        toast.error("Não foi possível gerar o relatório", result.error);
        return;
      }
      toast.success(`Relatório ${TIPO_LABEL[tipo].toLowerCase()} gerado com sucesso.`);
      refreshAndBlur(router);
    });
  }

  function handleVisualizar(arquivoPath: string) {
    startTransition(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("estudantes-documentos")
        .createSignedUrl(arquivoPath, 60);

      if (error || !data) {
        toast.error("Não foi possível abrir o arquivo", "Tente novamente.");
        return;
      }

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <Card className="gap-3 p-[24px]">
      <div className="flex items-center justify-between">
        <h2 className="text-highlight text-ink">Relatórios (PDF)</h2>
        {canGerar && (
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => handleGerar("padrao")} disabled={isPending}>
              {isPending && <Loader2 size={14} strokeWidth={2} className="animate-spin" aria-hidden="true" />}
              Gerar relatório padrão
            </Button>
            <Button type="button" size="sm" onClick={() => handleGerar("completo")} disabled={isPending}>
              {isPending && <Loader2 size={14} strokeWidth={2} className="animate-spin" aria-hidden="true" />}
              Gerar relatório completo
            </Button>
          </div>
        )}
      </div>

      {relatorios.length === 0 ? (
        <p className="text-[13px] text-muted">Nenhum relatório gerado ainda.</p>
      ) : (
        <div className="flex flex-col">
          {relatorios.map((relatorio) => {
            const desatualizado = relatorio.avaliacaoAtualizadaEm < avaliacaoAtualizadaEm;
            return (
              <div
                key={relatorio.id}
                className="flex items-center justify-between gap-3 border-b border-line py-[12px] last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileText size={18} strokeWidth={2} className="shrink-0 text-muted" aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-semibold text-ink">
                      {TIPO_LABEL[relatorio.tipo]} · v{relatorio.versao}
                      {desatualizado && <Badge variant="warning">Desatualizado</Badge>}
                    </div>
                    <div className="mt-[2px] text-[12.5px] text-muted">
                      Gerado por {relatorio.geradoPorNome ?? "—"} em{" "}
                      {dateFormatter.format(new Date(relatorio.geradoEm))}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon
                  aria-label="Visualizar relatório"
                  onClick={() => handleVisualizar(relatorio.arquivoPath)}
                  disabled={isPending}
                >
                  <Eye size={14} strokeWidth={2} aria-hidden="true" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
