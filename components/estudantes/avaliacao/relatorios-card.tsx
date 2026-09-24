"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Eye, FileText, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { refreshAndBlur } from "@/lib/utils";

import {
  gerarPreviaRelatorioAvaliacao,
  gerarRelatorioAvaliacao,
} from "@/app/(app)/estudantes/relatorios-actions";
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
 *
 * Relatório definitivo só com a avaliação Concluída (status já salvo — o PDF
 * sempre sai dos dados salvos). Antes disso existe só a prévia, com marca
 * d'água, que não vira versão.
 */
export function RelatoriosCard({
  estudanteId,
  avaliacaoId,
  relatorios,
  avaliacaoAtualizadaEm,
  avaliacaoConcluida,
  canGerar,
}: {
  estudanteId: string;
  avaliacaoId: string;
  relatorios: RelatorioAvaliacao[];
  avaliacaoAtualizadaEm: string;
  avaliacaoConcluida: boolean;
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

  function handlePrevia(tipo: "padrao" | "completo") {
    // Abre a aba já no clique (ainda dentro do gesto do usuário) — abrir só
    // depois do await da geração faz o navegador tratar como pop-up e bloquear.
    const aba = window.open("", "_blank");
    startTransition(async () => {
      const result = await gerarPreviaRelatorioAvaliacao(estudanteId, avaliacaoId, tipo);
      if ("error" in result) {
        aba?.close();
        toast.error("Não foi possível gerar a prévia", result.error);
        return;
      }
      const bytes = Uint8Array.from(atob(result.pdfBase64), (char) => char.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      if (aba) {
        aba.location.href = url;
      } else {
        window.open(url, "_blank");
      }
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
          <div className="flex flex-wrap justify-end gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="sm" disabled={isPending}>
                  {isPending && <Loader2 size={14} strokeWidth={2} className="animate-spin" aria-hidden="true" />}
                  Visualizar prévia
                  <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => handlePrevia("padrao")}>Prévia do relatório padrão</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handlePrevia("completo")}>Prévia do relatório completo</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {avaliacaoConcluida && (
              <>
                <Button type="button" variant="secondary" size="sm" onClick={() => handleGerar("padrao")} disabled={isPending}>
                  Gerar relatório padrão
                </Button>
                <Button type="button" size="sm" onClick={() => handleGerar("completo")} disabled={isPending}>
                  Gerar relatório completo
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {canGerar && !avaliacaoConcluida && (
        <p className="text-[12.5px] text-muted">
          O relatório definitivo é liberado quando a avaliação estiver &ldquo;Concluída&rdquo; e
          salva. Até lá, use a prévia para conferir o conteúdo.
        </p>
      )}

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
