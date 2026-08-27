import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com a service role key — ignora RLS por completo.
 *
 * Uso estritamente restrito a Server Actions/Route Handlers que precisam da
 * Admin API do Supabase Auth (ex: `auth.admin.createUser`), que não tem
 * equivalente respeitando RLS com a anon key. NUNCA usar para ler/escrever
 * nas tabelas do schema `public` — a maioria das operações de escrita já
 * funciona normalmente com o client autenticado (`lib/supabase/server.ts`),
 * já que as políticas de RLS permitem escrita para administradores dentro
 * da própria escola (ver docs/ARCHITECTURE.md § Banco de dados).
 *
 * O import "server-only" no topo do arquivo faz o build falhar se este
 * módulo for importado, direta ou indiretamente, por código de Client
 * Component.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY em .env.local",
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
