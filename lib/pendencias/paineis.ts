import { ENCAMINHAMENTO_OPTIONS } from "@/app/(app)/estudantes/avaliacao-schema";
import { montarAlertas, type Alerta } from "@/app/(app)/estudantes/perfil-funcional-alertas";
import { mapPerfilFuncional, PERFIL_FUNCIONAL_COLUNAS } from "@/app/(app)/estudantes/queries";
import { OFERTAS_SERE } from "@/lib/ofertas-config";
import { createClient } from "@/lib/supabase/server";

import { dataLocalISO, diasEntre, hojeISO } from "./datas";
import { getCadastroInstitucional } from "./fontes/configuracao";
import { getEstudantesEmIngresso } from "./fontes/ingresso";
import { getTurmasAtivas, listarNomes } from "./fontes/turmas";
import type { Perfil } from "./perfis";
import { OCUPACAO_ALERTA_PERCENTUAL } from "./prazos";
import { calcularSeveridade } from "./severidade";
import { avaliacaoParada } from "./tipos/avaliacao-parada";
import { matriculaPendente } from "./tipos/matricula-pendente";

/**
 * Dados da coluna lateral da homepage, por perfil. Leem as mesmas fontes em
 * cache dos tipos de pendência sempre que possível.
 */

export type PainelTipo = "fila" | "ocupacao" | "sua_turma" | "configuracao";

export const PAINEIS_POR_PERFIL: Record<Perfil, PainelTipo[]> = {
  administrador: ["configuracao"],
  direcao: ["fila", "ocupacao"],
  secretaria: ["fila"],
  pedagogo: ["fila"],
  professor: ["sua_turma"],
  profissional_complementar: [],
};

// ---------------------------------------------------------------------------
// Fila de ingresso

export type EstudanteNaFila = { id: string; nome: string; tempo: string; atrasado: boolean };
export type EtapaFila = { etapa: string; estudantes: EstudanteNaFila[] };
export type FilaIngresso = {
  etapas: EtapaFila[];
  total: number;
  naoElegiveisNoMes: { id: string; nome: string; encaminhamento: string | null }[];
};

const ENCAMINHAMENTO_LABEL: Record<string, string> = Object.fromEntries(
  ENCAMINHAMENTO_OPTIONS.map((option) => [option.value, option.label]),
);

function emDias(dias: number) {
  return dias === 0 ? "hoje" : `${dias} ${dias === 1 ? "dia" : "dias"}`;
}

// "Dados pessoais" (1ª etapa do brief) fica de fora: o formulário não salva
// estudante com Dados pessoais incompletos, então ninguém ficaria nela.
export async function getFilaIngresso(hoje = hojeISO()): Promise<FilaIngresso> {
  const supabase = await createClient();
  const inicioDoMes = `${hoje.slice(0, 7)}-01`;

  const [estudantes, naoElegiveis] = await Promise.all([
    getEstudantesEmIngresso(),
    supabase
      .from("avaliacoes_ingresso")
      .select("estudante_id, encaminhamento_recomendado, concluida_em, estudantes(nome_completo)")
      .eq("status_avaliacao", "concluida")
      .eq("recomendacao_elegibilidade", "nao_elegivel")
      .gte("concluida_em", inicioDoMes),
  ]);
  if (naoElegiveis.error) throw naoElegiveis.error;

  const avaliacao: EstudanteNaFila[] = [];
  const parecer: EstudanteNaFila[] = [];
  const matricula: EstudanteNaFila[] = [];

  for (const estudante of estudantes) {
    const { vigente, emEdicao } = estudante;

    if (vigente?.recomendacaoElegibilidade === "elegivel" && vigente.concluidaEm) {
      const dias = diasEntre(dataLocalISO(vigente.concluidaEm), hoje);
      matricula.push({
        id: estudante.id,
        nome: estudante.nome,
        tempo: emDias(dias),
        atrasado: calcularSeveridade(matriculaPendente, dias) === "atrasada",
      });
    } else if (emEdicao?.status === "em_andamento") {
      const aguardandoContribuicao = emEdicao.semContribuicao.length > 0;
      const desde = aguardandoContribuicao
        ? (emEdicao.dataInicio ?? emEdicao.createdAt)
        : (emEdicao.ultimaContribuicaoEm ?? emEdicao.dataInicio ?? emEdicao.createdAt);
      const dias = diasEntre(dataLocalISO(desde), hoje);
      (aguardandoContribuicao ? avaliacao : parecer).push({
        id: estudante.id,
        nome: estudante.nome,
        tempo: emDias(dias),
        // Mesmo critério de avaliacao_parada (conta do início da avaliação).
        atrasado:
          calcularSeveridade(avaliacaoParada, diasEntre(dataLocalISO(emEdicao.dataInicio ?? emEdicao.createdAt), hoje)) ===
          "atrasada",
      });
    } else if (!vigente) {
      avaliacao.push({ id: estudante.id, nome: estudante.nome, tempo: "não iniciada", atrasado: false });
    }
  }

  const etapas = [
    { etapa: "Avaliação de Ingresso", estudantes: avaliacao },
    { etapa: "Parecer", estudantes: parecer },
    { etapa: "Matrícula", estudantes: matricula },
  ];

  return {
    etapas,
    total: etapas.reduce((total, etapa) => total + etapa.estudantes.length, 0),
    naoElegiveisNoMes: (naoElegiveis.data ?? []).map((row) => ({
      id: row.estudante_id,
      nome: (row.estudantes as unknown as { nome_completo: string } | null)?.nome_completo ?? "",
      encaminhamento: row.encaminhamento_recomendado ? (ENCAMINHAMENTO_LABEL[row.encaminhamento_recomendado] ?? null) : null,
    })),
  };
}

// ---------------------------------------------------------------------------
// Ocupação das turmas

export type OcupacaoTurma = { id: string; nome: string; ocupados: number; capacidade: number | null; cheia: boolean };

type OcupacaoRow = { turma_id: string; nome: string; capacidade: number | null; ocupados: number };

// RPC: a Direção não lê vinculos_escolares_anuais (ver migration
// 20261027120000_inicio_rpcs.sql).
export async function getOcupacaoTurmas(): Promise<OcupacaoTurma[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("ocupacao_turmas");
  if (error) throw error;

  return ((data ?? []) as OcupacaoRow[]).map((turma) => ({
    id: turma.turma_id,
    nome: turma.nome,
    ocupados: turma.ocupados,
    capacidade: turma.capacidade,
    cheia: !!turma.capacidade && (turma.ocupados / turma.capacidade) * 100 >= OCUPACAO_ALERTA_PERCENTUAL,
  }));
}

// ---------------------------------------------------------------------------
// Sua turma (professor)

export type SeloAlerta = { rotulo: string; descricao: string; risco: "alto" | "medio" | "baixo" };
export type EstudanteComAlertas = { id: string; nome: string; selos: SeloAlerta[] };

// Painel lateral não comporta os textos de Condição do estudante (escritos
// para a ficha): só o tipo de cada alerta, na ordem de prioridade abaixo, e o
// texto completo fica no Perfil do Estudante. "O que ajuda" é orientação, não
// alerta — fica só na ficha.
const SELOS: Record<string, Omit<SeloAlerta, "descricao">> = {
  "Alergia/restrição": { rotulo: "Alergia", risco: "alto" },
  "Necessita medicação": { rotulo: "Medicação", risco: "alto" },
  "Segurança e cuidados": { rotulo: "Segurança", risco: "medio" },
  "Situação que exige atenção": { rotulo: "Atenção", risco: "medio" },
  "Comunicação alternativa": { rotulo: "Comunicação alternativa", risco: "baixo" },
};
const ORDEM_SELOS = Object.keys(SELOS);

function selosDosAlertas(alertas: Alerta[]): SeloAlerta[] {
  return alertas
    .filter((alerta) => alerta.titulo in SELOS)
    .sort((a, b) => ORDEM_SELOS.indexOf(a.titulo) - ORDEM_SELOS.indexOf(b.titulo))
    .map((alerta) => ({ ...SELOS[alerta.titulo], descricao: alerta.descricao }));
}
export type SuaTurma = {
  id: string;
  nome: string;
  organizacao: string;
  comAlertas: EstudanteComAlertas[];
  total: number;
};

type MeuEstudanteRow = { turma_id: string; estudante_id: string; estudante_nome: string };

export async function getSuasTurmas(usuarioId: string): Promise<SuaTurma[]> {
  const supabase = await createClient();

  const [vinculos, minhasTurmas] = await Promise.all([
    supabase.rpc("meus_estudantes_por_turma"),
    supabase
      .from("usuario_turmas")
      .select("turma_id, turmas(nome, status, etapas_ciclos(nome))")
      .eq("usuario_id", usuarioId)
      .eq("status", "ativo"),
  ]);
  if (vinculos.error) throw vinculos.error;
  if (minhasTurmas.error) throw minhasTurmas.error;

  const meusEstudantes = (vinculos.data ?? []) as MeuEstudanteRow[];
  const estudanteIds = [...new Set(meusEstudantes.map((row) => row.estudante_id))];
  const perfis = estudanteIds.length
    ? await supabase
        .from("perfil_funcional_estudante")
        .select(`estudante_id, ${PERFIL_FUNCIONAL_COLUNAS}`)
        .in("estudante_id", estudanteIds)
    : { data: [], error: null };
  if (perfis.error) throw perfis.error;

  const selosPorEstudante = new Map(
    (perfis.data ?? []).map((row) => [row.estudante_id, selosDosAlertas(montarAlertas(mapPerfilFuncional(row)))]),
  );

  return (minhasTurmas.data ?? []).flatMap((vinculo) => {
    const turma = vinculo.turmas as unknown as {
      nome: string;
      status: string;
      etapas_ciclos: { nome: string } | null;
    } | null;
    if (!turma || turma.status !== "ativa") return [];

    const estudantes = meusEstudantes.filter((row) => row.turma_id === vinculo.turma_id);
    return [
      {
        id: vinculo.turma_id,
        nome: turma.nome,
        organizacao: turma.etapas_ciclos?.nome ?? "",
        total: estudantes.length,
        // Quem tem alerta de risco alto (alergia, medicação) vem primeiro.
        comAlertas: estudantes
          .map((row) => ({
            id: row.estudante_id,
            nome: row.estudante_nome,
            selos: selosPorEstudante.get(row.estudante_id) ?? [],
          }))
          .filter((estudante) => estudante.selos.length > 0)
          .sort(
            (a, b) =>
              Number(b.selos[0].risco === "alto") - Number(a.selos[0].risco === "alto") ||
              a.nome.localeCompare(b.nome, "pt-BR"),
          ),
      },
    ];
  });
}

// ---------------------------------------------------------------------------
// Configuração da escola (Administrador)

export type ItemConfiguracao = { item: string; estado: string; ok: boolean; destino: string | null };

export async function getConfiguracaoEscola(): Promise<ItemConfiguracao[]> {
  const supabase = await createClient();

  const [{ escola, mantenedora }, turmas, usuarios] = await Promise.all([
    getCadastroInstitucional(),
    getTurmasAtivas(),
    supabase.from("usuarios").select("senha_definida").eq("status", "ativo"),
  ]);
  if (usuarios.error) throw usuarios.error;

  function estadoCadastro(faltando: string[]) {
    return faltando.length === 0
      ? "Completo"
      : `${faltando.length} ${faltando.length === 1 ? "informação faltando" : "informações faltando"}`;
  }

  const ofertasSemEstrutura = OFERTAS_SERE.filter((oferta) => !oferta.estruturaDefinida).map(
    (oferta) => oferta.codigo,
  );

  const aRevisar = turmas.filter((turma) => turma.organizacaoDescontinuada).length;
  const semAcesso = (usuarios.data ?? []).filter((usuario) => !usuario.senha_definida).length;
  const ativos = usuarios.data?.length ?? 0;

  return [
    {
      item: "Escola",
      estado: escola ? estadoCadastro(escola.faltando) : "Não encontrada",
      ok: !!escola && escola.faltando.length === 0,
      destino: "/minha-escola/escola",
    },
    {
      // Mantenedora é opcional: não cadastrada não é um problema.
      item: "Mantenedora",
      estado: mantenedora ? estadoCadastro(mantenedora.faltando) : "Não cadastrada",
      ok: !mantenedora || mantenedora.faltando.length === 0,
      destino: "/minha-escola/mantenedora",
    },
    {
      // Configuração central (lib/ofertas-config.ts), não editável pela
      // escola — só informa o que ainda depende do P.O.
      item: "Ofertas e códigos SERE",
      estado: ofertasSemEstrutura.length
        ? `${listarNomes(ofertasSemEstrutura)}: estrutura curricular aguardando P.O`
        : "Completo",
      ok: true,
      destino: null,
    },
    {
      item: "Turmas",
      estado: `${turmas.length} ${turmas.length === 1 ? "ativa" : "ativas"}${aRevisar ? ` · ${aRevisar} a revisar` : ""}`,
      ok: aRevisar === 0,
      destino: aRevisar ? "/turmas?pendencia=organizacao" : "/turmas",
    },
    {
      item: "Usuários",
      estado: `${ativos} ${ativos === 1 ? "ativo" : "ativos"}${semAcesso ? ` · ${semAcesso} sem primeiro acesso` : ""}`,
      ok: semAcesso === 0,
      destino: "/usuarios",
    },
  ];
}
