"use client";

import { Info, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { ProfessorVinculado } from "@/app/(app)/turmas/queries";
import type { OfertaSlug } from "@/app/(app)/turmas/schema";

function escopoLabel(professor: ProfessorVinculado, ofertaSlug: OfertaSlug) {
  if (ofertaSlug === "ei") return "Turma inteira";
  if (ofertaSlug === "ef") return professor.componentesNomes.join(", ") || "—";
  return professor.escopoEja.join(", ") || "—";
}

export function ProfessorVinculosTable({
  professores,
  ofertaSlug,
  onEdit,
  onRemove,
}: {
  professores: ProfessorVinculado[];
  ofertaSlug: OfertaSlug;
  onEdit: (professor: ProfessorVinculado) => void;
  onRemove: (professor: ProfessorVinculado) => void;
}) {
  if (professores.length === 0) {
    return (
      <p className="text-sm text-muted">
        Nenhum professor vinculado ainda. Clique em &ldquo;Vincular professor&rdquo; para incluir
        o primeiro.
      </p>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Professor</TableHead>
            <TableHead>Função / escopo</TableHead>
            <TableHead>Status do vínculo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {professores.map((professor) => (
            <TableRow key={professor.id}>
              <TableCell className="font-semibold text-ink">{professor.nome}</TableCell>
              <TableCell>{escopoLabel(professor, ofertaSlug)}</TableCell>
              <TableCell>
                <Badge variant={professor.status === "ativo" ? "success" : "neutral"}>
                  {professor.status === "ativo" ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon
                    aria-label="Editar vínculo"
                    onClick={() => onEdit(professor)}
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
                      if (window.confirm(`Remover o vínculo com "${professor.nome}"?`)) {
                        onRemove(professor);
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
          Professores vinculados poderão registrar planejamentos, frequência e registros
          pedagógicos conforme o escopo de atuação definido aqui.
        </p>
      </div>
    </div>
  );
}
