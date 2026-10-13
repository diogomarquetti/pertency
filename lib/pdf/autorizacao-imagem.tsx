import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

// Termo padrão de autorização de uso de imagem — gerado em branco (só com os
// dados do estudante/escola preenchidos) pra ser impresso e assinado pelo
// responsável. A via assinada volta pro checklist por upload ou entrega
// física, como qualquer outro documento.

export type AutorizacaoImagemData = {
  escolaNomeOficial: string;
  escolaMunicipio: string;
  estudanteNome: string;
  dataNascimento: string | null;
  responsaveis: string[];
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

const styles = StyleSheet.create({
  page: { paddingVertical: 48, paddingHorizontal: 56, fontSize: 10.5, fontFamily: "Helvetica", color: "#1A1F26" },
  titulo: { fontSize: 14, fontWeight: 700, textAlign: "center", marginBottom: 4 },
  subtitulo: { fontSize: 10, color: "#5B6472", textAlign: "center", marginBottom: 24 },
  rotulo: { fontSize: 8.5, color: "#5B6472", marginBottom: 1 },
  valor: { fontSize: 10.5, marginBottom: 8 },
  paragrafo: { fontSize: 10.5, lineHeight: 1.55, marginBottom: 10, textAlign: "justify" },
  opcao: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  caixa: { width: 11, height: 11, borderWidth: 1, borderColor: "#1A1F26", marginRight: 8, marginTop: 1 },
  linhaAssinatura: { borderTopWidth: 1, borderTopColor: "#1A1F26", marginTop: 44, paddingTop: 4, fontSize: 9.5 },
  campoLinha: { flexDirection: "row", marginTop: 18, fontSize: 10 },
  preencher: { flex: 1, borderBottomWidth: 1, borderBottomColor: "#1A1F26", marginLeft: 4 },
});

export function AutorizacaoImagemPdf({ data }: { data: AutorizacaoImagemData }) {
  return (
    <Document title={`Autorização de uso de imagem — ${data.estudanteNome}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.titulo}>Termo de autorização de uso de imagem e voz</Text>
        <Text style={styles.subtitulo}>{data.escolaNomeOficial}</Text>

        <Text style={styles.rotulo}>Estudante</Text>
        <Text style={styles.valor}>
          {data.estudanteNome}
          {data.dataNascimento ? ` — nascido(a) em ${dateFormatter.format(new Date(`${data.dataNascimento}T12:00:00`))}` : ""}
        </Text>

        <Text style={styles.rotulo}>Responsável legal</Text>
        <Text style={styles.valor}>{data.responsaveis.join(" / ") || "—"}</Text>

        <Text style={[styles.paragrafo, { marginTop: 8 }]}>
          Eu, responsável legal pelo(a) estudante acima identificado(a), declaro estar ciente de que a{" "}
          {data.escolaNomeOficial} registra, em fotos e vídeos, atividades escolares, pedagógicas, culturais e
          esportivas das quais o(a) estudante participa.
        </Text>
        <Text style={styles.paragrafo}>
          A autorização abaixo vale para o uso dessas imagens e da voz do(a) estudante, sem finalidade comercial e
          sem qualquer remuneração, em materiais institucionais e pedagógicos, murais e exposições da escola,
          publicações impressas e canais digitais oficiais da escola e da rede de ensino. A escola se compromete a
          não usar as imagens de forma que exponha o(a) estudante a situação vexatória ou constrangedora, e a não
          divulgar, junto delas, informações de saúde ou outros dados pessoais sensíveis, nos termos do Estatuto
          da Criança e do Adolescente e da Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
        </Text>
        <Text style={styles.paragrafo}>
          Esta autorização vale durante o período em que o(a) estudante estiver matriculado(a) na escola e pode
          ser revogada a qualquer momento, por escrito, junto à secretaria escolar, sem prejuízo do uso já
          realizado até a data da revogação.
        </Text>

        <View style={[styles.opcao, { marginTop: 6 }]}>
          <View style={styles.caixa} />
          <Text>AUTORIZO o uso de imagem e voz do(a) estudante nas condições acima.</Text>
        </View>
        <View style={styles.opcao}>
          <View style={styles.caixa} />
          <Text>NÃO AUTORIZO o uso de imagem e voz do(a) estudante.</Text>
        </View>

        <View style={styles.campoLinha}>
          <Text>{data.escolaMunicipio || "Local"},</Text>
          <View style={styles.preencher} />
        </View>

        <Text style={styles.linhaAssinatura}>Assinatura do(a) responsável legal</Text>

        <View style={styles.campoLinha}>
          <Text>Nome legível:</Text>
          <View style={styles.preencher} />
        </View>
        <View style={styles.campoLinha}>
          <Text>CPF:</Text>
          <View style={styles.preencher} />
        </View>
      </Page>
    </Document>
  );
}
