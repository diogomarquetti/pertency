/**
 * Clients admin (service role) dos dois projetos da migração para São Paulo
 * — ver docs/migracao-sp.md.
 *
 * Credenciais em `.env.migracao` (não versionado, coberto por `.env*` no
 * .gitignore):
 *   ORIGEM_SUPABASE_URL / ORIGEM_SERVICE_ROLE_KEY   → projeto atual (us-west-2)
 *   DESTINO_SUPABASE_URL / DESTINO_SERVICE_ROLE_KEY → projeto novo (sa-east-1)
 *
 * Sem ORIGEM_*, a origem cai no projeto do `.env.local` — o que permite rodar
 * o inventário antes de o projeto novo existir.
 */
import { existsSync } from "node:fs";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

if (existsSync(".env.migracao")) process.loadEnvFile(".env.migracao");
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

function criar(url: string | undefined, chave: string | undefined, nome: string): SupabaseClient {
  if (!url || !chave) {
    throw new Error(`Faltam a URL ou a service role key do projeto de ${nome} (ver .env.migracao).`);
  }
  return createClient(url, chave, { auth: { autoRefreshToken: false, persistSession: false } });
}

export function urlOrigem() {
  return process.env.ORIGEM_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function urlDestino() {
  return process.env.DESTINO_SUPABASE_URL;
}

export function clienteOrigem() {
  return criar(
    urlOrigem(),
    process.env.ORIGEM_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
    "origem",
  );
}

export function clienteDestino() {
  const destino = criar(urlDestino(), process.env.DESTINO_SERVICE_ROLE_KEY, "destino");
  if (urlDestino() === urlOrigem()) {
    throw new Error("Origem e destino apontam para o mesmo projeto.");
  }
  return destino;
}

/** Todos os arquivos de um bucket, descendo pelas pastas. */
export async function listarArquivos(cliente: SupabaseClient, bucket: string, pasta = ""): Promise<
  { caminho: string; tamanho: number; contentType: string | undefined }[]
> {
  const arquivos: { caminho: string; tamanho: number; contentType: string | undefined }[] = [];
  const POR_PAGINA = 1000;

  for (let offset = 0; ; offset += POR_PAGINA) {
    const { data, error } = await cliente.storage.from(bucket).list(pasta, { limit: POR_PAGINA, offset });
    if (error) throw new Error(`Falha ao listar ${bucket}/${pasta}: ${error.message}`);

    for (const item of data) {
      const caminho = pasta ? `${pasta}/${item.name}` : item.name;
      // Pasta: o Storage devolve sem id nem metadata.
      if (item.id === null) {
        arquivos.push(...(await listarArquivos(cliente, bucket, caminho)));
      } else {
        arquivos.push({
          caminho,
          tamanho: Number(item.metadata?.size ?? 0),
          contentType: item.metadata?.mimetype as string | undefined,
        });
      }
    }

    if (data.length < POR_PAGINA) break;
  }

  return arquivos;
}
