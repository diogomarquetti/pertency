import { MEIO_COMUNICACAO_OPTIONS } from "./perfil-funcional-schema";
import type { PerfilFuncionalEstudante } from "./queries";

const MEIO_COMUNICACAO_LABEL: Record<string, string> = Object.fromEntries(
  MEIO_COMUNICACAO_OPTIONS.map((option) => [option.value, option.label]),
);

export type Alerta = { titulo: string; descricao: string };

/**
 * perfil_funcional_estudante guarda campos soltos, não uma lista — monta a
 * lista de alerta a partir dos campos não vazios, cada um com rótulo fixo
 * (mesmo espírito do CAMPO_META do Histórico, Onda 4).
 */
export function montarAlertas(perfil: PerfilFuncionalEstudante | null): Alerta[] {
  if (!perfil) return [];

  const alertas: Alerta[] = [];

  if (perfil.alergiasRestricoes) {
    alertas.push({ titulo: "Alergia/restrição", descricao: perfil.alergiasRestricoes });
  }
  if (perfil.necessitaMedicacao) {
    alertas.push({
      titulo: "Necessita medicação",
      descricao: perfil.medicacaoDetalhes || "Sem detalhes registrados.",
    });
  }
  if (perfil.situacoesAtencao) {
    alertas.push({ titulo: "Situação que exige atenção", descricao: perfil.situacoesAtencao });
  }
  if (perfil.segurancaCuidados) {
    alertas.push({ titulo: "Segurança e cuidados", descricao: perfil.segurancaCuidados });
  }
  if (perfil.oQueAjuda) {
    alertas.push({ titulo: "O que ajuda", descricao: perfil.oQueAjuda });
  }
  if (
    perfil.recursosCaa.length > 0 ||
    ["caa", "gestual", "multimodal"].includes(perfil.meioComunicacao)
  ) {
    alertas.push({
      titulo: "Comunicação alternativa",
      descricao:
        perfil.recursosCaa.length > 0
          ? perfil.recursosCaa.join(", ")
          : (MEIO_COMUNICACAO_LABEL[perfil.meioComunicacao] ?? perfil.meioComunicacao),
    });
  }

  return alertas;
}
