"use client";

import { useMemo, useState } from "react";
import { AlertCircle, BookOpen, Clock, History, Mail, User, X, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FUNCAO_OPTIONS, STATUS_OPTIONS } from "@/app/(app)/usuarios/schema";
import type { AuditoriaRow, ReferenciaTurmas } from "@/app/(app)/usuarios/queries";
import type { VinculoLocal } from "./vinculo-types";

export type PanelState = { mode: "historico" } | { mode: "form"; editingIndex: number | null };

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
}: {
  auditoria: AuditoriaRow[] | undefined;
  referencia: ReferenciaTurmas;
}) {
  if (auditoria === undefined) {
    return (
      <HistoricoVazio mensagem="O histórico de alterações fica disponível depois que o cadastro é salvo pela primeira vez." />
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

function TurmaFormPanel({
  referencia,
  vinculosExistentes,
  editingIndex,
  onSubmit,
  onClose,
}: {
  referencia: ReferenciaTurmas;
  vinculosExistentes: VinculoLocal[];
  editingIndex: number | null;
  onSubmit: (vinculo: VinculoLocal) => void;
  onClose: () => void;
}) {
  const editando = editingIndex !== null ? vinculosExistentes[editingIndex] : null;

  const [etapaCicloId, setEtapaCicloId] = useState(editando?.etapaCicloId ?? "");
  const [turnoId, setTurnoId] = useState(editando?.turnoId ?? "");
  const [turmaId, setTurmaId] = useState(editando?.turmaId ?? "");
  const [componenteIds, setComponenteIds] = useState<string[]>(editando?.componenteIds ?? []);
  const [error, setError] = useState<string | null>(null);

  const turmasFiltradas = useMemo(
    () =>
      referencia.turmas.filter(
        (turma) =>
          (!etapaCicloId || turma.etapaCicloId === etapaCicloId) &&
          (!turnoId || turma.turnoId === turnoId),
      ),
    [referencia.turmas, etapaCicloId, turnoId],
  );

  function toggleComponente(id: string) {
    setComponenteIds((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
    );
  }

  function handleSubmit() {
    if (!etapaCicloId || !turnoId || !turmaId) {
      setError("Selecione etapa/ciclo, turno e turma.");
      return;
    }
    if (componenteIds.length === 0) {
      setError("Selecione ao menos um componente curricular.");
      return;
    }

    // Ao editar, o próprio vínculo não conta como "já existente" pra essa
    // checagem — senão editar sem trocar a turma sempre falha.
    const outrosVinculos = vinculosExistentes.filter((_, i) => i !== editingIndex);
    if (outrosVinculos.some((vinculo) => vinculo.turmaId === turmaId)) {
      setError("Essa turma já está vinculada a este usuário.");
      return;
    }

    const etapa = referencia.etapasCiclos.find((item) => item.id === etapaCicloId);
    const turno = referencia.turnos.find((item) => item.id === turnoId);
    const turma = referencia.turmas.find((item) => item.id === turmaId);
    const componentes = referencia.componentes.filter((item) => componenteIds.includes(item.id));

    onSubmit({
      etapaCicloId,
      turnoId,
      turmaId,
      componenteIds,
      etapaCicloNome: etapa?.nome ?? "",
      turnoNome: turno?.nome ?? "",
      turmaNome: turma?.nome ?? "",
      componentesNomes: componentes.map((item) => item.nome),
    });
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-line px-[24px] py-[16px]">
        <h3 className="text-highlight text-ink">
          {editingIndex !== null ? "Editar turma" : "Adicionar turma"}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon
          aria-label="Fechar, voltar ao histórico"
          onClick={onClose}
        >
          <X size={15} strokeWidth={2} aria-hidden="true" />
        </Button>
      </div>

      <div className="flex flex-col gap-5 p-[24px]">
        <div className="grid gap-2">
          <Label>Etapa/Ciclo</Label>
          <Select
            value={etapaCicloId}
            onValueChange={(value) => {
              setEtapaCicloId(value);
              setTurmaId("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a etapa/ciclo" />
            </SelectTrigger>
            <SelectContent>
              {referencia.etapasCiclos.map((etapa) => (
                <SelectItem key={etapa.id} value={etapa.id}>
                  {etapa.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Turno</Label>
          <Select
            value={turnoId}
            onValueChange={(value) => {
              setTurnoId(value);
              setTurmaId("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o turno" />
            </SelectTrigger>
            <SelectContent>
              {referencia.turnos.map((turno) => (
                <SelectItem key={turno.id} value={turno.id}>
                  {turno.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Turma</Label>
          <Select value={turmaId} onValueChange={setTurmaId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a turma" />
            </SelectTrigger>
            <SelectContent>
              {turmasFiltradas.map((turma) => (
                <SelectItem key={turma.id} value={turma.id}>
                  {turma.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Componentes curriculares</Label>
          <span className="mb-1 text-[12.5px] text-muted">Selecione ao menos um</span>
          <div className="rounded-sm border border-line px-[10px]">
            {referencia.componentes.map((componente, index) => (
              <label
                key={componente.id}
                className={cn(
                  "flex cursor-pointer items-center gap-[10px] py-[9px] text-[14px] text-ink",
                  index > 0 && "border-t border-line",
                )}
              >
                <Checkbox
                  checked={componenteIds.includes(componente.id)}
                  onCheckedChange={() => toggleComponente(componente.id)}
                />
                {componente.nome}
              </label>
            ))}
          </div>
        </div>

        {error && (
          <p className="flex items-center gap-[5px] text-[12.5px] text-danger" role="alert">
            <AlertCircle size={14} strokeWidth={2} className="shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>

      <div className="border-t border-line p-[16px]">
        <Button type="button" className="w-full justify-center" onClick={handleSubmit}>
          {editingIndex !== null ? "Salvar" : "Adicionar"}
        </Button>
      </div>
    </>
  );
}

export function ContextPanel({
  panelState,
  onClose,
  referencia,
  vinculos,
  onAddVinculo,
  onReplaceVinculo,
  auditoria,
}: {
  panelState: PanelState;
  onClose: () => void;
  referencia: ReferenciaTurmas;
  vinculos: VinculoLocal[];
  onAddVinculo: (vinculo: VinculoLocal) => void;
  onReplaceVinculo: (index: number, vinculo: VinculoLocal) => void;
  auditoria: AuditoriaRow[] | undefined;
}) {
  return (
    <div className="static overflow-hidden rounded-md border border-line bg-surface shadow-sm xl:sticky xl:top-0">
      {panelState.mode === "historico" ? (
        <>
          <div className="border-b border-line px-[24px] py-[16px]">
            <h3 className="text-highlight text-ink">Histórico de alterações</h3>
          </div>
          <div className="p-[24px]">
            <HistoricoPanel auditoria={auditoria} referencia={referencia} />
          </div>
        </>
      ) : (
        <TurmaFormPanel
          key={panelState.editingIndex ?? "new"}
          referencia={referencia}
          vinculosExistentes={vinculos}
          editingIndex={panelState.editingIndex}
          onClose={onClose}
          onSubmit={(vinculo) => {
            if (panelState.editingIndex !== null) {
              onReplaceVinculo(panelState.editingIndex, vinculo);
            } else {
              onAddVinculo(vinculo);
            }
            onClose();
          }}
        />
      )}
    </div>
  );
}
