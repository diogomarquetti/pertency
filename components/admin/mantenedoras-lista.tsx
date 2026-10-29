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
import type { MantenedoraListItem } from "@/app/admin/(painel)/mantenedoras/queries";

import { useToastDeParametro } from "./use-toast-de-parametro";

function totalEscolasTexto(total: number) {
  if (total === 0) return "Nenhuma escola";
  return total === 1 ? "1 escola" : `${total} escolas`;
}

function StatusBadge({ status }: { status: "ativa" | "inativa" }) {
  return <Badge variant={status === "ativa" ? "success" : "neutral"}>{status === "ativa" ? "Ativa" : "Inativa"}</Badge>;
}

export function MantenedorasLista({ mantenedoras }: { mantenedoras: MantenedoraListItem[] }) {
  const [busca, setBusca] = useState("");
  useToastDeParametro("criada", "Mantenedora criada com sucesso.");

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const digitos = termo.replace(/\D/g, "");
    if (!termo) return mantenedoras;
    return mantenedoras.filter(
      (mantenedora) =>
        mantenedora.razaoSocial.toLowerCase().includes(termo) ||
        mantenedora.nomeFantasia.toLowerCase().includes(termo) ||
        (digitos.length > 0 && mantenedora.cnpj.replace(/\D/g, "").includes(digitos)),
    );
  }, [mantenedoras, busca]);

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
            placeholder="Buscar por nome ou CNPJ"
            className="w-full pl-[38px] sm:w-[340px]"
            aria-label="Buscar mantenedora"
          />
        </div>

        <Button asChild>
          <Link href="/mantenedoras/nova">
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
            Nova mantenedora
          </Link>
        </Button>
      </div>

      {filtradas.length > 0 ? (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mantenedora</TableHead>
                  <TableHead>Município</TableHead>
                  <TableHead>Escolas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtradas.map((mantenedora) => (
                  <TableRow key={mantenedora.id}>
                    <TableCell>
                      <div className="font-semibold text-ink">{mantenedora.razaoSocial}</div>
                      <div className="text-[12.5px] text-muted">{mantenedora.cnpj}</div>
                    </TableCell>
                    <TableCell>
                      {mantenedora.municipio}/{mantenedora.uf}
                    </TableCell>
                    <TableCell>{totalEscolasTexto(mantenedora.totalEscolas)}</TableCell>
                    <TableCell>
                      <StatusBadge status={mantenedora.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" icon asChild>
                              <Link href={`/mantenedoras/${mantenedora.id}`} aria-label="Editar mantenedora">
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
            {filtradas.map((mantenedora) => (
              <ListCard key={mantenedora.id}>
                <div className="min-w-0 flex-1">
                  <ListCardLink href={`/mantenedoras/${mantenedora.id}`}>{mantenedora.razaoSocial}</ListCardLink>
                  <div className="truncate text-[12.5px] text-muted">
                    {mantenedora.cnpj} · {totalEscolasTexto(mantenedora.totalEscolas)}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <StatusBadge status={mantenedora.status} />
                  </div>
                </div>
                <ChevronRight size={16} strokeWidth={2} className="shrink-0 text-muted" aria-hidden="true" />
              </ListCard>
            ))}
          </ListCardList>
        </>
      ) : mantenedoras.length === 0 ? (
        <div className="rounded-md border border-line bg-surface px-[24px] py-[48px] text-center">
          <p className="text-sm font-medium text-ink">Nenhuma mantenedora cadastrada ainda</p>
          <p className="mt-1 text-[13px] text-muted">
            Clique em &ldquo;Nova mantenedora&rdquo; para cadastrar a primeira. Ela poderá ser selecionada no
            cadastro da escola.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-line bg-surface px-[24px] py-[48px] text-center">
          <p className="text-sm font-medium text-ink">Nenhuma mantenedora encontrada</p>
          <p className="mt-1 text-[13px] text-muted">Ajuste a busca e tente novamente.</p>
        </div>
      )}
    </div>
  );
}
