/**
 * Confere a migração para São Paulo (ver docs/migracao-sp.md): compara, entre
 * o projeto atual e o novo, o total de linhas de cada tabela/view exposta pela
 * API, o total de logins em auth.users e o total de arquivos por bucket.
 * Só lê — não altera nenhum dos dois projetos.
 *
 * Uso: pnpm migracao:conferir
 * Sai com código 1 se alguma contagem divergir.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import { clienteDestino, clienteOrigem, listarArquivos, urlDestino, urlOrigem } from "./clientes";

/** Tabelas e views do schema public, pela descrição OpenAPI do PostgREST. */
async function tabelasExpostas(url: string, chave: string): Promise<string[]> {
  const resposta = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: chave, Authorization: `Bearer ${chave}` },
  });
  if (!resposta.ok) throw new Error(`Falha ao ler a API de ${url}: ${resposta.status}`);
  const descricao = (await resposta.json()) as { definitions?: Record<string, unknown> };
  return Object.keys(descricao.definitions ?? {}).sort();
}

async function contarLinhas(cliente: SupabaseClient, tabela: string): Promise<number | string> {
  const { count, error } = await cliente.from(tabela).select("*", { count: "exact", head: true });
  return error ? `erro: ${error.message}` : (count ?? 0);
}

async function contarLogins(cliente: SupabaseClient): Promise<number> {
  let total = 0;
  for (let pagina = 1; ; pagina += 1) {
    const { data, error } = await cliente.auth.admin.listUsers({ page: pagina, perPage: 1000 });
    if (error) throw error;
    total += data.users.length;
    if (data.users.length < 1000) return total;
  }
}

async function contarArquivos(cliente: SupabaseClient): Promise<Record<string, number>> {
  const { data: buckets, error } = await cliente.storage.listBuckets();
  if (error) throw error;
  const contagem: Record<string, number> = {};
  for (const bucket of buckets) contagem[bucket.id] = (await listarArquivos(cliente, bucket.id)).length;
  return contagem;
}

async function main() {
  const origem = clienteOrigem();
  const destino = clienteDestino();
  const chaveOrigem = process.env.ORIGEM_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const chaveDestino = process.env.DESTINO_SERVICE_ROLE_KEY!;

  console.log(`Origem:  ${urlOrigem()}\nDestino: ${urlDestino()}\n`);

  const linhas: { item: string; origem: number | string; destino: number | string }[] = [];

  const [tabelasOrigem, tabelasDestino] = await Promise.all([
    tabelasExpostas(urlOrigem()!, chaveOrigem),
    tabelasExpostas(urlDestino()!, chaveDestino),
  ]);
  for (const tabela of [...new Set([...tabelasOrigem, ...tabelasDestino])].sort()) {
    const [a, b] = await Promise.all([
      tabelasOrigem.includes(tabela) ? contarLinhas(origem, tabela) : "não existe",
      tabelasDestino.includes(tabela) ? contarLinhas(destino, tabela) : "não existe",
    ]);
    linhas.push({ item: tabela, origem: a, destino: b });
  }

  const [loginsOrigem, loginsDestino] = await Promise.all([contarLogins(origem), contarLogins(destino)]);
  linhas.push({ item: "auth.users", origem: loginsOrigem, destino: loginsDestino });

  const [arquivosOrigem, arquivosDestino] = await Promise.all([contarArquivos(origem), contarArquivos(destino)]);
  for (const bucket of [...new Set([...Object.keys(arquivosOrigem), ...Object.keys(arquivosDestino)])].sort()) {
    linhas.push({
      item: `storage: ${bucket}`,
      origem: arquivosOrigem[bucket] ?? "não existe",
      destino: arquivosDestino[bucket] ?? "não existe",
    });
  }

  // Fotos ainda apontando para o projeto antigo (scripts/migracao-sp/reescrever-urls.sql).
  for (const tabela of ["usuarios", "estudantes"]) {
    const { count } = await destino
      .from(tabela)
      .select("*", { count: "exact", head: true })
      .like("foto_url", `${urlOrigem()}/%`);
    linhas.push({ item: `${tabela}.foto_url com host antigo`, origem: 0, destino: count ?? 0 });
  }

  const divergentes = linhas.filter((linha) => linha.origem !== linha.destino);
  console.table(linhas.map((linha) => ({ ...linha, ok: linha.origem === linha.destino ? "✓" : "✗" })));

  if (divergentes.length > 0) {
    console.error(`\n${divergentes.length} item(ns) divergente(s).`);
    process.exit(1);
  }
  console.log("\nTudo bate.");
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
