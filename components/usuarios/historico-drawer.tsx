"use client";

import { BookOpen, Calendar, Clock, History, Mail, User, type LucideIcon } from "lucide-react";

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

import { FUNCAO_OPTIONS, STATUS_OPTIONS } from "@/app/(app)/usuarios/schema";
import type { AuditoriaRow, ReferenciaTurmas } from "@/app/(app)/usuarios/queries";

const FUNCAO_LABEL: Record<string, string> = Object.fromEntries(
  FUNCAO_OPTIONS.map((option) => [option.value, option.label]),
);
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

function formatAuditoriaValor(
  campo: string,
  valor: string | null,
  referencia: ReferenciaTurmas,
) {
  if (valor === null) return null;
  if (campo === "funcao") return FUNCAO_LABEL[valor] ?? valor;
  if (campo === "status") return STATUS_LABEL[valor] ?? valor;
  if (campo === "vinculo_turma_adicionado" || campo === "vinculo_turma_removido") {
    return referencia.turmas.find((turma) => turma.id === valor)?.nome ?? "Turma removida do sistema";
  }
  return valor;
}

const CAMPO_META: Record<string, { icon: LucideIcon; label: string }> = {
  funcao: { icon: User, label: "Função" },
  status: { icon: Clock, label: "Status" },
  email_login: { icon: Mail, label: "E-mail de login" },
  vinculo_turma_adicionado: { icon: BookOpen, label: "Turma vinculada" },
  vinculo_turma_removido: { icon: BookOpen, label: "Turma removida" },
};

function AuditoriaItem({ row, referencia }: { row: AuditoriaRow; referencia: ReferenciaTurmas }) {
  const meta = CAMPO_META[row.campoAlterado] ?? { icon: History, label: row.campoAlterado };
  const Icon = meta.icon;
  const de = formatAuditoriaValor(row.campoAlterado, row.valorAnterior, referencia);
  const para = formatAuditoriaValor(row.campoAlterado, row.valorNovo, referencia);

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

function HistoricoVazio({ mensagem }: { mensagem: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-[8px] py-[40px] text-center">
      <div className="flex size-[52px] items-center justify-center rounded-full bg-brand-tint text-brand">
        <History size={22} strokeWidth={2} aria-hidden="true" />
      </div>
      <p className="max-w-[240px] text-[13px] leading-relaxed text-muted">{mensagem}</p>
    </div>
  );
}

function HistoricoPanel({
  auditoria,
  referencia,
  cadastro,
}: {
  auditoria: AuditoriaRow[];
  referencia: ReferenciaTurmas;
  cadastro: { criadoEm: string; atualizadoEm: string } | undefined;
}) {
  if (cadastro) {
    return (
      <div className="flex flex-col gap-4 px-[8px] py-[8px]">
        <div className="flex items-center gap-3">
          <div className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
            <Calendar size={16} strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <div className="text-[12.5px] text-muted">Cadastrado em</div>
            <div className="text-[13.5px] font-semibold text-ink">
              {dateFormatter.format(new Date(cadastro.criadoEm))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
            <Clock size={16} strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <div className="text-[12.5px] text-muted">Última atualização</div>
            <div className="text-[13.5px] font-semibold text-ink">
              {dateFormatter.format(new Date(cadastro.atualizadoEm))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (auditoria.length === 0) {
    return <HistoricoVazio mensagem="Nenhuma alteração registrada ainda." />;
  }

  return (
    <div className="flex flex-col">
      {auditoria.map((row) => (
        <AuditoriaItem key={row.id} row={row} referencia={referencia} />
      ))}
    </div>
  );
}

/**
 * Histórico de alterações do usuário num drawer, aberto pelo botão do card
 * de topo — mesmo padrão do Cadastro de Estudante. Quem não é
 * administrador não lê a auditoria (RLS); nesse caso o drawer mostra só as
 * datas de cadastro e última atualização (`cadastro`).
 */
export function HistoricoUsuarioDrawer({
  auditoria,
  referencia,
  cadastro,
}: {
  auditoria: AuditoriaRow[];
  referencia: ReferenciaTurmas;
  cadastro: { criadoEm: string; atualizadoEm: string } | undefined;
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
          <SheetDescription className="sr-only">
            Alterações registradas no cadastro do usuário.
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <HistoricoPanel auditoria={auditoria} referencia={referencia} cadastro={cadastro} />
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
