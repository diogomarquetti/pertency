import type { Prazo } from "./types";

/**
 * Prazos das regras de pendência, num lugar só. Os tipos em
 * lib/pendencias/tipos/ referenciam daqui em vez de declarar números soltos.
 */
// PROVISÓRIO: validar com P.O — todos os prazos abaixo.
export const PRAZOS = {
  avaliacao_nao_iniciada: { dias: 3, noPrazo: "normal", vencido: "atencao", provisorio: true },
  avaliacao_parada: { dias: 10, noPrazo: "atencao", vencido: "atrasada", provisorio: true },
  matricula_pendente: { dias: 5, noPrazo: "atencao", vencido: "atrasada", provisorio: true },
  componente_sem_professor: { dias: 5, noPrazo: "normal", vencido: "atencao", provisorio: true },
  usuario_sem_primeiro_acesso: { dias: 7, noPrazo: "normal", vencido: "atencao", provisorio: true },
} as const satisfies Record<string, Prazo>;

// PROVISÓRIO: validar com P.O — destaque de turma quase cheia no painel de Ocupação.
export const OCUPACAO_ALERTA_PERCENTUAL = 90;
