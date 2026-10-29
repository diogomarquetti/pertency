import { PageTitle } from "@/components/layout/page-title";
import { EscolaForm } from "@/components/minha-escola/escola-form";
import type { EscolaValues } from "@/app/(app)/minha-escola/schema";

import { criarEscola } from "../actions";
import { listarOpcoesMantenedora } from "../queries";

const ESCOLA_VAZIA: EscolaValues = {
  nomeOficial: "",
  nomeUsual: "",
  codigoEscola: "",
  tipoEscola: "",
  modalidade: "",
  nreReferencia: "",
  status: "ativa",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cep: "",
  municipio: "",
  uf: "",
  foneInstitucional: "",
  emailInstitucional: "",
  diretorNome: "",
  diretorFone: "",
  diretorEmail: "",
  coordenadorNome: "",
  coordenadorFone: "",
  coordenadorEmail: "",
  mantenedoraId: "",
};

export default async function NovaEscolaPage() {
  const mantenedoras = await listarOpcoesMantenedora();

  return (
    <div>
      <PageTitle value="Nova escola" breadcrumb={[{ label: "Escolas", href: "/escolas" }, { label: "Nova escola" }]} />
      <EscolaForm
        escola={ESCOLA_VAZIA}
        canEdit
        salvar={criarEscola}
        cancelHref="/escolas"
        saveLabel="Criar escola"
        mantenedoras={mantenedoras}
      />
    </div>
  );
}
