"use client";

import { Info, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { VinculoLocal } from "./vinculo-types";

type TurmaVinculosTableProps = {
  vinculos: VinculoLocal[];
  onEdit: (index: number) => void;
  onRemove: (turmaId: string) => void;
};

export function TurmaVinculosTable({ vinculos, onEdit, onRemove }: TurmaVinculosTableProps) {
  if (vinculos.length === 0) {
    return (
      <p className="text-sm text-muted">
        Nenhuma turma vinculada ainda. Clique em &ldquo;Adicionar turma&rdquo; para
        incluir o primeiro vínculo.
      </p>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Etapa/Ciclo</TableHead>
            <TableHead>Turno</TableHead>
            <TableHead>Turma</TableHead>
            <TableHead>Componentes curriculares</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vinculos.map((vinculo, index) => (
            <TableRow key={vinculo.turmaId}>
              <TableCell>{vinculo.etapaCicloNome}</TableCell>
              <TableCell>{vinculo.turnoNome}</TableCell>
              <TableCell>{vinculo.turmaNome}</TableCell>
              <TableCell>{vinculo.componentesNomes.join(", ")}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon
                    aria-label="Editar vínculo"
                    onClick={() => onEdit(index)}
                  >
                    <Pencil size={14} strokeWidth={2} aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon
                    aria-label="Remover vínculo"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Remover o vínculo com a turma "${vinculo.turmaNome}"?`,
                        )
                      ) {
                        onRemove(vinculo.turmaId);
                      }
                    }}
                  >
                    <Trash2 size={14} strokeWidth={2} className="text-danger" aria-hidden="true" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-3 flex gap-[10px] rounded-md bg-brand-tint px-[14px] py-[12px] text-brand-ink">
        <Info size={15} strokeWidth={2} className="mt-[1px] shrink-0 text-brand" aria-hidden="true" />
        <p className="text-[13px] leading-relaxed">
          Este usuário está vinculado à(s) turma(s) acima e poderá registrar atividades,
          frequências e acessar informações dos componentes curriculares selecionados.
        </p>
      </div>
    </div>
  );
}
