import Link from "next/link";
import { ArrowUpRight, Info } from "lucide-react";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { VinculoLocal } from "./vinculo-types";

/**
 * Turmas do professor, só para consulta — o vínculo (e os componentes
 * curriculares de cada um) é criado e editado apenas no Cadastro de Turma,
 * bloco "Professores vinculados". Cada turma leva direto pra lá.
 */
export function TurmasVinculadasCard({
  mode,
  vinculos,
}: {
  mode: "create" | "edit";
  vinculos: VinculoLocal[];
}) {
  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">2.</span> Turmas vinculadas
      </h2>

      {vinculos.length === 0 ? (
        <p className="text-sm text-muted">
          {mode === "create"
            ? "Depois de salvar o cadastro, vincule o professor às turmas no Cadastro de Turma."
            : "Nenhuma turma vinculada. O vínculo é feito no Cadastro de Turma."}
        </p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Etapa/Ciclo</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Componentes curriculares</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vinculos.map((vinculo) => (
                <TableRow key={vinculo.turmaId}>
                  <TableCell>{vinculo.etapaCicloNome}</TableCell>
                  <TableCell>{vinculo.turnoNome}</TableCell>
                  <TableCell>
                    <Link
                      href={`/turmas/${vinculo.turmaId}/editar`}
                      className="inline-flex items-center gap-[3px] font-semibold text-brand-ink hover:underline"
                    >
                      {vinculo.turmaNome || "Turma"}
                      <ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" />
                    </Link>
                    {!vinculo.turmaAtiva && <span className="ml-2 text-[12.5px] text-muted">(inativa)</span>}
                  </TableCell>
                  <TableCell>{vinculo.componentesNomes.join(", ") || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex gap-[10px] rounded-md bg-brand-tint px-[14px] py-[12px] text-brand-ink">
            <Info size={15} strokeWidth={2} className="mt-[1px] shrink-0 text-brand" aria-hidden="true" />
            <p className="text-[13px] leading-relaxed">
              Para vincular, remover ou alterar componentes curriculares, abra a turma — os vínculos
              são gerenciados no Cadastro de Turma.
            </p>
          </div>
        </>
      )}
    </Card>
  );
}
