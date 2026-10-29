import { createClient } from "@/lib/supabase/server";
import { ESCOLA_COLUNAS, escolaDaLinha } from "@/app/(app)/minha-escola/mapeamento";
import type { MantenedoraOpcao } from "@/components/minha-escola/escola-mantenedora-card";

export type EscolaListItem = {
  id: string;
  nomeOficial: string;
  nomeUsual: string;
  municipio: string;
  uf: string;
  status: "ativa" | "inativa";
  mantenedora: string | null;
};

export async function listarEscolas(): Promise<EscolaListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("escolas")
    .select("id, nome_oficial, nome_usual, municipio, uf, status, mantenedoras(razao_social)")
    .order("nome_oficial");

  if (error) throw error;

  return (data ?? []).map((linha) => ({
    id: linha.id,
    nomeOficial: linha.nome_oficial,
    nomeUsual: linha.nome_usual ?? "",
    municipio: linha.municipio ?? "",
    uf: linha.uf ?? "",
    status: linha.status as "ativa" | "inativa",
    mantenedora: (linha.mantenedoras as unknown as { razao_social: string } | null)?.razao_social ?? null,
  }));
}

export async function getEscola(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("escolas")
    .select(`${ESCOLA_COLUNAS}, mantenedora_id`)
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;
  return { ...escolaDaLinha(data), mantenedoraId: data.mantenedora_id ?? "" };
}

export async function listarOpcoesMantenedora(): Promise<MantenedoraOpcao[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mantenedoras")
    .select("id, razao_social, cnpj, status")
    .order("razao_social");

  if (error) throw error;

  return (data ?? []).map((linha) => ({
    id: linha.id,
    razaoSocial: linha.razao_social,
    cnpj: linha.cnpj,
    status: linha.status as "ativa" | "inativa",
  }));
}
