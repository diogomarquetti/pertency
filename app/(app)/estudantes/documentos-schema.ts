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

export const STATUS_DOCUMENTO_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "entregue", label: "Entregue" },
  { value: "nao_se_aplica", label: "Não se aplica" },
] as const;
