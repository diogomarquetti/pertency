/**
 * Bootstrap de dados de desenvolvimento — cria o mínimo necessário para
 * testar o módulo de Usuários de ponta a ponta neste ambiente: uma escola,
 * o vínculo do usuário admin de teste já existente em auth.users à tabela
 * `usuarios`, e alguns turnos/etapas/turmas de exemplo (Etapa/Turno/Turma
 * ainda não têm um módulo de cadastro próprio, então isso fica manual por
 * enquanto).
 *
 * Idempotente — pode rodar de novo sem duplicar nada.
 *
 * Uso: pnpm bootstrap:dev
 * (ou diretamente: pnpm exec tsx scripts/bootstrap-dev.ts)
 *
 * Não faz parte do build/deploy — é só para preparar o ambiente local/dev.
 */
process.loadEnvFile(".env.local");

import { createClient } from "@supabase/supabase-js";

// Não importa lib/supabase/admin.ts porque esse módulo tem `import "server-only"`
// no topo — pensado para barrar import acidental em Client Component dentro do
// build do Next, mas quebra ao rodar via tsx fora do bundler do Next. Aqui é um
// script standalone, então montamos o client admin direto (mesma config).
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY em .env.local",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const ADMIN_EMAIL = "admin@pertency.dev";
const ADMIN_NOME = "Administrador Pertency";
const ESCOLA_NOME = "Escola Piloto Pertency";

async function upsertReferencia(
  supabase: ReturnType<typeof createAdminClient>,
  tabela: "turnos" | "etapas_ciclos",
  escolaId: string,
  nome: string,
  extra: Record<string, unknown> = {},
): Promise<string> {
  const { data: existente } = await supabase
    .from(tabela)
    .select("id")
    .eq("escola_id", escolaId)
    .eq("nome", nome)
    .maybeSingle();

  if (existente) {
    console.log(`  • ${tabela} já existe: ${nome}`);
    return existente.id as string;
  }

  const { data, error } = await supabase
    .from(tabela)
    .insert({ escola_id: escolaId, nome, ...extra })
    .select("id")
    .single();

  if (error) throw error;
  console.log(`  ✓ ${tabela} criado: ${nome}`);
  return data.id as string;
}

async function main() {
  const supabase = createAdminClient();

  // 1. Escola (stub de tenancy — reaproveita se já existir alguma)
  console.log("Escola:");
  let { data: escola } = await supabase
    .from("escolas")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (!escola) {
    const { data, error } = await supabase
      .from("escolas")
      .insert({ nome_oficial: ESCOLA_NOME, status: "ativa" })
      .select("id")
      .single();
    if (error) throw error;
    escola = data;
    console.log(`  ✓ escola criada: ${ESCOLA_NOME}`);
  } else {
    console.log(`  • escola já existe (id: ${escola.id})`);
  }

  const escolaId = escola.id as string;

  // 2. Vincula o usuário de auth já existente (admin@pertency.dev) à tabela usuarios
  console.log("\nUsuário admin:");
  const { data: authList, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) throw authError;

  const authUser = authList.users.find((u) => u.email === ADMIN_EMAIL);
  if (!authUser) {
    throw new Error(
      `Nenhum usuário de auth encontrado com e-mail ${ADMIN_EMAIL}. Crie-o antes de rodar o bootstrap.`,
    );
  }

  const { error: usuarioError } = await supabase.from("usuarios").upsert(
    {
      id: authUser.id,
      escola_id: escolaId,
      nome_completo: ADMIN_NOME,
      email: ADMIN_EMAIL,
      funcao: "administrador",
      status: "ativo",
    },
    { onConflict: "id" },
  );
  if (usuarioError) throw usuarioError;
  console.log(`  ✓ usuarios vinculado (id: ${authUser.id})`);

  // 3. Turnos e etapas de exemplo
  console.log("\nTurnos:");
  const manhaId = await upsertReferencia(supabase, "turnos", escolaId, "Manhã");
  const tardeId = await upsertReferencia(supabase, "turnos", escolaId, "Tarde");

  console.log("\nEtapas/ciclos:");
  const infantilId = await upsertReferencia(
    supabase,
    "etapas_ciclos",
    escolaId,
    "Educação Infantil",
    { ordem: 1 },
  );
  const fundamentalId = await upsertReferencia(
    supabase,
    "etapas_ciclos",
    escolaId,
    "Ensino Fundamental I",
    { ordem: 2 },
  );

  // 4. Turmas de exemplo (cruzamento simples etapa × turno)
  console.log("\nTurmas:");
  const turmas = [
    { nome: "Infantil A - Manhã", etapaId: infantilId, turnoId: manhaId },
    { nome: "Fundamental I A - Tarde", etapaId: fundamentalId, turnoId: tardeId },
  ];

  for (const turma of turmas) {
    const { data: existente } = await supabase
      .from("turmas")
      .select("id")
      .eq("escola_id", escolaId)
      .eq("nome", turma.nome)
      .maybeSingle();

    if (existente) {
      console.log(`  • turma já existe: ${turma.nome}`);
      continue;
    }

    const { error } = await supabase.from("turmas").insert({
      escola_id: escolaId,
      etapa_ciclo_id: turma.etapaId,
      turno_id: turma.turnoId,
      nome: turma.nome,
      ano_letivo: new Date().getFullYear(),
      status: "ativa",
    });
    if (error) throw error;
    console.log(`  ✓ turma criada: ${turma.nome}`);
  }

  console.log("\nBootstrap concluído.");
}

main().catch((error) => {
  console.error("\nErro no bootstrap:", error);
  process.exit(1);
});
