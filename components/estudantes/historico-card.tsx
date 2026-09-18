import {
  AlertTriangle,
  BookOpen,
  Building2,
  ClipboardList,
  FileText,
  Heart,
  History,
  MessageSquare,
  ShieldAlert,
  Stethoscope,
  UserSquare,
  type LucideIcon,
} from "lucide-react";

import { SITUACAO_OPTIONS } from "@/app/(app)/estudantes/schema";
import {
  ENCAMINHAMENTO_OPTIONS,
  RECOMENDACAO_OPTIONS,
  STATUS_AVALIACAO_OPTIONS,
} from "@/app/(app)/estudantes/avaliacao-schema";
import { STATUS_DOCUMENTO_OPTIONS } from "@/app/(app)/estudantes/documentos-schema";
import { TIPO_CONDICAO_OPTIONS } from "@/app/(app)/estudantes/condicoes-schema";
import type { AuditoriaEstudanteRow, ReferenciaOfertas, TurmaOption } from "@/app/(app)/estudantes/queries";

export type ReferenciaAuditoria = {
  ofertas: ReferenciaOfertas["ofertas"];
  organizacoes: ReferenciaOfertas["organizacoes"];
  turmas: TurmaOption[];
  turnos: { id: string; nome: string }[];
};

const SITUACAO_LABEL: Record<string, string> = Object.fromEntries(
  SITUACAO_OPTIONS.map((option) => [option.value, option.label]),
);
const STATUS_AVALIACAO_LABEL: Record<string, string> = Object.fromEntries(
  STATUS_AVALIACAO_OPTIONS.map((option) => [option.value, option.label]),
);
const RECOMENDACAO_LABEL: Record<string, string> = Object.fromEntries(
  RECOMENDACAO_OPTIONS.map((option) => [option.value, option.label]),
);
const ENCAMINHAMENTO_LABEL: Record<string, string> = Object.fromEntries(
  ENCAMINHAMENTO_OPTIONS.map((option) => [option.value, option.label]),
);
const STATUS_DOCUMENTO_LABEL: Record<string, string> = Object.fromEntries(
  STATUS_DOCUMENTO_OPTIONS.map((option) => [option.value, option.label]),
);
const TIPO_CONDICAO_LABEL: Record<string, string> = Object.fromEntries(
  TIPO_CONDICAO_OPTIONS.map((option) => [option.value, option.label]),
);

const CAMPO_META: Record<string, { icon: LucideIcon; label: string }> = {
  situacao: { icon: UserSquare, label: "Situação" },
  cpf: { icon: UserSquare, label: "CPF" },
  documento_identificacao: { icon: UserSquare, label: "Documento de identificação" },
  status_avaliacao: { icon: ClipboardList, label: "Status da avaliação" },
  recomendacao_elegibilidade: { icon: ClipboardList, label: "Elegibilidade" },
  parecer_equipe: { icon: MessageSquare, label: "Análise integrada" },
  justificativa_elegibilidade: { icon: MessageSquare, label: "Justificativa" },
  encaminhamento_recomendado: { icon: MessageSquare, label: "Encaminhamento recomendado" },
  areas_apoio: { icon: Heart, label: "Áreas de apoio" },
  oferta_atual_id: { icon: Building2, label: "Oferta" },
  organizacao_atual_id: { icon: Building2, label: "Organização" },
  turno_id: { icon: Building2, label: "Turno" },
  turma_id: { icon: BookOpen, label: "Turma" },
  matricula_interna: { icon: BookOpen, label: "Matrícula interna" },
  documento_status: { icon: FileText, label: "Status do documento" },
  documento_removido: { icon: FileText, label: "Documento removido" },
  contribuicao_observacoes: { icon: Stethoscope, label: "Observações da contribuição" },
  contribuicao_implicacoes: { icon: Stethoscope, label: "Implicações para participação" },
  contribuicao_recomendacoes: { icon: Stethoscope, label: "Recomendações escolares" },
  contribuicao_removida: { icon: Stethoscope, label: "Contribuição removida" },
  condicao_tipo: { icon: ShieldAlert, label: "Tipo de condição" },
  condicao_cid: { icon: ShieldAlert, label: "CID" },
  condicao_observacoes: { icon: ShieldAlert, label: "Observações da condição" },
  condicao_removida: { icon: ShieldAlert, label: "Condição removida" },
  necessita_medicacao: { icon: AlertTriangle, label: "Necessita medicação" },
  medicacao_detalhes: { icon: AlertTriangle, label: "Detalhes da medicação" },
  alergias_restricoes: { icon: AlertTriangle, label: "Alergias e restrições" },
  situacoes_atencao: { icon: AlertTriangle, label: "Situações de atenção" },
  o_que_ajuda: { icon: AlertTriangle, label: "O que ajuda" },
  seguranca_cuidados: { icon: AlertTriangle, label: "Segurança e cuidados" },
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatArrayTexto(valor: string) {
  // old/new.areas_apoio::text vira o literal de array do Postgres
  // ("{Acadêmica,Comunicacional}") — só limpa as chaves pra exibição.
  return valor.replace(/^\{|\}$/g, "").split(",").filter(Boolean).join(", ") || "—";
}

function formatValor(campo: string, valor: string | null, referencia: ReferenciaAuditoria) {
  if (valor === null) return null;
  if (campo === "situacao") return SITUACAO_LABEL[valor] ?? valor;
  if (campo === "status_avaliacao") return STATUS_AVALIACAO_LABEL[valor] ?? valor;
  if (campo === "recomendacao_elegibilidade") return RECOMENDACAO_LABEL[valor] ?? valor;
  if (campo === "encaminhamento_recomendado") return ENCAMINHAMENTO_LABEL[valor] ?? valor;
  if (campo === "documento_status") return STATUS_DOCUMENTO_LABEL[valor] ?? valor;
  if (campo === "condicao_tipo") return TIPO_CONDICAO_LABEL[valor] ?? valor;
  if (campo === "areas_apoio") return formatArrayTexto(valor);
  if (campo === "necessita_medicacao") return valor === "true" ? "Sim" : "Não";
  if (campo === "oferta_atual_id") {
    return referencia.ofertas.find((oferta) => oferta.id === valor)?.nome ?? "Oferta removida do sistema";
  }
  if (campo === "organizacao_atual_id") {
    return referencia.organizacoes.find((org) => org.id === valor)?.nome ?? "Organização removida do sistema";
  }
  if (campo === "turno_id") {
    return referencia.turnos.find((turno) => turno.id === valor)?.nome ?? "Turno removido do sistema";
  }
  if (campo === "turma_id") {
    return referencia.turmas.find((turma) => turma.id === valor)?.nome ?? "Turma removida do sistema";
  }
  return valor;
}

function AuditoriaItem({ row, referencia }: { row: AuditoriaEstudanteRow; referencia: ReferenciaAuditoria }) {
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

export function HistoricoCard({
  auditoria,
  referencia,
}: {
  auditoria: AuditoriaEstudanteRow[] | undefined;
  referencia: ReferenciaAuditoria;
}) {
  return (
    <div className="static overflow-hidden rounded-md border border-line bg-surface shadow-sm xl:sticky xl:top-0">
      <div className="border-b border-line px-[24px] py-[16px]">
        <h3 className="text-highlight text-ink">Histórico de alterações</h3>
      </div>
      <div className="p-[24px]">
        {auditoria === undefined ? (
          <div className="flex flex-col items-center gap-2 px-[8px] py-[40px] text-center">
            <div className="flex size-[52px] items-center justify-center rounded-full bg-brand-tint text-brand">
              <History size={22} strokeWidth={2} aria-hidden="true" />
            </div>
            <p className="max-w-[240px] text-[13px] leading-relaxed text-muted">
              O histórico de alterações fica disponível depois que o cadastro é salvo pela
              primeira vez.
            </p>
          </div>
        ) : auditoria.length === 0 ? (
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
      </div>
    </div>
  );
}
