/**
 * Cria (ou reativa) um operador da plataforma — os donos do Pertency, que
 * usam o admin (admin.pertency.com.br). Não existe tela para isso: o admin
 * só abre para quem já é operador, então o primeiro precisa nascer aqui.
 *
 * Se o e-mail ainda não tem login, cria o usuário de auth (sem senha) e
 * imprime um link de acesso para definir a senha. Se já tem login e ele é
 * usuário de alguma escola, recusa — conta de operador e conta de escola não
 * se misturam (ver migration 20261029120000_operadores_plataforma.sql).
 *
 * Uso: pnpm bootstrap:operador <email> "<nome completo>" [--origin https://admin.pertency.com.br]
 * (sem --origin, o link aponta para http://localhost:3000)
 */
process.loadEnvFile(".env.local");

import { createClient } from "@supabase/supabase-js";

// Mesmo motivo de scripts/bootstrap-dev.ts: lib/supabase/admin.ts tem
// `import "server-only"`, que quebra fora do bundler do Next.
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

function lerArgumentos() {
  const args = process.argv.slice(2);
  const indiceOrigin = args.indexOf("--origin");
  const origin = indiceOrigin >= 0 ? args[indiceOrigin + 1] : "http://localhost:3000";
  const posicionais = args.filter((_, i) => i !== indiceOrigin && i !== indiceOrigin + 1);
  const [email, nome] = posicionais;

  if (!email || !nome || !origin) {
    console.error('Uso: pnpm bootstrap:operador <email> "<nome completo>" [--origin <url>]');
    process.exit(1);
  }

  return { email: email.trim().toLowerCase(), nome: nome.trim(), origin: origin.replace(/\/$/, "") };
}

async function buscarUsuarioAuth(supabase: ReturnType<typeof createAdminClient>, email: string) {
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const encontrado = data.users.find((user) => user.email?.toLowerCase() === email);
    if (encontrado) return encontrado;
    if (data.users.length < 200) return null;
  }
}

async function main() {
  const { email, nome, origin } = lerArgumentos();
  const supabase = createAdminClient();

  let userId: string;
  let criado = false;
  const existente = await buscarUsuarioAuth(supabase, email);

  if (existente) {
    const { data: usuarioEscola, error } = await supabase
      .from("usuarios")
      .select("id")
      .eq("id", existente.id)
      .maybeSingle();
    if (error) throw error;
    if (usuarioEscola) {
      console.error(
        `${email} já é usuário de uma escola. Use outro e-mail para a conta de operador.`,
      );
      process.exit(1);
    }
    userId = existente.id;
    console.log(`  • login já existe (id: ${userId})`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({ email, email_confirm: true });
    if (error || !data.user) throw error ?? new Error("Não foi possível criar o login.");
    userId = data.user.id;
    criado = true;
    console.log(`  ✓ login criado (id: ${userId})`);
  }

  const { error: upsertError } = await supabase
    .from("operadores_plataforma")
    .upsert({ id: userId, nome_completo: nome, ativo: true });
  if (upsertError) throw upsertError;
  console.log(`  ✓ operador ativo: ${nome}`);

  if (criado) {
    const { data, error } = await supabase.auth.admin.generateLink({ type: "recovery", email });
    if (error || !data.properties?.hashed_token) {
      throw error ?? new Error("Não foi possível gerar o link de acesso.");
    }
    console.log("\nLink para definir a senha (uso único):");
    console.log(`${origin}/auth/confirm?token_hash=${data.properties.hashed_token}&type=recovery`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
