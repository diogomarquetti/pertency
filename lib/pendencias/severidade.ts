import type { Pendencia, Severidade, TipoPendencia } from "./types";

const ORDEM_SEVERIDADE: Record<Severidade, number> = { atrasada: 0, atencao: 1, normal: 2 };

export function calcularSeveridade(tipo: TipoPendencia, dias: number): Severidade {
  if (tipo.prazo) {
    return dias >= tipo.prazo.dias ? tipo.prazo.vencido : tipo.prazo.noPrazo;
  }
  return tipo.severidade ?? "normal";
}

/** Atrasada → atenção → normal; dentro da mesma severidade, a mais antiga primeiro. */
export function ordenarPendencias(pendencias: Pendencia[]): Pendencia[] {
  return [...pendencias].sort(
    (a, b) => ORDEM_SEVERIDADE[a.severidade] - ORDEM_SEVERIDADE[b.severidade] || b.dias - a.dias,
  );
}
