import { avaliacaoNaoIniciada } from "./tipos/avaliacao-nao-iniciada";
import { avaliacaoParada } from "./tipos/avaliacao-parada";
import { cadastroInstitucionalIncompleto } from "./tipos/cadastro-institucional-incompleto";
import { componenteSemProfessor } from "./tipos/componente-sem-professor";
import { contribuicaoPendente } from "./tipos/contribuicao-pendente";
import { documentosPendentes } from "./tipos/documentos-pendentes";
import { matriculaPendente } from "./tipos/matricula-pendente";
import { parecerPendente } from "./tipos/parecer-pendente";
import { turmaOrganizacaoLegada } from "./tipos/turma-organizacao-legada";
import { usuarioSemPrimeiroAcesso } from "./tipos/usuario-sem-primeiro-acesso";
import type { TipoPendencia } from "./types";

/**
 * Todos os tipos de pendência. Adicionar um tipo novo (ex.: PAI vencido) é
 * criar o arquivo em lib/pendencias/tipos/ e incluí-lo aqui — a homepage
 * não muda.
 */
export const TIPOS_PENDENCIA: TipoPendencia[] = [
  avaliacaoNaoIniciada,
  avaliacaoParada,
  contribuicaoPendente,
  parecerPendente,
  matriculaPendente,
  documentosPendentes,
  turmaOrganizacaoLegada,
  componenteSemProfessor,
  cadastroInstitucionalIncompleto,
  usuarioSemPrimeiroAcesso,
];
