"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardCheck, Clock, ListTodo, Pencil } from "lucide-react";

import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FutureModuleCard } from "@/components/ui/future-module-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SITUACAO_BADGE, SITUACAO_LABEL } from "@/app/(app)/estudantes/schema";
import type { PerfilEstudanteResumo, PerfilFuncionalEstudante } from "@/app/(app)/estudantes/queries";

import { AlertasRotinaCard } from "./alertas-rotina-card";
import { DadosContatoCard } from "./dados-contato-card";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" });

function formatIngresso(dataIngresso: string) {
  if (!dataIngresso) return null;
  const formatado = dateFormatter.format(new Date(dataIngresso));
  return formatado.charAt(0).toUpperCase() + formatado.slice(1).replace(".", "");
}

export function PerfilEstudante({
  estudante,
  idade,
  turmaAtualLabel,
  matriculaInterna,
  dataIngresso,
  perfilFuncional,
  canEdit,
}: {
  estudante: PerfilEstudanteResumo;
  idade: number | null;
  turmaAtualLabel: string | null;
  matriculaInterna: string | null;
  dataIngresso: string | null;
  perfilFuncional: PerfilFuncionalEstudante | null;
  canEdit: boolean;
}) {
  const [activeTab, setActiveTab] = useState("sobre");
  const ingresso = dataIngresso ? formatIngresso(dataIngresso) : null;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <Card className="mb-[24px] gap-0 overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 p-[24px]">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar size="xl">
              {estudante.fotoUrl && <AvatarImage src={estudante.fotoUrl} alt={estudante.nomeCompleto} />}
              <AvatarFallback>{getInitials(estudante.nomeCompleto)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-highlight text-ink">{estudante.nomeCompleto}</h1>
                <Badge variant={SITUACAO_BADGE[estudante.situacao]}>
                  {SITUACAO_LABEL[estudante.situacao] ?? estudante.situacao}
                </Badge>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px] text-muted">
                {idade !== null && <span>Idade {idade} anos</span>}
                {turmaAtualLabel && <span>Turma atual {turmaAtualLabel}</span>}
                {matriculaInterna && <span>Matrícula interna {matriculaInterna}</span>}
                {ingresso && <span>Ingresso {ingresso}</span>}
              </div>
            </div>
          </div>

          {canEdit && (
            <Button variant="secondary" asChild>
              <Link href={`/estudantes/${estudante.id}/editar`}>
                <Pencil size={15} strokeWidth={2} aria-hidden="true" />
                Editar cadastro
              </Link>
            </Button>
          )}
        </div>

        <TabsList className="border-t border-line px-[24px]">
          <TabsTrigger value="sobre">Sobre</TabsTrigger>
          <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
          <TabsTrigger value="planejamento">Planejamento</TabsTrigger>
          <TabsTrigger value="evolucao">Evolução</TabsTrigger>
        </TabsList>
      </Card>

      <TabsContent value="sobre">
        <div className="grid gap-[24px] md:grid-cols-2">
          <DadosContatoCard estudante={estudante} />
          <AlertasRotinaCard estudanteId={estudante.id} perfilFuncional={perfilFuncional} />
        </div>
      </TabsContent>

      <TabsContent value="avaliacoes">
        <FutureModuleCard
          icon={ClipboardCheck}
          titulo="Avaliações (PAI)"
          descricao="Aqui aparecerá o histórico de avaliações e o Plano de Atendimento Individualizado do estudante."
        />
      </TabsContent>

      <TabsContent value="planejamento">
        <FutureModuleCard
          icon={ListTodo}
          titulo="Planejamento"
          descricao="Objetivos, metas e planejamento pedagógico individualizado vinculados a este estudante."
        />
      </TabsContent>

      <TabsContent value="evolucao">
        <FutureModuleCard
          icon={Clock}
          titulo="Registros de evolução"
          descricao="Linha do tempo com observações e evoluções registradas pela equipe pedagógica ao longo do tempo."
        />
      </TabsContent>
    </Tabs>
  );
}
