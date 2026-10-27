import { DOCUMENTO_LABEL, getEstudantesComDocumentosPendentes } from "../fontes/documentos";
import type { TipoPendencia } from "../types";

// Quantos tipos de documento aparecem na descrição antes do "e mais N".
const MAX_TIPOS_NA_DESCRICAO = 4;

// Um item só para a escola inteira (agrupado), não um por estudante.
export const documentosPendentes: TipoPendencia = {
  tipo: "documentos_pendentes",
  origem: "documentos",
  titulo: "Documentos pendentes",
  acao: "Ver documentos",
  resolve: ["secretaria"],
  acompanha: [],
  regra: "Estudante Ativo com documento do checklist ainda Pendente (sem entrega nem \"não se aplica\"). Provisório: hoje todos os tipos fixos do checklist contam, inclusive laudo e relatório anterior.",
  severidade: "normal",
  rotuloTempo: (dias) => (dias === 0 ? "mais antigo de hoje" : `mais antigo há ${dias} ${dias === 1 ? "dia" : "dias"}`),
  async carregar() {
    const estudantes = await getEstudantesComDocumentosPendentes();
    if (estudantes.length === 0) return [];

    const porTipo = new Map<string, number>();
    for (const estudante of estudantes) {
      for (const tipo of estudante.pendentes) porTipo.set(tipo, (porTipo.get(tipo) ?? 0) + 1);
    }
    const tipos = [...porTipo.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([tipo, total]) => `${DOCUMENTO_LABEL[tipo] ?? tipo} (${total})`);
    const visiveis = tipos.slice(0, MAX_TIPOS_NA_DESCRICAO);
    const resto = tipos.length - visiveis.length;
    const lista =
      resto > 0
        ? `${visiveis.join(", ")} e mais ${resto} ${resto === 1 ? "tipo" : "tipos"}`
        : visiveis.length > 1
          ? `${visiveis.slice(0, -1).join(", ")} e ${visiveis.at(-1)}`
          : visiveis[0];

    return [
      {
        entidadeId: "escola",
        sujeito: estudantes.length === 1 ? estudantes[0].nome : `${estudantes.length} estudantes`,
        descricao: `${lista}.`,
        estado: "Estudantes ativos",
        desde: estudantes.map((estudante) => estudante.desde).sort()[0],
        destino: "/estudantes?pendencia=documentos",
      },
    ];
  },
};
