import type { EscolaValues, MantenedoraValues } from "./schema";

// Conversão linha do banco ↔ valores do formulário de Escola e Mantenedora,
// compartilhada pelo app das escolas (Configurações) e pelo admin da
// plataforma — os dois leem e gravam as mesmas colunas.

export const ESCOLA_COLUNAS =
  "id, nome_oficial, nome_usual, codigo_escola, tipo_escola, modalidade, nre_referencia, status, logradouro, numero, complemento, bairro, cep, municipio, uf, fone_institucional, email_institucional, diretor_nome, diretor_fone, diretor_email, coordenador_nome, coordenador_fone, coordenador_email";

export const MANTENEDORA_COLUNAS =
  "id, razao_social, nome_fantasia, cnpj, logradouro, numero, complemento, bairro, cep, municipio, uf, fone_institucional, whatsapp_institucional, email_institucional, site, presidente_nome, presidente_cpf, presidente_fone, presidente_email, status";

type Linha = Record<string, unknown>;

const texto = (valor: unknown) => (valor as string | null) ?? "";

export function escolaDaLinha(data: Linha): EscolaValues & { id: string } {
  return {
    id: data.id as string,
    nomeOficial: texto(data.nome_oficial),
    nomeUsual: texto(data.nome_usual),
    codigoEscola: texto(data.codigo_escola),
    tipoEscola: texto(data.tipo_escola),
    modalidade: texto(data.modalidade),
    nreReferencia: texto(data.nre_referencia),
    status: data.status as "ativa" | "inativa",
    logradouro: texto(data.logradouro),
    numero: texto(data.numero),
    complemento: texto(data.complemento),
    bairro: texto(data.bairro),
    cep: texto(data.cep),
    municipio: texto(data.municipio),
    uf: texto(data.uf),
    foneInstitucional: texto(data.fone_institucional),
    emailInstitucional: texto(data.email_institucional),
    diretorNome: texto(data.diretor_nome),
    diretorFone: texto(data.diretor_fone),
    diretorEmail: texto(data.diretor_email),
    coordenadorNome: texto(data.coordenador_nome),
    coordenadorFone: texto(data.coordenador_fone),
    coordenadorEmail: texto(data.coordenador_email),
  };
}

export function escolaParaColunas(data: EscolaValues) {
  return {
    nome_oficial: data.nomeOficial,
    nome_usual: data.nomeUsual || null,
    codigo_escola: data.codigoEscola || null,
    tipo_escola: data.tipoEscola,
    modalidade: data.modalidade,
    nre_referencia: data.nreReferencia,
    status: data.status,
    logradouro: data.logradouro,
    numero: data.numero,
    complemento: data.complemento || null,
    bairro: data.bairro,
    cep: data.cep,
    municipio: data.municipio,
    uf: data.uf,
    fone_institucional: data.foneInstitucional,
    email_institucional: data.emailInstitucional,
    diretor_nome: data.diretorNome,
    diretor_fone: data.diretorFone,
    diretor_email: data.diretorEmail,
    coordenador_nome: data.coordenadorNome,
    coordenador_fone: data.coordenadorFone,
    coordenador_email: data.coordenadorEmail,
  };
}

export function mantenedoraDaLinha(data: Linha): MantenedoraValues & { id: string } {
  return {
    id: data.id as string,
    razaoSocial: texto(data.razao_social),
    nomeFantasia: texto(data.nome_fantasia),
    cnpj: texto(data.cnpj),
    logradouro: texto(data.logradouro),
    numero: texto(data.numero),
    complemento: texto(data.complemento),
    bairro: texto(data.bairro),
    cep: texto(data.cep),
    municipio: texto(data.municipio),
    uf: texto(data.uf),
    foneInstitucional: texto(data.fone_institucional),
    whatsappInstitucional: texto(data.whatsapp_institucional),
    emailInstitucional: texto(data.email_institucional),
    site: texto(data.site),
    presidenteNome: texto(data.presidente_nome),
    presidenteCpf: texto(data.presidente_cpf),
    presidenteFone: texto(data.presidente_fone),
    presidenteEmail: texto(data.presidente_email),
    status: data.status as "ativa" | "inativa",
  };
}

export function mantenedoraParaColunas(data: MantenedoraValues) {
  return {
    razao_social: data.razaoSocial,
    nome_fantasia: data.nomeFantasia,
    cnpj: data.cnpj,
    logradouro: data.logradouro,
    numero: data.numero,
    complemento: data.complemento || null,
    bairro: data.bairro,
    cep: data.cep,
    municipio: data.municipio,
    uf: data.uf,
    fone_institucional: data.foneInstitucional,
    whatsapp_institucional: data.whatsappInstitucional || null,
    email_institucional: data.emailInstitucional,
    site: data.site || null,
    presidente_nome: data.presidenteNome,
    presidente_cpf: data.presidenteCpf,
    presidente_fone: data.presidenteFone,
    presidente_email: data.presidenteEmail,
    status: data.status,
  };
}
