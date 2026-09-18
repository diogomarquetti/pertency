import { z } from "zod";

import { OFERTA_OPTIONS } from "@/app/(app)/turmas/schema";

export { OFERTA_OPTIONS };

// HU-EST-001 v2.0, seção 13.1 — "Tipo de matrícula" saiu do documento e foi
// absorvido aqui: Rematrícula/continuidade cobre o mesmo caso de uso.
export const FORMA_INGRESSO_OPTIONS = [
  { value: "avaliacao_ingresso", label: "Avaliação de Ingresso" },
  { value: "transferencia_recebida", label: "Transferência recebida" },
  { value: "rematricula_continuidade", label: "Rematrícula/continuidade" },
  { value: "outro", label: "Outro" },
] as const;

// A história pede lista (origem "Configuração"), mas não enumera as opções —
// lista provisória até existir um módulo de Configurações que a parametrize
// por escola (mesmo tratamento dado a FORMA_INGRESSO_OPTIONS).
export const MOTIVO_ENCERRAMENTO_OPTIONS = [
  { value: "transferencia_outra_escola", label: "Transferência para outra escola" },
  { value: "mudanca_endereco", label: "Mudança de endereço/cidade" },
  { value: "solicitacao_familia", label: "Solicitação da família" },
  { value: "decisao_pedagogica", label: "Decisão pedagógica da escola" },
  { value: "outro", label: "Outro" },
] as const;

// Campos deste objeto se dividem em dois destinos de persistência (ver
// dados-escolares-actions.ts): fatos únicos da trajetória (situacao,
// dataIngresso, formaIngresso, origem escolar, encerramento, observações —
// tabela `dados_escolares`) e o vínculo do ano letivo selecionado (oferta,
// organização, turno, turma, matrícula, transporte, data de matrícula —
// tabela `vinculos_escolares_anuais`, 1:N por ano). O form trata os dois como
// uma coisa só; só a Server Action sabe que viram duas tabelas.
const dadosEscolaresFields = {
  situacao: z.string().min(1, "Selecione a situação do estudante"),
  dataIngresso: z.string().optional().or(z.literal("")),
  formaIngresso: z.string().optional().or(z.literal("")),

  anoLetivoId: z.string().optional().or(z.literal("")),
  dataMatriculaEfetiva: z.string().optional().or(z.literal("")),
  ofertaAtualSlug: z.string().optional().or(z.literal("")),
  ofertaAtualId: z.string().optional().or(z.literal("")),
  organizacaoAtualId: z.string().optional().or(z.literal("")),
  etapaDoCiclo: z.string().optional().or(z.literal("")),
  turnoId: z.string().optional().or(z.literal("")),
  turmaId: z.string().optional().or(z.literal("")),
  matriculaInterna: z.string().optional().or(z.literal("")),
  utilizaTransporte: z.boolean(),
  redeOrigem: z.string().optional().or(z.literal("")),
  escolaOrigem: z.string().optional().or(z.literal("")),
  historicoTransferencia: z.string().optional().or(z.literal("")),
  dataEncerramento: z.string().optional().or(z.literal("")),
  motivoEncerramento: z.string().optional().or(z.literal("")),
  observacoes: z.string().optional().or(z.literal("")),
};

// Regra 3 da história: estudante Ativo precisa de oferta atual, organização
// atual, turno, turma, matrícula interna e data de matrícula efetiva.
// Regra do bloco "Ensino Fundamental": etapa do ciclo obrigatória nessa
// oferta. Bloco "Encerramento": obrigatório quando a situação é
// transferido/desligado.
export const dadosEscolaresSchema = z.object({ ...dadosEscolaresFields }).superRefine((data, ctx) => {
  if (data.situacao === "ativo") {
    const camposObrigatorios: [keyof typeof dadosEscolaresFields, string][] = [
      ["anoLetivoId", "Selecione o ano letivo"],
      ["ofertaAtualId", "Selecione a oferta atual"],
      ["organizacaoAtualId", "Selecione a organização atual"],
      ["turnoId", "Selecione o turno"],
      ["turmaId", "Selecione a turma"],
      ["matriculaInterna", "Informe a matrícula interna"],
      ["dataMatriculaEfetiva", "Informe a data de matrícula efetiva"],
    ];
    for (const [campo, mensagem] of camposObrigatorios) {
      if (!data[campo]) {
        ctx.addIssue({ code: "custom", path: [campo], message: mensagem });
      }
    }
  }

  if (data.ofertaAtualSlug === "ef" && !data.etapaDoCiclo) {
    ctx.addIssue({ code: "custom", path: ["etapaDoCiclo"], message: "Selecione a etapa do ciclo" });
  }

  if (data.situacao === "transferido" || data.situacao === "desligado") {
    if (!data.dataEncerramento) {
      ctx.addIssue({ code: "custom", path: ["dataEncerramento"], message: "Informe a data de encerramento" });
    }
    if (!data.motivoEncerramento) {
      ctx.addIssue({ code: "custom", path: ["motivoEncerramento"], message: "Informe o motivo do encerramento" });
    }
  }

  // CA25 da HU-EST-001 v2.0: a matrícula efetiva não pode anteceder a
  // entrada no processo/escola.
  if (data.dataIngresso && data.dataMatriculaEfetiva && data.dataMatriculaEfetiva < data.dataIngresso) {
    ctx.addIssue({
      code: "custom",
      path: ["dataMatriculaEfetiva"],
      message: "A data de matrícula efetiva não pode ser anterior à data de ingresso",
    });
  }
});

export type DadosEscolaresValues = z.infer<typeof dadosEscolaresSchema>;

export const DADOS_ESCOLARES_EMPTY_VALUES: DadosEscolaresValues = {
  situacao: "em_analise_de_ingresso",
  dataIngresso: "",
  formaIngresso: "",
  anoLetivoId: "",
  dataMatriculaEfetiva: "",
  ofertaAtualSlug: "",
  ofertaAtualId: "",
  organizacaoAtualId: "",
  etapaDoCiclo: "",
  turnoId: "",
  turmaId: "",
  matriculaInterna: "",
  utilizaTransporte: false,
  redeOrigem: "",
  escolaOrigem: "",
  historicoTransferencia: "",
  dataEncerramento: "",
  motivoEncerramento: "",
  observacoes: "",
};
