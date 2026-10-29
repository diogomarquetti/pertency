"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, Pencil, Plus, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListCard, ListCardLink, ListCardList } from "@/components/ui/list-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { EscolaListItem } from "@/app/admin/(painel)/escolas/queries";

import { useToastDeParametro } from "./use-toast-de-parametro";

function MantenedoraTexto({ nome }: { nome: string | null }) {
  return nome ? <>{nome}</> : <span className="text-muted">Sem mantenedora</span>;
}

function StatusBadge({ status }: { status: "ativa" | "inativa" }) {
  return <Badge variant={status === "ativa" ? "success" : "neutral"}>{status === "ativa" ? "Ativa" : "Inativa"}</Badge>;
}

export function EscolasLista({ escolas }: { escolas: EscolaListItem[] }) {
  const [busca, setBusca] = useState("");
  useToastDeParametro("criada", "Escola criada com sucesso.");

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return escolas;
    return escolas.filter(
      (escola) =>
        escola.nomeOficial.toLowerCase().includes(termo) ||
        escola.nomeUsual.toLowerCase().includes(termo) ||
        escola.municipio.toLowerCase().includes(termo),
    );
  }, [escolas, busca]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-auto">
          <Search
            size={16}
            strokeWidth={2}
            className="pointer-events-none absolute top-1/2 left-[13px] -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <Input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar por nome ou município"
            className="w-full pl-[38px] sm:w-[340px]"
            aria-label="Buscar escola"
          />
        </div>

        <Button asChild>
          <Link href="/escolas/nova">
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
            Nova escola
          </Link>
        </Button>
      </div>

      {filtradas.length > 0 ? (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Escola</TableHead>
                  <TableHead>Município</TableHead>
                  <TableHead>Mantenedora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtradas.map((escola) => (
                  <TableRow key={escola.id}>
                    <TableCell>
                      <div className="font-semibold text-ink">{escola.nomeOficial}</div>
                      {escola.nomeUsual && <div className="text-[12.5px] text-muted">{escola.nomeUsual}</div>}
                    </TableCell>
                    <TableCell>{escola.municipio ? `${escola.municipio}/${escola.uf}` : "—"}</TableCell>
                    <TableCell>
                      <MantenedoraTexto nome={escola.mantenedora} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={escola.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" icon asChild>
                              <Link href={`/escolas/${escola.id}`} aria-label="Editar escola">
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
            {filtradas.map((escola) => (
              <ListCard key={escola.id}>
                <div className="min-w-0 flex-1">
                  <ListCardLink href={`/escolas/${escola.id}`}>{escola.nomeOficial}</ListCardLink>
                  <div className="truncate text-[12.5px] text-muted">
                    <MantenedoraTexto nome={escola.mantenedora} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <StatusBadge status={escola.status} />
                  </div>
                </div>
                <ChevronRight size={16} strokeWidth={2} className="shrink-0 text-muted" aria-hidden="true" />
              </ListCard>
            ))}
          </ListCardList>
        </>
      ) : escolas.length === 0 ? (
        <div className="rounded-md border border-line bg-surface px-[24px] py-[48px] text-center">
          <p className="text-sm font-medium text-ink">Nenhuma escola cadastrada ainda</p>
          <p className="mt-1 text-[13px] text-muted">
            Clique em &ldquo;Nova escola&rdquo; para cadastrar a primeira. Cadastre antes a mantenedora dela.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-line bg-surface px-[24px] py-[48px] text-center">
          <p className="text-sm font-medium text-ink">Nenhuma escola encontrada</p>
          <p className="mt-1 text-[13px] text-muted">Ajuste a busca e tente novamente.</p>
        </div>
      )}
    </div>
  );
}
