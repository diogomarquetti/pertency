export const DOCUMENTO_TIPOS_FIXOS = [
  { tipo: "documento_identificacao", label: "Documento de identificação (RG ou Certidão)" },
  { tipo: "cpf", label: "CPF" },
  { tipo: "comprovante_endereco", label: "Comprovante de endereço" },
  { tipo: "carteira_vacinacao", label: "Carteira de vacinação ou declaração vacinal" },
  { tipo: "cartao_sus", label: "Cartão SUS" },
  { tipo: "rg_cpf_responsavel_principal", label: "RG e CPF do responsável principal" },
  { tipo: "rg_cpf_segundo_responsavel", label: "RG e CPF do segundo responsável" },
  { tipo: "autorizacao_imagem", label: "Autorização de uso de imagem" },
  { tipo: "vida_escolar_anterior", label: "Histórico escolar, declaração ou guia de transferência" },
  { tipo: "laudo", label: "Laudo" },
  { tipo: "relatorio_anterior", label: "Relatório anterior" },
] as const;

export type DocumentoTipoFixo = (typeof DOCUMENTO_TIPOS_FIXOS)[number]["tipo"];

// Rótulos do status (usados no histórico de alterações). O status não é
// mais escolhido pelo usuário — ver documentos-actions.ts.
export const STATUS_DOCUMENTO_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "entregue", label: "Entregue" },
  { value: "nao_se_aplica", label: "Não se aplica" },
  { value: "gerado_pelo_sistema", label: "Gerado pelo sistema" },
] as const;

// Documentos que só existem quando o estudante veio de outra escola — com
// Forma de origem "Primeira matrícula escolar" (Dados escolares), ficam
// "Não se aplica" automaticamente enquanto nada tiver sido entregue. O mesmo
// vale pro RG/CPF do segundo responsável quando não há segundo responsável.
const TIPOS_DEPENDENTES_DE_ESCOLA_ANTERIOR = new Set(["vida_escolar_anterior", "relatorio_anterior"]);

/**
 * "Não se aplica" deduzido pelo sistema — devolve o motivo exibido na linha,
 * ou null quando o documento se aplica. Não é gravado, é calculado na leitura.
 */
export function naoSeAplicaAutomatico(
  tipo: string,
  contexto: { formaOrigem: string | null | undefined; temSegundoResponsavel: boolean },
) {
  if (contexto.formaOrigem === "primeira_matricula" && TIPOS_DEPENDENTES_DE_ESCOLA_ANTERIOR.has(tipo)) {
    return "Primeira matrícula escolar (Forma de origem em Dados escolares)";
  }
  if (tipo === "rg_cpf_segundo_responsavel" && !contexto.temSegundoResponsavel) {
    return "Sem segundo responsável cadastrado (Dados pessoais)";
  }
  return null;
}
