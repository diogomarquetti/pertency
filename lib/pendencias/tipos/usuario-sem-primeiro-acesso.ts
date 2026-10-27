import { funcaoExibicao } from "@/app/(app)/usuarios/schema";

import { PRAZOS } from "../prazos";
import type { TipoPendencia } from "../types";

// Substitui o item 11 do brief: o que dá para saber hoje é se o usuário já
// definiu a senha pelo link de convite (usuarios.senha_definida).
export const usuarioSemPrimeiroAcesso: TipoPendencia = {
  tipo: "usuario_sem_primeiro_acesso",
  origem: "usuario",
  titulo: "Reenviar acesso",
  acao: "Gerar novo link",
  resolve: ["administrador"],
  acompanha: [],
  regra: `Usuário ativo que ainda não definiu a senha pelo link de acesso. Vira "Atenção" após ${PRAZOS.usuario_sem_primeiro_acesso.dias} dias do cadastro.`,
  prazo: PRAZOS.usuario_sem_primeiro_acesso,
  rotuloTempo: (dias) => (dias === 0 ? "cadastrado hoje" : `cadastrado há ${dias} ${dias === 1 ? "dia" : "dias"}`),
  async carregar(ctx) {
    const { data, error } = await ctx.supabase
      .from("usuarios")
      .select("id, nome_completo, funcao, area_atuacao, area_atuacao_outro, created_at")
      .eq("status", "ativo")
      .eq("senha_definida", false);
    if (error) throw error;

    return data.map((usuario) => ({
      entidadeId: usuario.id,
      sujeito: usuario.nome_completo,
      descricao: `${funcaoExibicao(usuario)} cadastrado(a), mas ainda sem primeiro acesso. Gere um novo link e envie de novo.`,
      estado: "Sem primeiro acesso",
      desde: usuario.created_at,
      destino: `/usuarios/${usuario.id}/editar#acesso`,
    }));
  },
};
