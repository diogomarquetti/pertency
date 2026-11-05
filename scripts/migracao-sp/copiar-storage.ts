/**
 * Copia os arquivos do Storage do projeto atual para o novo (migração para
 * São Paulo — ver docs/migracao-sp.md). O dump do banco leva os buckets e as
 * linhas de `storage.objects`, mas não os arquivos: sem esta cópia, fotos e
 * documentos aparecem cadastrados e não abrem.
 *
 * - Cria no destino o bucket que faltar, com as mesmas regras (público,
 *   limite de tamanho, tipos aceitos).
 * - Envia cada arquivo com `upsert`: grava o arquivo por cima da linha que o
 *   dump já trouxe, e pode rodar de novo sem duplicar nada.
 * - Não apaga nada em nenhum dos dois projetos.
 *
 * Uso:
 *   pnpm migracao:storage --inventario   só lista buckets, arquivos e tamanho da origem
 *   pnpm migracao:storage                copia tudo para o destino
 */
import { clienteDestino, clienteOrigem, listarArquivos, urlDestino, urlOrigem } from "./clientes";

const SIMULTANEOS = 4;

function mb(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function main() {
  const inventario = process.argv.includes("--inventario");
  const origem = clienteOrigem();
  const destino = inventario ? null : clienteDestino();

  console.log(`Origem:  ${urlOrigem()}`);
  if (!inventario) console.log(`Destino: ${urlDestino()}`);

  const { data: buckets, error } = await origem.storage.listBuckets();
  if (error) throw error;

  let totalArquivos = 0;
  let totalBytes = 0;
  const falhas: string[] = [];

  for (const bucket of buckets) {
    const arquivos = await listarArquivos(origem, bucket.id);
    const bytes = arquivos.reduce((soma, arquivo) => soma + arquivo.tamanho, 0);
    totalArquivos += arquivos.length;
    totalBytes += bytes;
    console.log(
      `\n${bucket.id} (${bucket.public ? "público" : "privado"}): ${arquivos.length} arquivos, ${mb(bytes)}`,
    );
    if (!destino) continue;

    const { data: existente } = await destino.storage.getBucket(bucket.id);
    if (!existente) {
      const { error: erroBucket } = await destino.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.file_size_limit ?? undefined,
        allowedMimeTypes: bucket.allowed_mime_types ?? undefined,
      });
      if (erroBucket) throw new Error(`Falha ao criar o bucket ${bucket.id}: ${erroBucket.message}`);
      console.log("  bucket criado no destino");
    }

    let copiados = 0;
    const fila = [...arquivos];
    async function trabalhador() {
      for (let arquivo = fila.shift(); arquivo; arquivo = fila.shift()) {
        const { data: conteudo, error: erroDownload } = await origem.storage
          .from(bucket.id)
          .download(arquivo.caminho);
        if (erroDownload || !conteudo) {
          falhas.push(`${bucket.id}/${arquivo.caminho}: download — ${erroDownload?.message}`);
          continue;
        }
        const { error: erroUpload } = await destino!.storage.from(bucket.id).upload(arquivo.caminho, conteudo, {
          upsert: true,
          contentType: arquivo.contentType,
        });
        if (erroUpload) {
          falhas.push(`${bucket.id}/${arquivo.caminho}: upload — ${erroUpload.message}`);
          continue;
        }
        copiados += 1;
        if (copiados % 25 === 0) console.log(`  ${copiados}/${arquivos.length}`);
      }
    }
    await Promise.all(Array.from({ length: SIMULTANEOS }, trabalhador));
    console.log(`  ${copiados}/${arquivos.length} copiados`);
  }

  console.log(`\nTotal: ${totalArquivos} arquivos, ${mb(totalBytes)}`);
  if (falhas.length > 0) {
    console.error(`\n${falhas.length} falha(s) — pode rodar de novo (reenvia tudo, sem duplicar):`);
    for (const falha of falhas) console.error(`  ${falha}`);
    process.exit(1);
  }
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
