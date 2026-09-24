export const DOCUMENTO_TIPOS_FIXOS = [
  { tipo: "documento_identificacao", label: "Documento de identificação (RG ou Certidão)" },
  { tipo: "cpf", label: "CPF" },
  { tipo: "comprovante_endereco", label: "Comprovante de endereço" },
  { tipo: "carteira_vacinacao", label: "Carteira de vacinação ou declaração vacinal" },
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
// "Não se aplica" automaticamente enquanto nada tiver sido entregue.
const TIPOS_DEPENDENTES_DE_ESCOLA_ANTERIOR = new Set(["vida_escolar_anterior", "relatorio_anterior"]);

export function naoSeAplicaAutomatico(tipo: string, formaOrigem: string | null | undefined) {
  return formaOrigem === "primeira_matricula" && TIPOS_DEPENDENTES_DE_ESCOLA_ANTERIOR.has(tipo);
}
