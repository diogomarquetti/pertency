/**
 * Compara a configuração de Auth dos dois projetos da migração para São Paulo
 * (ver docs/migracao-sp.md) pela Management API — as dezenas de opções das
 * telas de Authentication, sem conferir campo a campo no painel.
 * Só lê; o ajuste é feito no painel do projeto novo.
 *
 * Precisa, em `.env.migracao`:
 *   SUPABASE_ACCESS_TOKEN   token pessoal (Account › Access Tokens) — revogar ao final
 *   ORIGEM_PROJECT_REF / DESTINO_PROJECT_REF
 *
 * Uso: pnpm migracao:auth
 */
import { existsSync } from "node:fs";

if (existsSync(".env.migracao")) process.loadEnvFile(".env.migracao");

// Valores que podem conter segredo: só dizemos se são iguais, sem imprimir.
const SEGREDO = /secret|password|pass$|key|token/i;

async function configAuth(ref: string, token: string): Promise<Record<string, unknown>> {
  const resposta = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resposta.ok) throw new Error(`Falha ao ler o Auth de ${ref}: ${resposta.status} ${await resposta.text()}`);
  return (await resposta.json()) as Record<string, unknown>;
}

function mostrar(campo: string, valor: unknown) {
  if (valor === null || valor === undefined || valor === "") return "(vazio)";
  if (SEGREDO.test(campo)) return "(preenchido)";
  return JSON.stringify(valor);
}

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const origem = process.env.ORIGEM_PROJECT_REF;
  const destino = process.env.DESTINO_PROJECT_REF;
  if (!token || !origem || !destino) {
    throw new Error("Faltam SUPABASE_ACCESS_TOKEN, ORIGEM_PROJECT_REF ou DESTINO_PROJECT_REF em .env.migracao.");
  }

  const [a, b] = await Promise.all([configAuth(origem, token), configAuth(destino, token)]);
  const diferentes = [...new Set([...Object.keys(a), ...Object.keys(b)])]
    .sort()
    .filter((campo) => JSON.stringify(a[campo] ?? null) !== JSON.stringify(b[campo] ?? null));

  if (diferentes.length === 0) {
    console.log("Configuração de Auth idêntica.");
    return;
  }

  console.log(`${diferentes.length} campo(s) diferente(s) — origem → destino:\n`);
  for (const campo of diferentes) {
    console.log(`${campo}\n  origem:  ${mostrar(campo, a[campo])}\n  destino: ${mostrar(campo, b[campo])}`);
  }
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
