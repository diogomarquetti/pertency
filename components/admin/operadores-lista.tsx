"use client";

import Link from "next/link";
import { ChevronRight, Pencil, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListCard, ListCardLink, ListCardList } from "@/components/ui/list-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Operador } from "@/app/admin/(painel)/usuarios/queries";

const DATA = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" });

function SituacaoBadges({ operador }: { operador: Operador }) {
  return (
    <>
      <Badge variant={operador.ativo ? "success" : "neutral"}>{operador.ativo ? "Ativo" : "Inativo"}</Badge>
      {!operador.ultimoAcesso && <Badge variant="warning">Sem primeiro acesso</Badge>}
    </>
  );
}

function ultimoAcesso(operador: Operador) {
  return operador.ultimoAcesso ? DATA.format(new Date(operador.ultimoAcesso)) : "—";
}

/** A equipe Pertency — quem acessa o admin da plataforma. */
export function OperadoresLista({ operadores, eu }: { operadores: Operador[]; eu: string }) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13.5px] text-muted">Quem da equipe Pertency pode acessar o admin.</p>
        <Button asChild>
          <Link href="/usuarios/novo">
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
            Convidar
          </Link>
        </Button>
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Último acesso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {operadores.map((operador) => (
              <TableRow key={operador.id}>
                <TableCell>
                  <div className="font-semibold text-ink">
                    {operador.nomeCompleto}
                    {operador.id === eu && <span className="font-normal text-muted"> (você)</span>}
                  </div>
                  <div className="text-[12.5px] text-muted">{operador.email}</div>
                </TableCell>
                <TableCell>{ultimoAcesso(operador)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1">
                    <SituacaoBadges operador={operador} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="secondary" size="sm" icon asChild>
                          <Link href={`/usuarios/${operador.id}`} aria-label="Editar">
                            <Pencil size={14} strokeWidth={2} aria-hidden="true" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ListCardList className="md:hidden">
        {operadores.map((operador) => (
          <ListCard key={operador.id}>
            <div className="min-w-0 flex-1">
              <ListCardLink href={`/usuarios/${operador.id}`}>
                {operador.nomeCompleto}
                {operador.id === eu && " (você)"}
              </ListCardLink>
              <div className="truncate text-[12.5px] text-muted">{operador.email}</div>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                <SituacaoBadges operador={operador} />
              </div>
            </div>
            <ChevronRight size={16} strokeWidth={2} className="shrink-0 text-muted" aria-hidden="true" />
          </ListCard>
        ))}
      </ListCardList>
    </div>
  );
}
