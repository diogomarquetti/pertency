"use client";

import { BookOpen, Clock, History, Type as TypeIcon, Users, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { STATUS_OPTIONS } from "@/app/(app)/turmas/schema";
import type { AuditoriaTurmaRow, ReferenciaTurmaForm } from "@/app/(app)/turmas/queries";

const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map((option) => [option.value, option.label]),
);

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatValor(campo: string, valor: string | null, referencia: ReferenciaTurmaForm) {
  if (valor === null) return null;
  if (campo === "status") return STATUS_LABEL[valor] ?? valor;
  if (campo === "oferta_id") {
    return referencia.ofertas.find((oferta) => oferta.id === valor)?.nome ?? "Oferta removida do sistema";
  }
  return valor;
}

const CAMPO_META: Record<string, { icon: LucideIcon; label: string }> = {
  status: { icon: Clock, label: "Status" },
  nome: { icon: TypeIcon, label: "Nome da turma" },
  capacidade: { icon: Users, label: "Capacidade" },
  oferta_id: { icon: BookOpen, label: "Oferta" },
};

function AuditoriaItem({ row, referencia }: { row: AuditoriaTurmaRow; referencia: ReferenciaTurmaForm }) {
  const meta = CAMPO_META[row.campoAlterado] ?? { icon: History, label: row.campoAlterado };
  const Icon = meta.icon;
  const de = formatValor(row.campoAlterado, row.valorAnterior, referencia);
  const para = formatValor(row.campoAlterado, row.valorNovo, referencia);

  return (
    <div className="flex gap-3 border-b border-line py-3 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand-ink">
        <Icon size={14} strokeWidth={2} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <div className="text-[13.5px] font-semibold text-ink">{meta.label}</div>
        <div className="text-[13px] text-ink">
          {de && para ? (
            <>
              <span className="text-muted line-through decoration-[#C7CFD9]">{de}</span> →{" "}
              <span className="font-semibold text-brand-ink">{para}</span>
            </>
          ) : para ? (
            <span className="font-semibold text-brand-ink">{para}</span>
          ) : (
            "Alterado"
          )}
        </div>
        <div className="mt-[2px] text-[12px] text-muted">
          {row.alteradoPorNome ?? "Sistema"} · {dateFormatter.format(new Date(row.alteradoEm))}
        </div>
      </div>
    </div>
  );
}

/**
 * Histórico de alterações da turma num drawer, aberto pelo botão do card de
 * topo — mesmo padrão dos cadastros de Estudante e Usuário. Só existe em
 * modo edição: antes do primeiro salvamento não há histórico.
 */
export function HistoricoTurmaDrawer({
  referencia,
  auditoria,
}: {
  referencia: ReferenciaTurmaForm;
  auditoria: AuditoriaTurmaRow[];
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="secondary" size="sm">
          <History size={14} strokeWidth={2} aria-hidden="true" />
          Histórico de alterações
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Histórico de alterações</SheetTitle>
          <SheetDescription className="sr-only">Alterações registradas no cadastro da turma.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          {auditoria.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-[8px] py-[40px] text-center">
              <div className="flex size-[52px] items-center justify-center rounded-full bg-brand-tint text-brand">
                <History size={22} strokeWidth={2} aria-hidden="true" />
              </div>
              <p className="max-w-[240px] text-[13px] leading-relaxed text-muted">
                Nenhuma alteração registrada ainda.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {auditoria.map((row) => (
                <AuditoriaItem key={row.id} row={row} referencia={referencia} />
              ))}
            </div>
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
