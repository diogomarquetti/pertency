import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

// Rótulos duplicados aqui (em vez de importar as consts de
// app/(app)/estudantes/*) — este arquivo roda no lado do servidor (Server
// Action), fora do fluxo de formulário/zod, e usar direto o mesmo par
// valor→label evita puxar dependências de client component sem necessidade.

const NIVEL_APOIO_LABEL: Record<string, string> = {
  intermitente: "Intermitente",
  limitado: "Limitado",
  extensivo: "Extensivo",
  pervasivo: "Pervasivo",
};

const RECOMENDACAO_LABEL: Record<string, string> = {
  elegivel: "Elegível",
  nao_elegivel: "Não elegível",
};

const AREA_CONTRIBUICAO_LABEL: Record<string, string> = {
  servico_social: "Serviço Social",
  psicologia: "Psicologia",
  fonoaudiologia: "Fonoaudiologia",
  fisioterapia: "Fisioterapia",
  terapia_ocupacional: "Terapia Ocupacional",
  pedagogia: "Pedagogia",
  arte: "Arte",
  educacao_fisica: "Educação Física",
  outro: "Outro",
};

const ENCAMINHAMENTO_LABEL: Record<string, string> = {
  efetivar_matricula: "Efetivar matrícula",
  rede_regular_com_apoios: "Rede regular com apoios",
  orientar_familia: "Orientar família",
  solicitar_complementacao: "Solicitar complementação",
  outro: "Outro",
};

// O PDF circula fora do sistema — "Efetivar matrícula" sozinho não diz onde.
function encaminhamentoTexto(encaminhamento: string, escolaNomeOficial: string) {
  if (encaminhamento === "efetivar_matricula") return `Efetivar matrícula na ${escolaNomeOficial}`;
  return ENCAMINHAMENTO_LABEL[encaminhamento] ?? "—";
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return dateFormatter.format(new Date(value));
}

const styles = StyleSheet.create({
  marcaDagua: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  marcaDaguaTexto: {
    fontSize: 110,
    fontWeight: 700,
    color: "#C7CFD9",
    opacity: 0.35,
    transform: "rotate(-35deg)",
  },
  page: { paddingVertical: 36, paddingHorizontal: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1A1F26" },
  titulo: { fontSize: 15, fontWeight: 700, marginBottom: 2 },
  subtitulo: { fontSize: 10, color: "#5B6472", marginBottom: 16 },
  secao: { marginBottom: 14 },
  secaoTitulo: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#D8DEE6",
  },
  linha: { flexDirection: "row", marginBottom: 4 },
  campo: { width: "50%", paddingRight: 8 },
  rotulo: { fontSize: 8.5, color: "#5B6472", marginBottom: 1 },
  valor: { fontSize: 10, lineHeight: 1.4 },
  paragrafo: { fontSize: 10, lineHeight: 1.5, marginBottom: 6 },
  tabelaHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#D8DEE6", paddingBottom: 3, marginBottom: 3 },
  tabelaLinha: { flexDirection: "row", paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: "#EEF1F4" },
  tabelaCelula: { fontSize: 9 },
  rodape: { position: "absolute", bottom: 24, left: 40, right: 40, fontSize: 8, color: "#8A93A0", textAlign: "center" },
});

function Campo({ rotulo, valor, inteiro }: { rotulo: string; valor: string; inteiro?: boolean }) {
  return (
    <View style={inteiro ? [styles.campo, { width: "100%" }] : styles.campo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={styles.valor}>{valor || "—"}</Text>
    </View>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={styles.secao} wrap={false}>
      <Text style={styles.secaoTitulo}>{titulo}</Text>
      {children}
    </View>
  );
}

export type ParticipanteRelatorio = { nome: string; funcao: string };

export type ContribuicaoRelatorio = {
  profissionalNome: string;
  areaContribuicao: string;
  observacoes: string;
  implicacoesParticipacao: string;
  recomendacoesEscolares: string;
  criadoEm: string;
};

export type AvaliacaoRelatorioData = {
  escolaNome: string;
  escolaNomeOficial: string;
  escolaMunicipio: string;
  estudanteNome: string;
  dataNascimento: string;
  idade: number | null;
  ofertaPretendidaNome: string;
  organizacaoPretendidaNome: string;
  dataInicio: string;
  dataTermino: string;
  historicoEscolar: string;
  informacoesFamilia: string;
  contextoSociocultural: string;
  habilidadesConceituais: string;
  habilidadesSociais: string;
  habilidadesPraticas: string;
  dimensaoParticipacao: string;
  contextoEscolar: string;
  contextoFamiliar: string;
  contextoComunitario: string;
  fatoresFacilitadores: string;
  barreirasIdentificadas: string;
  necessidadesEspecificas: string;
  nivelApoio: string;
  areasApoio: string[];
  parecerEquipe: string;
  recomendacaoElegibilidade: string;
  justificativaElegibilidade: string;
  encaminhamentoRecomendado: string;
  orientacoesPai: string;
  participantes: ParticipanteRelatorio[];
  dataConclusao: string;
  contribuicoes: ContribuicaoRelatorio[];
};

/**
 * PDF da Avaliação de Ingresso (HU-EST-001 v2.0, seção 11.4). `tipo`
 * "completo" soma o Encaminhamento recomendado e a seção de Contribuições
 * complementares por cima do formulário padrão; "padrao" reproduz só o
 * formulário oficial (que não tem Encaminhamento). Os blocos abaixo seguem a
 * estrutura da seção 11.2. Status da avaliação não entra: é controle interno
 * do sistema, não parte do formulário.
 */
export function AvaliacaoRelatorioPdf({
  tipo,
  data,
  previa = false,
}: {
  tipo: "padrao" | "completo";
  data: AvaliacaoRelatorioData;
  /** Prévia (avaliação ainda não concluída ou só pra conferência): marca d'água em todas as páginas. */
  previa?: boolean;
}) {
  return (
    <Document title={`Avaliação de Ingresso — ${data.estudanteNome}`}>
      <Page size="A4" style={styles.page}>
        {previa && (
          <View fixed style={styles.marcaDagua}>
            <Text style={styles.marcaDaguaTexto}>PRÉVIA</Text>
          </View>
        )}
        <Text style={styles.titulo}>Avaliação de Ingresso</Text>
        <Text style={styles.subtitulo}>
          Relatório {tipo === "completo" ? "completo" : "padrão"} · {data.escolaNome}
          {previa && " · Prévia — não é o documento oficial"}
        </Text>

        <Secao titulo="1. Identificação">
          <View style={styles.linha}>
            <Campo rotulo="Escola" valor={data.escolaNome} />
            <Campo rotulo="Município" valor={data.escolaMunicipio} />
          </View>
          <View style={styles.linha}>
            <Campo
              inteiro
              rotulo="Equipe responsável pela avaliação"
              valor={data.participantes
                .map((participante) => `${participante.nome} (${participante.funcao})`)
                .join(", ")}
            />
          </View>
          <View style={styles.linha}>
            <Campo rotulo="Estudante" valor={data.estudanteNome} />
            <Campo
              rotulo="Data de nascimento / Idade"
              valor={`${formatDate(data.dataNascimento)}${data.idade !== null ? ` (${data.idade} anos)` : ""}`}
            />
          </View>
          <View style={styles.linha}>
            <Campo rotulo="Oferta pretendida" valor={data.ofertaPretendidaNome} />
            <Campo rotulo="Organização pretendida" valor={data.organizacaoPretendidaNome} />
          </View>
          <View style={styles.linha}>
            <Campo rotulo="Data de início / término" valor={`${formatDate(data.dataInicio)} — ${formatDate(data.dataTermino)}`} />
          </View>
        </Secao>

        <Secao titulo="2. Histórico e contexto">
          <Text style={styles.rotulo}>Breve histórico escolar</Text>
          <Text style={styles.paragrafo}>{data.historicoEscolar || "—"}</Text>
          <Text style={styles.rotulo}>Informações relevantes da família</Text>
          <Text style={styles.paragrafo}>{data.informacoesFamilia || "—"}</Text>
          <Text style={styles.rotulo}>Contexto sociocultural</Text>
          <Text style={styles.paragrafo}>{data.contextoSociocultural || "—"}</Text>
        </Secao>

        <Secao titulo="3. Dimensões">
          <Text style={styles.rotulo}>Habilidades conceituais</Text>
          <Text style={styles.paragrafo}>{data.habilidadesConceituais || "—"}</Text>
          <Text style={styles.rotulo}>Habilidades sociais</Text>
          <Text style={styles.paragrafo}>{data.habilidadesSociais || "—"}</Text>
          <Text style={styles.rotulo}>Habilidades práticas</Text>
          <Text style={styles.paragrafo}>{data.habilidadesPraticas || "—"}</Text>
        </Secao>

        <Secao titulo="4. Participação e contexto">
          <Text style={styles.rotulo}>Participação do estudante</Text>
          <Text style={styles.paragrafo}>{data.dimensaoParticipacao || "—"}</Text>
          <Text style={styles.rotulo}>Contexto escolar</Text>
          <Text style={styles.paragrafo}>{data.contextoEscolar || "—"}</Text>
          <Text style={styles.rotulo}>Contexto familiar</Text>
          <Text style={styles.paragrafo}>{data.contextoFamiliar || "—"}</Text>
          <Text style={styles.rotulo}>Contexto comunitário</Text>
          <Text style={styles.paragrafo}>{data.contextoComunitario || "—"}</Text>
          <Text style={styles.rotulo}>Fatores facilitadores</Text>
          <Text style={styles.paragrafo}>{data.fatoresFacilitadores || "—"}</Text>
          <Text style={styles.rotulo}>Barreiras identificadas</Text>
          <Text style={styles.paragrafo}>{data.barreirasIdentificadas || "—"}</Text>
        </Secao>

        <Secao titulo="5. Necessidades e apoios">
          <Text style={styles.rotulo}>Necessidades educacionais específicas</Text>
          <Text style={styles.paragrafo}>{data.necessidadesEspecificas || "—"}</Text>
          <Campo rotulo="Nível de apoio requerido" valor={NIVEL_APOIO_LABEL[data.nivelApoio] ?? "—"} />
          <Text style={styles.rotulo}>Áreas de apoio</Text>
          <Text style={styles.paragrafo}>
            {data.areasApoio.length > 0 ? data.areasApoio.join(", ") : "—"}
          </Text>
        </Secao>

        <Secao titulo="6. Análise integrada e elegibilidade">
          <Text style={styles.rotulo}>Análise integrada da equipe</Text>
          <Text style={styles.paragrafo}>{data.parecerEquipe || "—"}</Text>
          <Campo
            rotulo="Elegibilidade"
            valor={RECOMENDACAO_LABEL[data.recomendacaoElegibilidade] ?? "—"}
          />
          <Text style={styles.rotulo}>Justificativa</Text>
          <Text style={styles.paragrafo}>{data.justificativaElegibilidade || "—"}</Text>
          {tipo === "completo" && (
            <Campo
              rotulo="Encaminhamento recomendado"
              valor={encaminhamentoTexto(data.encaminhamentoRecomendado, data.escolaNomeOficial)}
            />
          )}
        </Secao>

        {data.orientacoesPai && (
          <Secao titulo="7. Orientações iniciais para o PAI">
            <Text style={styles.paragrafo}>{data.orientacoesPai}</Text>
          </Secao>
        )}

        <Secao titulo="Participantes da Avaliação">
          <View style={styles.tabelaHeader}>
            <Text style={[styles.tabelaCelula, { width: "45%", fontWeight: 700 }]}>Nome</Text>
            <Text style={[styles.tabelaCelula, { width: "35%", fontWeight: 700 }]}>Função</Text>
            <Text style={[styles.tabelaCelula, { width: "20%", fontWeight: 700 }]}>Data</Text>
          </View>
          {data.participantes.length === 0 ? (
            <Text style={styles.valor}>Nenhum participante registrado.</Text>
          ) : (
            data.participantes.map((participante, index) => (
              <View key={index} style={styles.tabelaLinha}>
                <Text style={[styles.tabelaCelula, { width: "45%" }]}>{participante.nome}</Text>
                <Text style={[styles.tabelaCelula, { width: "35%" }]}>{participante.funcao}</Text>
                <Text style={[styles.tabelaCelula, { width: "20%" }]}>{formatDate(data.dataConclusao)}</Text>
              </View>
            ))
          )}
        </Secao>

        {tipo === "completo" && (
          <Secao titulo="Contribuições complementares">
            {data.contribuicoes.length === 0 ? (
              <Text style={styles.valor}>Nenhuma contribuição registrada.</Text>
            ) : (
              data.contribuicoes.map((contribuicao, index) => (
                <View key={index} style={{ marginBottom: 8 }} wrap={false}>
                  <View style={styles.linha}>
                    <Campo rotulo="Profissional" valor={contribuicao.profissionalNome} />
                    <Campo
                      rotulo="Área"
                      valor={AREA_CONTRIBUICAO_LABEL[contribuicao.areaContribuicao] ?? contribuicao.areaContribuicao}
                    />
                  </View>
                  <Text style={styles.rotulo}>Observações</Text>
                  <Text style={styles.paragrafo}>{contribuicao.observacoes}</Text>
                  {contribuicao.implicacoesParticipacao && (
                    <>
                      <Text style={styles.rotulo}>Implicações para participação/aprendizagem</Text>
                      <Text style={styles.paragrafo}>{contribuicao.implicacoesParticipacao}</Text>
                    </>
                  )}
                  {contribuicao.recomendacoesEscolares && (
                    <>
                      <Text style={styles.rotulo}>Recomendações escolares</Text>
                      <Text style={styles.paragrafo}>{contribuicao.recomendacoesEscolares}</Text>
                    </>
                  )}
                </View>
              ))
            )}
          </Secao>
        )}

        <Text style={styles.rodape}>
          {previa
            ? `Prévia gerada pelo Pertency em ${formatDate(new Date().toISOString())} — não é o documento oficial.`
            : `Documento gerado pelo Pertency em ${formatDate(new Date().toISOString())}.`}
        </Text>
      </Page>
    </Document>
  );
}
