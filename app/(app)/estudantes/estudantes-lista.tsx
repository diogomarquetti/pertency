"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Eye, Pencil, Plus, Search } from "lucide-react";

import { getInitials } from "@/lib/utils";
import { toast } from "@/lib/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ListCard,
  ListCardAction,
  ListCardLink,
  ListCardList,
} from "@/components/ui/list-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { SITUACAO_BADGE, SITUACAO_LABEL, SITUACAO_OPTIONS, calcularIdade } from "./schema";

const TODAS_SITUACOES = "todas";

export type EstudanteListItem = {
  id: string;
  nomeCompleto: string;
  dataNascimento: string;
  situacao: string;
  fotoUrl: string | null;
};

export function EstudantesLista({
  estudantes,
  canEdit,
}: {
  estudantes: EstudanteListItem[];
  canEdit: boolean;
}) {
  const [busca, setBusca] = useState("");
  const [situacaoFiltro, setSituacaoFiltro] = useState(TODAS_SITUACOES);
  const router = useRouter();
  const searchParams = useSearchParams();

  const salvoToastDisparado = useRef(false);
  useEffect(() => {
    if (searchParams.get("salvo") === "1" && !salvoToastDisparado.current) {
      salvoToastDisparado.current = true;
      toast.success("Alterações salvas com sucesso.");
      router.replace("/estudantes", { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const estudantesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return estudantes.filter((estudante) => {
      const combinaBusca = !termo || estudante.nomeCompleto.toLowerCase().includes(termo);
      const combinaSituacao =
        situacaoFiltro === TODAS_SITUACOES || estudante.situacao === situacaoFiltro;
      return combinaBusca && combinaSituacao;
    });
  }, [estudantes, busca, situacaoFiltro]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
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
              placeholder="Buscar por nome"
              className="w-full pl-[38px] sm:w-[340px]"
              aria-label="Buscar estudante"
            />
          </div>

          <Select value={situacaoFiltro} onValueChange={setSituacaoFiltro}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODAS_SITUACOES}>Todas as situações</SelectItem>
              {SITUACAO_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {canEdit && (
          <Button asChild>
            <Link href="/estudantes/novo">
              <Plus size={16} strokeWidth={2} aria-hidden="true" />
              Novo estudante
            </Link>
          </Button>
        )}
      </div>

      {estudantesFiltrados.length > 0 ? (
        <>
          <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudante</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {estudantesFiltrados.map((estudante) => {
                const idade = calcularIdade(estudante.dataNascimento);
                return (
                  <TableRow key={estudante.id}>
                    <TableCell>
                      <div className="flex items-center gap-[10px]">
                        <Avatar size="sm">
                          {estudante.fotoUrl && (
                            <AvatarImage src={estudante.fotoUrl} alt={estudante.nomeCompleto} />
                          )}
                          <AvatarFallback>{getInitials(estudante.nomeCompleto)}</AvatarFallback>
                        </Avatar>
                        <div className="font-semibold text-ink">{estudante.nomeCompleto}</div>
                      </div>
                    </TableCell>
                    <TableCell>{idade !== null ? `${idade} anos` : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={SITUACAO_BADGE[estudante.situacao]}>
                        {SITUACAO_LABEL[estudante.situacao] ?? estudante.situacao}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" icon asChild>
                              <Link href={`/estudantes/${estudante.id}`} aria-label="Ver perfil do estudante">
                                <Eye size={14} strokeWidth={2} aria-hidden="true" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver perfil</TooltipContent>
                        </Tooltip>
                        {canEdit && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="secondary" size="sm" icon asChild>
                                <Link href={`/estudantes/${estudante.id}/editar`} aria-label="Editar estudante">
                                  <Pencil size={14} strokeWidth={2} aria-hidden="true" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </div>
          <ListCardList className="md:hidden">
            {estudantesFiltrados.map((estudante) => {
              const idade = calcularIdade(estudante.dataNascimento);
              return (
                <ListCard key={estudante.id}>
                  <Avatar size="md">
                    {estudante.fotoUrl && (
                      <AvatarImage src={estudante.fotoUrl} alt={estudante.nomeCompleto} />
                    )}
                    <AvatarFallback>{getInitials(estudante.nomeCompleto)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <ListCardLink href={`/estudantes/${estudante.id}`}>
                      {estudante.nomeCompleto}
                    </ListCardLink>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      <Badge variant={SITUACAO_BADGE[estudante.situacao]}>
                        {SITUACAO_LABEL[estudante.situacao] ?? estudante.situacao}
                      </Badge>
                      {idade !== null && (
                        <span className="text-[12.5px] text-muted">{idade} anos</span>
                      )}
                    </div>
                  </div>
                  {canEdit ? (
                    <ListCardAction>
                      <Button variant="secondary" size="sm" icon asChild>
                        <Link href={`/estudantes/${estudante.id}/editar`} aria-label="Editar estudante">
                          <Pencil size={14} strokeWidth={2} aria-hidden="true" />
                        </Link>
                      </Button>
                    </ListCardAction>
                  ) : (
                    <ChevronRight size={16} strokeWidth={2} className="shrink-0 text-muted" aria-hidden="true" />
                  )}
                </ListCard>
              );
            })}
          </ListCardList>
        </>
      ) : estudantes.length === 0 ? (
        <div className="rounded-md border border-line bg-surface px-[24px] py-[48px] text-center">
          <p className="text-sm font-medium text-ink">Nenhum estudante cadastrado ainda</p>
          <p className="mt-1 text-[13px] text-muted">
            Clique em &ldquo;Novo estudante&rdquo; para cadastrar o primeiro.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-line bg-surface px-[24px] py-[48px] text-center">
          <p className="text-sm font-medium text-ink">Nenhum estudante encontrado</p>
          <p className="mt-1 text-[13px] text-muted">
            Ajuste a busca ou o filtro de situação e tente novamente.
          </p>
        </div>
      )}
    </div>
  );
}
