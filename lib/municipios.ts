export type Municipio = {
  nome: string;
  uf: string;
  nomeBusca: string;
};

type IbgeMunicipio = {
  nome: string;
  // A maioria vem com `microrregiao`, mas pelo menos 1 município (Boa Esperança
  // do Norte/MT) só tem a UF resolvível via `regiao-imediata` — daí os dois
  // caminhos opcionais e o filtro abaixo pra não quebrar a lista inteira por causa
  // de um registro incompleto.
  microrregiao: { mesorregiao: { UF: { sigla: string } } } | null;
  "regiao-imediata"?: {
    "regiao-intermediaria"?: { UF?: { sigla: string } };
  } | null;
};

const IBGE_MUNICIPIOS_URL =
  "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome";

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

let cache: Municipio[] | null = null;
let pending: Promise<Municipio[]> | null = null;

/**
 * Busca (e cacheia em memória, uma vez por sessão do navegador) a lista completa
 * de municípios brasileiros do IBGE, já com UF resolvida. ~230KB gzip — carregado
 * sob demanda (primeiro foco no combobox de município), nunca no carregamento da página.
 */
export async function getMunicipios(): Promise<Municipio[]> {
  if (cache) return cache;
  if (pending) return pending;

  pending = fetch(IBGE_MUNICIPIOS_URL)
    .then((res) => {
      if (!res.ok) throw new Error("Falha ao carregar municípios do IBGE");
      return res.json() as Promise<IbgeMunicipio[]>;
    })
    .then((data) => {
      const municipios: Municipio[] = [];
      for (const item of data) {
        const uf =
          item.microrregiao?.mesorregiao.UF.sigla ??
          item["regiao-imediata"]?.["regiao-intermediaria"]?.UF?.sigla;
        if (!uf) continue;
        municipios.push({ nome: item.nome, uf, nomeBusca: normalizar(item.nome) });
      }
      cache = municipios;
      return municipios;
    })
    .finally(() => {
      pending = null;
    });

  return pending;
}
