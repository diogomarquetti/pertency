import Link from "next/link";
import { ExternalLink, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { SITUACAO_OPTIONS } from "@/app/(app)/estudantes/schema";
import type { EstudanteVinculado } from "@/app/(app)/turmas/queries";

const SITUACAO_LABEL: Record<string, string> = Object.fromEntries(
  SITUACAO_OPTIONS.map((option) => [option.value, option.label]),
);
const SITUACAO_BADGE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  em_analise_de_ingresso: "warning",
  ativo: "success",
  nao_elegivel: "danger",
  transferido: "neutral",
  desligado: "neutral",
  inativo: "neutral",
};

/**
 * Só leitura — o vínculo em si é feito do lado do Cadastro de Estudante
 * (Aba 4, Dados escolares), reaproveitando o mesmo catálogo de turmas.
 * Fecha a ponta deixada em aberto desde a Fase 1 de Turmas.
 */
export function EstudantesVinculadosCard({ estudantes }: { estudantes: EstudanteVinculado[] }) {
  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">5.</span> Estudantes vinculados
      </h2>

      {estudantes.length === 0 ? (
        <p className="text-sm text-muted">Nenhum estudante vinculado a esta turma ainda.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estudante</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Matrícula interna</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {estudantes.map((estudante) => (
              <TableRow key={estudante.estudanteId}>
                <TableCell className="font-semibold text-ink">{estudante.nome}</TableCell>
                <TableCell>
                  <Badge variant={SITUACAO_BADGE[estudante.situacao]}>
                    {SITUACAO_LABEL[estudante.situacao] ?? estudante.situacao}
                  </Badge>
                </TableCell>
                <TableCell>{estudante.matriculaInterna || "—"}</TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Button variant="secondary" size="sm" icon asChild>
                      <Link
                        href={`/estudantes/${estudante.estudanteId}/editar`}
                        aria-label={`Ver cadastro de ${estudante.nome}`}
                      >
                        <ExternalLink size={14} strokeWidth={2} aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex gap-[10px] rounded-md bg-brand-tint px-[14px] py-[12px] text-brand-ink">
        <Info size={15} strokeWidth={2} className="mt-[1px] shrink-0 text-brand" aria-hidden="true" />
        <p className="text-[13px] leading-relaxed">
          Vínculos são criados pela Secretaria/Coordenação na Aba 4 (Dados escolares) do
          cadastro do estudante — não é possível adicionar ou remover um estudante por aqui.
        </p>
      </div>
    </Card>
  );
}
