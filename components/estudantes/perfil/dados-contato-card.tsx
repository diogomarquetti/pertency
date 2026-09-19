import Link from "next/link";
import { ArrowRight, User } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { PerfilEstudanteResumo } from "@/app/(app)/estudantes/queries";

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line py-[10px] first:border-t-0 first:pt-0">
      <span className="text-[13px] text-muted">{rotulo}</span>
      <span className="text-right text-[13.5px] font-semibold text-ink">{valor || "—"}</span>
    </div>
  );
}

export function DadosContatoCard({ estudante }: { estudante: PerfilEstudanteResumo }) {
  const responsavel =
    estudante.responsavelPrincipalNome && estudante.responsavelPrincipalParentesco
      ? `${estudante.responsavelPrincipalNome} (${estudante.responsavelPrincipalParentesco.toLowerCase()})`
      : estudante.responsavelPrincipalNome;

  const endereco =
    estudante.enderecoMunicipio && estudante.enderecoUf
      ? `${estudante.enderecoMunicipio}, ${estudante.enderecoUf}`
      : estudante.enderecoMunicipio;

  return (
    <Card className="gap-3 p-[24px]">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-highlight text-ink">
          <User size={16} strokeWidth={2} className="text-muted" aria-hidden="true" />
          Dados e contato
        </h2>
        <Link
          href={`/estudantes/${estudante.id}/editar`}
          className="flex items-center gap-1 text-[13px] font-semibold text-brand hover:underline"
        >
          Ver cadastro completo
          <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>

      <div className="flex flex-col">
        <Campo rotulo="Responsável principal" valor={responsavel} />
        <Campo rotulo="Telefone principal" valor={estudante.responsavelPrincipalTelefone} />
        <Campo rotulo="Contato de emergência" valor={estudante.contatoEmergenciaNome} />
        <Campo rotulo="Telefone de emergência" valor={estudante.contatoEmergenciaTelefone} />
        <Campo rotulo="Endereço" valor={endereco} />
      </div>
    </Card>
  );
}
