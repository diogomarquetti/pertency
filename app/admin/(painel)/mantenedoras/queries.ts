import { createClient } from "@/lib/supabase/server";
import { MANTENEDORA_COLUNAS, mantenedoraDaLinha } from "@/app/(app)/minha-escola/mapeamento";

export type MantenedoraListItem = {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  municipio: string;
  uf: string;
  status: "ativa" | "inativa";
  totalEscolas: number;
};

export async function listarMantenedoras(): Promise<MantenedoraListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mantenedoras")
    .select("id, razao_social, nome_fantasia, cnpj, municipio, uf, status, escolas(count)")
    .order("razao_social");

  if (error) throw error;

  return (data ?? []).map((linha) => ({
    id: linha.id,
    razaoSocial: linha.razao_social,
    nomeFantasia: linha.nome_fantasia,
    cnpj: linha.cnpj,
    municipio: linha.municipio,
    uf: linha.uf,
    status: linha.status as "ativa" | "inativa",
    totalEscolas: (linha.escolas as unknown as { count: number }[])[0]?.count ?? 0,
  }));
}

export async function getMantenedora(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("mantenedoras").select(MANTENEDORA_COLUNAS).eq("id", id).maybeSingle();
  return data ? mantenedoraDaLinha(data) : null;
}
