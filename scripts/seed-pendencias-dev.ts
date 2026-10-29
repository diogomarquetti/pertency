/**
 * Seed de desenvolvimento da homepage de pendências (Início) — monta a
 * "Escola Especializada Caminhos" do protótipo (docs/prototipos/
 * pertency-inicio.html), com um usuário por perfil do catálogo, para testar
 * cada tipo de pendência com o P.O. Cresce a cada passo do plano
 * (docs/requisitos/inicio-pendencias.md): escola, referências (ano letivo,
 * turnos, organizações), usuários (um ainda sem primeiro acesso), os
 * estudantes em ingresso, a turma
 * EF 2º Ciclo A com estudantes Ativos e o professor, 3 turmas com
 * organização descontinuada e exemplos de notificação do sino.
 *
 * As datas são relativas ao dia em que o seed roda. Estudante que já existe
 * não é recriado — para "zerar o relógio", rode --reset e depois o seed.
 *
 * É uma escola própria, separada das demais: como toda a RLS é escopada por
 * escola, nada daqui aparece para usuários de outra escola.
 *
 * Idempotente — rodar de novo não duplica nada nem troca a senha de usuário
 * que já exista.
 *
 * Uso:
 *   pnpm seed:pendencias            cria/atualiza
 *   pnpm seed:pendencias --reset    apaga tudo o que o seed criou
 *
 * Exige no .env.local (o script recusa rodar sem eles):
 *   PERTENCY_ALLOW_SEED=1
 *   SUPABASE_DEV_PROJECT_REF=<ref do projeto de dev>  — precisa bater com NEXT_PUBLIC_SUPABASE_URL
 *   SEED_DEV_PASSWORD=<senha dos usuários de teste, mín. 8 caracteres>
 *   SUPABASE_SERVICE_ROLE_KEY
 */
process.loadEnvFile(".env.local");

import { createClient } from "@supabase/supabase-js";

import { ORGANIZACOES_CONFIG } from "../lib/ofertas-config";

const ESCOLA_NOME = "Escola Especializada Caminhos";

const USUARIOS = [
  { email: "rafael.moura@caminhos.pertency.test", nome: "Rafael Moura", funcao: "administrador" },
  { email: "marta.ribeiro@caminhos.pertency.test", nome: "Marta Ribeiro", funcao: "direcao" },
  { email: "joana.lima@caminhos.pertency.test", nome: "Joana Lima", funcao: "secretaria" },
  { email: "carla.souza@caminhos.pertency.test", nome: "Carla Souza", funcao: "coordenacao_pedagogica" },
  { email: "paulo.mendes@caminhos.pertency.test", nome: "Paulo Mendes", funcao: "professor_regente" },
  {
    email: "beatriz.nunes@caminhos.pertency.test",
    nome: "Beatriz Nunes",
    funcao: "profissional_complementar",
    area_atuacao: "fonoaudiologia",
  },
  // Convidado há 10 dias e nunca definiu a senha — caso de
  // usuario_sem_primeiro_acesso. Não recebe a senha de teste.
  {
    email: "renata.costa@caminhos.pertency.test",
    nome: "Renata Costa",
    funcao: "professor_arte",
    convidadoHaDias: 10,
  },
] as const;

// Organizações que deixaram de existir na configuração central (sem
// `codigo`) — base do tipo turma_organizacao_legada.
const ORGANIZACOES_DESCONTINUADAS = [
  { slug: "ef", nome: "1º Ciclo", ordem: 90 },
  { slug: "ei", nome: "Educação Infantil", ordem: 91 },
  { slug: "eja", nome: "Fase I", ordem: 92 },
];

function abortar(mensagem: string): never {
  console.error(`✗ ${mensagem}`);
  process.exit(1);
}

/**
 * Trava contra produção: só roda com permissão explícita e contra o projeto
 * Supabase declarado como de desenvolvimento (ou um Supabase local).
 */
function checarAmbiente() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const devRef = process.env.SUPABASE_DEV_PROJECT_REF;
  const senha = process.env.SEED_DEV_PASSWORD;

  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    abortar("Ambiente de produção — o seed não roda aqui.");
  }
  if (process.env.PERTENCY_ALLOW_SEED !== "1") {
    abortar("Defina PERTENCY_ALLOW_SEED=1 no .env.local para permitir o seed.");
  }
  if (!url || !serviceRoleKey || !anonKey) {
    abortar("Faltam NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY ou SUPABASE_SERVICE_ROLE_KEY em .env.local.");
  }
  if (!devRef) {
    abortar("Defina SUPABASE_DEV_PROJECT_REF com o ref do projeto Supabase de desenvolvimento.");
  }

  const host = new URL(url).hostname;
  const local = host === "localhost" || host === "127.0.0.1";
  if (!local && host !== `${devRef}.supabase.co`) {
    abortar(`NEXT_PUBLIC_SUPABASE_URL (${host}) não é o projeto de dev declarado (${devRef}).`);
  }
  if (!senha || senha.length < 8) {
    abortar("Defina SEED_DEV_PASSWORD (mín. 8 caracteres) no .env.local.");
  }

  return { url, serviceRoleKey, anonKey, senha };
}

function criarAdminClient(url: string, serviceRoleKey: string) {
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

type AdminClient = ReturnType<typeof criarAdminClient>;

async function buscarEscola(supabase: AdminClient) {
  const { data, error } = await supabase
    .from("escolas")
    .select("id")
    .eq("nome_oficial", ESCOLA_NOME)
    .maybeSingle();
  if (error) throw error;
  return (data?.id as string | undefined) ?? null;
}

async function garantirEscola(supabase: AdminClient) {
  const existente = await buscarEscola(supabase);
  if (existente) {
    console.log(`  • escola já existe (id: ${existente})`);
    return existente;
  }

  // Sem telefone institucional e sem coordenador(a), e sem mantenedora — a
  // escola continua utilizável enquanto a equipe Pertency completa o cadastro.
  const { data, error } = await supabase
    .from("escolas")
    .insert({
      nome_oficial: ESCOLA_NOME,
      nome_usual: "Caminhos",
      status: "ativa",
      nre_referencia: "NRE Curitiba",
      logradouro: "Rua das Araucárias",
      numero: "250",
      bairro: "Centro",
      cep: "80010-000",
      municipio: "Curitiba",
      uf: "PR",
      email_institucional: "secretaria@caminhos.pertency.test",
      diretor_nome: "Marta Ribeiro",
      diretor_fone: "(41) 99999-0001",
      diretor_email: "marta.ribeiro@caminhos.pertency.test",
    })
    .select("id")
    .single();
  if (error) throw error;
  console.log(`  ✓ escola criada (id: ${data.id})`);
  return data.id as string;
}

async function garantirLinha(
  supabase: AdminClient,
  tabela: string,
  filtro: Record<string, unknown>,
  valores: Record<string, unknown>,
  rotulo: string,
) {
  let consulta = supabase.from(tabela).select("id");
  for (const [coluna, valor] of Object.entries(filtro)) consulta = consulta.eq(coluna, valor);
  const { data: existente, error: erroBusca } = await consulta.maybeSingle();
  if (erroBusca) throw erroBusca;
  if (existente) {
    console.log(`  • ${rotulo}`);
    return existente.id as string;
  }

  const { data, error } = await supabase
    .from(tabela)
    .insert({ ...filtro, ...valores })
    .select("id")
    .single();
  if (error) throw error;
  console.log(`  ✓ ${rotulo}`);
  return data.id as string;
}

type Referencias = {
  anoLetivoId: string;
  turnos: Record<string, string>;
  ofertas: Record<string, string>;
  /** Por `codigo` (organizações atuais) ou por nome (descontinuadas). */
  organizacoes: Record<string, string>;
};

async function garantirReferencias(supabase: AdminClient, escolaId: string): Promise<Referencias> {
  console.log("\nAno letivo, turnos e organizações:");
  const anoLetivoId = await garantirLinha(
    supabase,
    "anos_letivos",
    { escola_id: escolaId, ano: 2026 },
    { status: "ativo" },
    "ano letivo 2026",
  );
  const turnos: Record<string, string> = {};
  for (const turno of ["Manhã", "Tarde"]) {
    turnos[turno] = await garantirLinha(supabase, "turnos", { escola_id: escolaId, nome: turno }, {}, `turno ${turno}`);
  }

  const { data: ofertasRows, error } = await supabase.from("ofertas").select("id, slug");
  if (error) throw error;
  const ofertas: Record<string, string> = Object.fromEntries(
    ofertasRows.map((oferta) => [oferta.slug as string, oferta.id as string]),
  );
  const ofertaId = (slug: string) => {
    if (!ofertas[slug]) throw new Error(`Oferta "${slug}" não encontrada.`);
    return ofertas[slug];
  };

  const organizacoes: Record<string, string> = {};
  for (const [index, organizacao] of ORGANIZACOES_CONFIG.entries()) {
    organizacoes[organizacao.codigo] = await garantirLinha(
      supabase,
      "etapas_ciclos",
      { escola_id: escolaId, codigo: organizacao.codigo },
      { oferta_id: ofertaId(organizacao.ofertaSlug), nome: organizacao.nome, ordem: index + 1 },
      `organização ${organizacao.nome}`,
    );
  }
  for (const organizacao of ORGANIZACOES_DESCONTINUADAS) {
    organizacoes[organizacao.nome] = await garantirLinha(
      supabase,
      "etapas_ciclos",
      { escola_id: escolaId, nome: organizacao.nome, oferta_id: ofertaId(organizacao.slug) },
      { ordem: organizacao.ordem },
      `organização descontinuada ${organizacao.nome}`,
    );
  }

  return { anoLetivoId, turnos, ofertas, organizacoes };
}

async function listarAuthUsers(supabase: AdminClient) {
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  return data.users;
}

async function garantirUsuarios(supabase: AdminClient, escolaId: string, senha: string) {
  console.log("\nUsuários:");
  const authUsers = await listarAuthUsers(supabase);
  const ids = new Map<string, string>();

  for (const usuario of USUARIOS) {
    const convidado = "convidadoHaDias" in usuario;
    let authId = authUsers.find((u) => u.email === usuario.email)?.id;
    const novo = !authId;

    if (!authId) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: usuario.email,
        ...(!convidado && { password: senha }),
        email_confirm: true,
      });
      if (error) throw error;
      authId = data.user.id;
    }

    const { error } = await supabase.from("usuarios").upsert(
      {
        id: authId,
        escola_id: escolaId,
        nome_completo: usuario.nome,
        email: usuario.email,
        funcao: usuario.funcao,
        status: "ativo",
        senha_definida: !convidado,
        area_atuacao: "area_atuacao" in usuario ? usuario.area_atuacao : null,
        // Só na criação, para não "zerar o relógio" a cada execução.
        ...(convidado && novo && { created_at: diasAtras(usuario.convidadoHaDias) }),
      },
      { onConflict: "id" },
    );
    if (error) throw error;
    ids.set(usuario.email, authId);
    console.log(`  ✓ ${usuario.nome} (${usuario.funcao}) — ${usuario.email}`);
  }

  return ids;
}

const EMAIL_PEDAGOGA = "carla.souza@caminhos.pertency.test";
const EMAIL_FONO = "beatriz.nunes@caminhos.pertency.test";

/** Timestamp de N dias atrás (ao meio-dia, longe da virada de data no fuso). */
function diasAtras(dias: number) {
  const data = new Date();
  data.setUTCDate(data.getUTCDate() - dias);
  data.setUTCHours(15, 0, 0, 0);
  return data.toISOString();
}

function dataDiasAtras(dias: number) {
  return diasAtras(dias).slice(0, 10);
}

/** Dados pessoais completos (o formulário não salva estudante incompleto). */
function dadosPessoaisBase(escolaId: string, nome: string, nascimento: string) {
  return {
    escola_id: escolaId,
    nome_completo: nome,
    data_nascimento: nascimento,
    sexo: "nao_informado",
    cor_raca: "parda",
    nacionalidade: "Brasileira",
    naturalidade: "Curitiba/PR",
    tipo_documento_identificacao: "certidao_nascimento",
    numero_documento: "000000 01 55 2018 1 00001 001 0000001-00",
    endereco_logradouro: "Rua das Flores",
    endereco_numero: "100",
    endereco_bairro: "Centro",
    endereco_cep: "80010-000",
    endereco_municipio: "Curitiba",
    endereco_uf: "PR",
    responsavel_principal_nome: `Responsável de ${nome.split(" ")[0]}`,
    responsavel_principal_parentesco: "Mãe",
    responsavel_principal_telefone: "(41) 98888-0000",
    contato_emergencia_nome: "Avó materna",
    contato_emergencia_telefone: "(41) 97777-0000",
  };
}

type CasoIngresso = {
  nome: string;
  nascimento: string;
  cadastradoHaDias: number;
  /** Comentário do caso — só para leitura do script. */
  pendencia: string;
  avaliacao?:
    | { status: "em_andamento"; inicioHaDias: number; fonoContribuiuHaDias?: number }
    | { status: "concluida"; recomendacao: "elegivel" | "nao_elegivel" };
};

const CASOS_INGRESSO: CasoIngresso[] = [
  { nome: "Miguel Santos", nascimento: "2018-03-12", cadastradoHaDias: 0, pendencia: "avaliacao_nao_iniciada (normal)" },
  { nome: "Helena Costa", nascimento: "2019-07-02", cadastradoHaDias: 5, pendencia: "avaliacao_nao_iniciada (atenção)" },
  {
    nome: "Luiza Ferreira",
    nascimento: "2017-11-20",
    cadastradoHaDias: 18,
    pendencia: "avaliacao_parada (atrasada)",
    avaliacao: { status: "em_andamento", inicioHaDias: 14 },
  },
  {
    nome: "Sofia Martins",
    nascimento: "2018-05-08",
    cadastradoHaDias: 9,
    pendencia: "contribuicao_pendente (Beatriz resolve, Carla acompanha)",
    avaliacao: { status: "em_andamento", inicioHaDias: 4 },
  },
  {
    nome: "Gabriel Pereira",
    nascimento: "2016-09-30",
    cadastradoHaDias: 12,
    pendencia: "parecer_pendente",
    avaliacao: { status: "em_andamento", inicioHaDias: 6, fonoContribuiuHaDias: 2 },
  },
  {
    nome: "Ana Beatriz Rocha",
    nascimento: "2017-01-15",
    cadastradoHaDias: 25,
    pendencia: "matricula_pendente",
    avaliacao: { status: "concluida", recomendacao: "elegivel" },
  },
  {
    nome: "Davi Oliveira",
    nascimento: "2016-06-21",
    cadastradoHaDias: 22,
    pendencia: "matricula_pendente",
    avaliacao: { status: "concluida", recomendacao: "elegivel" },
  },
];

/**
 * Estudantes em ingresso. Avaliação concluída precisa ser gravada por um
 * perfil que conclui (trigger trg_avaliacoes_ingresso_imutavel checa
 * pode_concluir_avaliacao(), que a service role não satisfaz) — então essas
 * entram logadas como a Pedagoga, e `concluida_em` fica com a data de hoje
 * (o trigger não deixa retroagir). Por isso matricula_pendente nasce
 * "Atenção" e só vira "Atrasada" depois do prazo real.
 */
async function garantirIngresso(
  supabase: AdminClient,
  escolaId: string,
  usuarios: Map<string, string>,
  pedagoga: AdminClient,
) {
  console.log("\nEstudantes em ingresso:");
  const pedagogaId = usuarios.get(EMAIL_PEDAGOGA)!;
  const fonoId = usuarios.get(EMAIL_FONO)!;

  for (const caso of CASOS_INGRESSO) {
    const { data: existente, error: erroBusca } = await supabase
      .from("estudantes")
      .select("id")
      .eq("escola_id", escolaId)
      .eq("nome_completo", caso.nome)
      .maybeSingle();
    if (erroBusca) throw erroBusca;
    if (existente) {
      console.log(`  • ${caso.nome} já existe`);
      continue;
    }

    const { data: estudante, error } = await supabase
      .from("estudantes")
      .insert({
        ...dadosPessoaisBase(escolaId, caso.nome, caso.nascimento),
        situacao: "em_analise_de_ingresso",
        created_by: pedagogaId,
        created_at: diasAtras(caso.cadastradoHaDias),
      })
      .select("id")
      .single();
    if (error) throw error;

    const base = {
      estudante_id: estudante.id,
      escola_id: escolaId,
      versao: 1,
      equipe_responsavel_ids: [pedagogaId, fonoId],
      created_by: pedagogaId,
    };

    if (caso.avaliacao?.status === "em_andamento") {
      const { data: avaliacao, error: erroAvaliacao } = await supabase
        .from("avaliacoes_ingresso")
        .insert({
          ...base,
          status_avaliacao: "em_andamento",
          data_inicio: dataDiasAtras(caso.avaliacao.inicioHaDias),
          created_at: diasAtras(caso.avaliacao.inicioHaDias),
        })
        .select("id")
        .single();
      if (erroAvaliacao) throw erroAvaliacao;

      if (caso.avaliacao.fonoContribuiuHaDias !== undefined) {
        const { error: erroContribuicao } = await supabase.from("avaliacao_contribuicoes").insert({
          avaliacao_id: avaliacao.id,
          escola_id: escolaId,
          profissional_id: fonoId,
          area_contribuicao: "fonoaudiologia",
          observacoes: "Comunicação oral funcional com apoio de pistas visuais.",
          created_by: fonoId,
          created_at: diasAtras(caso.avaliacao.fonoContribuiuHaDias),
        });
        if (erroContribuicao) throw erroContribuicao;
      }
    } else if (caso.avaliacao?.status === "concluida") {
      const { error: erroAvaliacao } = await pedagoga.from("avaliacoes_ingresso").insert({
        ...base,
        status_avaliacao: "concluida",
        data_inicio: dataDiasAtras(caso.cadastradoHaDias - 2),
        data_termino: dataDiasAtras(0),
        parecer_equipe: "Equipe recomenda o ingresso com apoio intermitente.",
        recomendacao_elegibilidade: caso.avaliacao.recomendacao,
        justificativa_elegibilidade: "Perfil compatível com o atendimento da escola especializada.",
      });
      if (erroAvaliacao) throw erroAvaliacao;
      if (caso.avaliacao.recomendacao === "nao_elegivel") {
        await supabase.from("estudantes").update({ situacao: "nao_elegivel" }).eq("id", estudante.id);
      }
    }

    console.log(`  ✓ ${caso.nome} — ${caso.pendencia}`);
  }
}

// Tipos fixos do checklist (DOCUMENTO_TIPOS_FIXOS). Cada estudante Ativo
// recebe todos como entregues, menos os de `faltam`.
const TIPOS_DOCUMENTO_FIXOS = [
  "documento_identificacao",
  "cpf",
  "comprovante_endereco",
  "carteira_vacinacao",
  "cartao_sus",
  "rg_cpf_responsavel_principal",
  "rg_cpf_segundo_responsavel",
  "autorizacao_imagem",
  "vida_escolar_anterior",
  "laudo",
  "relatorio_anterior",
];

type CasoAtivo = {
  nome: string;
  nascimento: string;
  matriculadoHaDias: number;
  formaOrigem: "primeira_matricula" | "transferencia_municipal";
  faltam: string[];
  pendencia: string;
  /** Campos de perfil_funcional_estudante — alertas do painel "Sua turma". */
  rotina?: Record<string, unknown>;
};

// Cenário do protótipo: "Comprovante de endereço (2), carteira de
// vacinação (1) e histórico escolar (1)" — 4 estudantes; o 5º está em dia.
const CASOS_ATIVOS: CasoAtivo[] = [
  {
    nome: "João Pedro Alves",
    nascimento: "2015-04-10",
    matriculadoHaDias: 18,
    formaOrigem: "primeira_matricula",
    faltam: ["comprovante_endereco"],
    pendencia: "documentos_pendentes (mais antigo)",
    rotina: {
      meio_comunicacao: "caa",
      recursos_caa: ["Prancha"],
      o_que_ajuda: "Antecipe as mudanças de atividade com a prancha de rotina.",
    },
  },
  {
    nome: "Valentina Dias",
    nascimento: "2016-08-03",
    matriculadoHaDias: 12,
    formaOrigem: "primeira_matricula",
    faltam: ["comprovante_endereco"],
    pendencia: "documentos_pendentes",
    rotina: { alergias_restricoes: "Alergia a amendoim. Confira os ingredientes do lanche coletivo." },
  },
  {
    nome: "Bernardo Lopes",
    nascimento: "2015-12-19",
    matriculadoHaDias: 9,
    formaOrigem: "primeira_matricula",
    faltam: ["carteira_vacinacao"],
    pendencia: "documentos_pendentes",
    rotina: {
      apoio_locomocao: true,
      seguranca_cuidados: "Precisa de apoio para locomoção entre salas e no intervalo.",
    },
  },
  {
    nome: "Pedro Henrique Silva",
    nascimento: "2014-02-27",
    matriculadoHaDias: 6,
    formaOrigem: "transferencia_municipal",
    faltam: ["vida_escolar_anterior"],
    pendencia: "documentos_pendentes",
    rotina: {
      situacoes_atencao: "Fica desconfortável com ruído alto.",
      o_que_ajuda: "Ofereça o abafador no intervalo e na Educação Física.",
    },
  },
  {
    nome: "Lucas Almeida",
    nascimento: "2015-10-05",
    matriculadoHaDias: 40,
    formaOrigem: "primeira_matricula",
    faltam: [],
    pendencia: "nenhuma (documentos em dia)",
  },
];

const TURMA_EF = "EF 2º Ciclo A · Tarde";

async function garantirTurmaEf(supabase: AdminClient, escolaId: string, refs: Referencias) {
  const { data: matriz, error } = await supabase
    .from("matrizes_curriculares")
    .select("id")
    .eq("ciclo", 2)
    .single();
  if (error) throw error;

  return garantirLinha(
    supabase,
    "turmas",
    { escola_id: escolaId, nome: TURMA_EF },
    {
      ano_letivo_id: refs.anoLetivoId,
      oferta_sere: "6053",
      oferta_id: refs.ofertas.ef,
      etapa_ciclo_id: refs.organizacoes.ef_ciclo_continuo,
      matriz_curricular_id: matriz.id,
      turno_id: refs.turnos.Tarde,
      ciclo: 2,
      etapas: [3, 4],
      capacidade: 12,
      data_inicio: "2026-02-02",
      forma_funcionamento: "diaria",
      status: "ativa",
      // Passou do prazo de componente_sem_professor (5 dias).
      created_at: diasAtras(8),
    },
    `turma ${TURMA_EF}`,
  );
}

// Turmas ainda presas às organizações descontinuadas (ver
// ORGANIZACOES_DESCONTINUADAS) — base de turma_organizacao_legada.
const TURMAS_LEGADAS = [
  { nome: "EF 1º Ciclo · Manhã", oferta: "ef", organizacao: "1º Ciclo", matriz: "Matriz EF — 1º Ciclo", turno: "Manhã", ciclo: 1 },
  { nome: "Pré-Escolar · Tarde", oferta: "ei", organizacao: "Educação Infantil", matriz: "Matriz EI — Pré-Escolar", turno: "Tarde" },
  { nome: "EJA Fase I · Manhã", oferta: "eja", organizacao: "Fase I", matriz: "Matriz EJA — Fase I", turno: "Manhã" },
] as const;

async function garantirTurmasLegadas(supabase: AdminClient, escolaId: string, refs: Referencias) {
  const { data: matrizes, error } = await supabase.from("matrizes_curriculares").select("id, nome");
  if (error) throw error;

  for (const turma of TURMAS_LEGADAS) {
    const matriz = matrizes.find((m) => m.nome === turma.matriz);
    if (!matriz) throw new Error(`Matriz "${turma.matriz}" não encontrada.`);

    await garantirLinha(
      supabase,
      "turmas",
      { escola_id: escolaId, nome: turma.nome },
      {
        ano_letivo_id: refs.anoLetivoId,
        oferta_id: refs.ofertas[turma.oferta],
        etapa_ciclo_id: refs.organizacoes[turma.organizacao],
        matriz_curricular_id: matriz.id,
        turno_id: refs.turnos[turma.turno],
        ...("ciclo" in turma && { ciclo: turma.ciclo, etapas: [1, 2] }),
        capacidade: 10,
        data_inicio: "2026-02-02",
        forma_funcionamento: "diaria",
        status: "ativa",
        created_at: diasAtras(120),
      },
      `turma ${turma.nome} (organização descontinuada)`,
    );
  }
}

/**
 * Prof. Paulo (regente) na EF 2º Ciclo A com todos os componentes da matriz,
 * menos Arte e Educação Física — caso de componente_sem_professor. Também
 * é a turma do painel "Sua turma" do professor.
 */
async function garantirVinculoProfessor(
  supabase: AdminClient,
  turmaId: string,
  usuarios: Map<string, string>,
) {
  const professorId = usuarios.get("paulo.mendes@caminhos.pertency.test")!;
  const adminId = usuarios.get("rafael.moura@caminhos.pertency.test")!;

  const { data: existente, error: erroBusca } = await supabase
    .from("usuario_turmas")
    .select("id")
    .eq("usuario_id", professorId)
    .eq("turma_id", turmaId)
    .maybeSingle();
  if (erroBusca) throw erroBusca;
  if (existente) {
    console.log("  • vínculo do Prof. Paulo já existe");
    return;
  }

  const { data: turma, error: erroTurma } = await supabase
    .from("turmas")
    .select("matriz_curricular_id")
    .eq("id", turmaId)
    .single();
  if (erroTurma) throw erroTurma;
  const { data: componentes, error: erroComponentes } = await supabase
    .from("matriz_componentes")
    .select("componente_id, componentes_curriculares(nome)")
    .eq("matriz_id", turma.matriz_curricular_id);
  if (erroComponentes) throw erroComponentes;

  const { data: vinculo, error } = await supabase
    .from("usuario_turmas")
    .insert({ usuario_id: professorId, turma_id: turmaId, status: "ativo", created_by: adminId })
    .select("id")
    .single();
  if (error) throw error;

  const SEM_PROFESSOR = new Set(["Arte", "Educação Física"]);
  const { error: erroVinculo } = await supabase.from("usuario_turma_componentes").insert(
    componentes
      .filter((c) => !SEM_PROFESSOR.has((c.componentes_curriculares as unknown as { nome: string }).nome))
      .map((c) => ({ usuario_turma_id: vinculo.id, componente_id: c.componente_id })),
  );
  if (erroVinculo) throw erroVinculo;
  console.log("  ✓ Prof. Paulo vinculado (sem Arte e Educação Física) — componente_sem_professor");
}

/**
 * Estudantes já Ativos na turma EF 2º Ciclo A, com o checklist de documentos
 * quase completo — base de documentos_pendentes (e, nos próximos passos, de
 * Ocupação e Sua turma).
 */
async function garantirAtivos(
  supabase: AdminClient,
  escolaId: string,
  refs: Referencias,
  usuarios: Map<string, string>,
) {
  console.log("\nTurmas e estudantes ativos:");
  const turmaId = await garantirTurmaEf(supabase, escolaId, refs);
  await garantirTurmasLegadas(supabase, escolaId, refs);
  await garantirVinculoProfessor(supabase, turmaId, usuarios);
  const secretariaId = usuarios.get("joana.lima@caminhos.pertency.test")!;

  for (const [index, caso] of CASOS_ATIVOS.entries()) {
    const { data: existente, error: erroBusca } = await supabase
      .from("estudantes")
      .select("id")
      .eq("escola_id", escolaId)
      .eq("nome_completo", caso.nome)
      .maybeSingle();
    if (erroBusca) throw erroBusca;
    if (existente) {
      console.log(`  • ${caso.nome} já existe`);
      continue;
    }

    const matriculaEm = dataDiasAtras(caso.matriculadoHaDias);
    const { data: estudante, error } = await supabase
      .from("estudantes")
      .insert({
        ...dadosPessoaisBase(escolaId, caso.nome, caso.nascimento),
        situacao: "ativo",
        created_by: secretariaId,
        created_at: diasAtras(caso.matriculadoHaDias + 30),
      })
      .select("id")
      .single();
    if (error) throw error;

    const { error: erroDados } = await supabase.from("dados_escolares").insert({
      estudante_id: estudante.id,
      escola_id: escolaId,
      data_ingresso: matriculaEm,
      forma_ingresso: "avaliacao_ingresso",
      forma_origem: caso.formaOrigem,
      ...(caso.formaOrigem !== "primeira_matricula" && {
        rede_origem: "Municipal",
        escola_origem: "Escola Municipal Jardim das Américas",
      }),
      created_by: secretariaId,
    });
    if (erroDados) throw erroDados;

    const { error: erroVinculo } = await supabase.from("vinculos_escolares_anuais").insert({
      estudante_id: estudante.id,
      escola_id: escolaId,
      ano_letivo_id: refs.anoLetivoId,
      oferta_atual_id: refs.ofertas.ef,
      organizacao_atual_id: refs.organizacoes.ef_ciclo_continuo,
      turno_id: refs.turnos.Tarde,
      turma_id: turmaId,
      matricula_interna: `2026-${String(index + 1).padStart(4, "0")}`,
      utiliza_transporte: false,
      data_matricula_efetiva: matriculaEm,
      created_by: secretariaId,
    });
    if (erroVinculo) throw erroVinculo;

    // Os "não se aplica" automáticos (sem segundo responsável; primeira
    // matrícula) não precisam de linha — a regra os deduz na leitura.
    const entregues = TIPOS_DOCUMENTO_FIXOS.filter(
      (tipo) =>
        !caso.faltam.includes(tipo) &&
        tipo !== "rg_cpf_segundo_responsavel" &&
        !(caso.formaOrigem === "primeira_matricula" && (tipo === "vida_escolar_anterior" || tipo === "relatorio_anterior")),
    );
    const { error: erroDocs } = await supabase.from("documentos_estudante").insert(
      entregues.map((tipo) => ({
        estudante_id: estudante.id,
        escola_id: escolaId,
        tipo,
        status: "entregue",
        forma_entrega: "fisica",
        data_envio: matriculaEm,
        conferido_por: secretariaId,
        created_by: secretariaId,
      })),
    );
    if (erroDocs) throw erroDocs;

    console.log(`  ✓ ${caso.nome} — ${caso.pendencia}`);
  }

  // Alertas de rotina (Condição do estudante) — fora do laço acima para
  // valer também para estudante que já existia.
  for (const caso of CASOS_ATIVOS) {
    if (!caso.rotina) continue;
    const { data: estudante, error: erroBusca } = await supabase
      .from("estudantes")
      .select("id")
      .eq("escola_id", escolaId)
      .eq("nome_completo", caso.nome)
      .single();
    if (erroBusca) throw erroBusca;
    const { error } = await supabase
      .from("perfil_funcional_estudante")
      .upsert(
        { estudante_id: estudante.id, escola_id: escolaId, created_by: secretariaId, ...caso.rotina },
        { onConflict: "estudante_id" },
      );
    if (error) throw error;
  }
  console.log("  ✓ alertas de rotina de 4 estudantes — painel Sua turma");
}

/**
 * Exemplos do sino, um ou dois por perfil — gravados direto (service role),
 * no formato que os triggers da migration 20261028100000_notificacoes.sql
 * gravam. Só na primeira vez: depois disso, as notificações reais (geradas
 * pelos triggers ao usar o sistema) tomam o lugar. Administrador e Direção
 * ficam sem nada — caso do estado vazio.
 */
async function garantirNotificacoes(supabase: AdminClient, escolaId: string, usuarios: Map<string, string>) {
  console.log("\nNotificações:");
  const { count, error: erroContagem } = await supabase
    .from("notificacoes")
    .select("id", { count: "exact", head: true })
    .eq("escola_id", escolaId);
  if (erroContagem) throw erroContagem;
  if (count) {
    console.log(`  • ${count} já existem`);
    return;
  }

  const { data: estudantes, error } = await supabase
    .from("estudantes")
    .select("id, nome_completo, avaliacoes_ingresso(id, status_avaliacao, recomendacao_elegibilidade)")
    .eq("escola_id", escolaId);
  if (error) throw error;
  const estudante = (nome: string) => {
    const encontrado = estudantes.find((e) => e.nome_completo === nome);
    if (!encontrado) throw new Error(`Estudante do seed não encontrado: ${nome}`);
    return encontrado;
  };
  const avaliacao = (nome: string, status: string) => {
    const encontrada = estudante(nome).avaliacoes_ingresso.find((a) => a.status_avaliacao === status);
    if (!encontrada) throw new Error(`Avaliação ${status} não encontrada: ${nome}`);
    return encontrada;
  };
  const minutosAtras = (minutos: number) => new Date(Date.now() - minutos * 60_000).toISOString();

  const valentina = estudante("Valentina Dias");
  const bernardo = estudante("Bernardo Lopes");
  const sofia = avaliacao("Sofia Martins", "em_andamento");
  const gabriel = avaliacao("Gabriel Pereira", "em_andamento");
  const anaBeatriz = avaliacao("Ana Beatriz Rocha", "concluida");

  const { error: erroInsert } = await supabase.from("notificacoes").insert([
    {
      destinatario_id: usuarios.get("paulo.mendes@caminhos.pertency.test")!,
      tipo: "alerta_rotina_atualizado",
      entidade_id: valentina.id,
      dados: { estudante: valentina.nome_completo },
      destino: `/estudantes/${valentina.id}`,
      criada_em: minutosAtras(120),
    },
    {
      destinatario_id: usuarios.get("paulo.mendes@caminhos.pertency.test")!,
      tipo: "estudante_entrou_turma",
      entidade_id: bernardo.id,
      dados: { estudante: bernardo.nome_completo, turma: TURMA_EF },
      destino: `/estudantes/${bernardo.id}`,
      criada_em: minutosAtras(60 * 26),
      lida_em: minutosAtras(60 * 25),
    },
    {
      destinatario_id: usuarios.get(EMAIL_FONO)!,
      tipo: "incluido_equipe_avaliacao",
      entidade_id: sofia.id,
      dados: { estudante: "Sofia Martins" },
      destino: `/estudantes/${estudante("Sofia Martins").id}/editar?aba=avaliacao#contribuicoes`,
      criada_em: minutosAtras(180),
    },
    {
      destinatario_id: usuarios.get(EMAIL_PEDAGOGA)!,
      tipo: "contribuicao_registrada",
      entidade_id: gabriel.id,
      dados: { estudante: "Gabriel Pereira", profissional: "Beatriz Nunes" },
      destino: `/estudantes/${estudante("Gabriel Pereira").id}/editar?aba=avaliacao#contribuicoes`,
      criada_em: minutosAtras(30),
    },
    {
      destinatario_id: usuarios.get("joana.lima@caminhos.pertency.test")!,
      tipo: "avaliacao_concluida",
      entidade_id: anaBeatriz.id,
      dados: { estudante: "Ana Beatriz Rocha", elegibilidade: anaBeatriz.recomendacao_elegibilidade },
      destino:
        anaBeatriz.recomendacao_elegibilidade === "elegivel"
          ? `/estudantes/${estudante("Ana Beatriz Rocha").id}/editar?aba=dados-escolares`
          : `/estudantes/${estudante("Ana Beatriz Rocha").id}`,
      criada_em: minutosAtras(60 * 5),
    },
  ].map((notificacao) => ({ ...notificacao, escola_id: escolaId })));
  if (erroInsert) throw erroInsert;
  console.log("  ✓ 5 exemplos (Professor, Profissional complementar, Pedagoga e Secretaria)");
}

async function entrarComo(url: string, anonKey: string, email: string, senha: string) {
  const cliente = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await cliente.auth.signInWithPassword({ email, password: senha });
  if (error) {
    throw new Error(
      `Não foi possível entrar como ${email} (${error.message}). A senha precisa ser SEED_DEV_PASSWORD — usuário criado fora do seed não tem a senha trocada.`,
    );
  }
  return cliente;
}

// Tabelas apagadas no --reset, todas por escola_id. As de auditoria passam
// duas vezes: antes (podem segurar FK de linhas de dados) e depois (os
// triggers de auditoria de DELETE gravam linhas novas ao apagar os dados).
const TABELAS_AUDITORIA = [
  "avaliacao_contribuicoes_auditoria",
  "avaliacoes_ingresso_auditoria",
  "documentos_estudante_auditoria",
  "condicoes_estudante_auditoria",
  "perfil_funcional_estudante_auditoria",
  "vinculos_escolares_anuais_auditoria",
  "dados_escolares_auditoria",
  "estudantes_auditoria",
  "turmas_auditoria",
  "escolas_auditoria",
];
const TABELAS_DADOS = [
  "notificacoes",
  "avaliacao_relatorios",
  "avaliacao_contribuicoes",
  "avaliacoes_ingresso",
  "documentos_estudante_versoes",
  "documentos_estudante",
  "condicoes_estudante",
  "perfil_funcional_estudante",
  "vinculos_escolares_anuais",
  "dados_escolares",
  "estudante_autorizados_retirada",
  "estudantes",
  "turmas",
  "etapas_ciclos",
  "turnos",
  "anos_letivos",
];

async function resetar(supabase: AdminClient) {
  const escolaId = await buscarEscola(supabase);
  if (!escolaId) {
    console.log("Nada a apagar: a escola do seed não existe.");
    return;
  }

  console.log(`Apagando dados da escola do seed (id: ${escolaId})...`);
  // Ordem importa: filhos antes dos pais (nem todo FK tem on delete cascade).
  for (const tabela of [...TABELAS_AUDITORIA, ...TABELAS_DADOS, ...TABELAS_AUDITORIA]) {
    const { error } = await supabase.from(tabela).delete().eq("escola_id", escolaId);
    if (error) throw new Error(`${tabela}: ${error.message}`);
  }
  console.log("  ✓ dados, referências e auditoria");

  const { data: usuarios, error: erroUsuarios } = await supabase
    .from("usuarios")
    .select("id")
    .eq("escola_id", escolaId);
  if (erroUsuarios) throw erroUsuarios;
  const { error: erroDelete } = await supabase.from("usuarios").delete().eq("escola_id", escolaId);
  if (erroDelete) throw erroDelete;
  for (const { id } of usuarios ?? []) {
    const { error } = await supabase.auth.admin.deleteUser(id as string);
    if (error) throw error;
  }
  console.log(`  ✓ usuarios e auth.users (${usuarios?.length ?? 0})`);

  const { error } = await supabase.from("escolas").delete().eq("id", escolaId);
  if (error) throw error;
  console.log("  ✓ escola");
}

async function main() {
  const { url, serviceRoleKey, anonKey, senha } = checarAmbiente();
  const supabase = criarAdminClient(url, serviceRoleKey);

  if (process.argv.includes("--reset")) {
    await resetar(supabase);
    return;
  }

  console.log("Escola:");
  const escolaId = await garantirEscola(supabase);
  const refs = await garantirReferencias(supabase, escolaId);
  const usuarios = await garantirUsuarios(supabase, escolaId, senha);
  const pedagoga = await entrarComo(url, anonKey, EMAIL_PEDAGOGA, senha);
  await garantirIngresso(supabase, escolaId, usuarios, pedagoga);
  await garantirAtivos(supabase, escolaId, refs, usuarios);
  await garantirNotificacoes(supabase, escolaId, usuarios);

  console.log("\nPronto. Senha de todos os usuários: SEED_DEV_PASSWORD do .env.local.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
