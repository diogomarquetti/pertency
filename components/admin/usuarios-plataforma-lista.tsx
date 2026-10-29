"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, Pencil, Plus, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListCard, ListCardLink, ListCardList } from "@/components/ui/list-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { funcaoExibicao } from "@/app/(app)/usuarios/schema";
import type { EscolaOpcao, UsuarioPlataformaListItem } from "@/app/admin/(painel)/usuarios/queries";

const TODAS = "todas";

function funcaoDe(usuario: UsuarioPlataformaListItem) {
  return funcaoExibicao({
    funcao: usuario.funcao,
    area_atuacao: usuario.areaAtuacao,
    area_atuacao_outro: usuario.areaAtuacaoOutro,
  });
}

function SituacaoBadges({ usuario }: { usuario: UsuarioPlataformaListItem }) {
  return (
    <>
      <Badge variant={usuario.status === "ativo" ? "success" : "neutral"}>
        {usuario.status === "ativo" ? "Ativo" : "Inativo"}
      </Badge>
      {!usuario.senhaDefinida && <Badge variant="warning">Sem primeiro acesso</Badge>}
    </>
  );
}

export function UsuariosPlataformaLista({
  usuarios,
  escolas,
}: {
  usuarios: UsuarioPlataformaListItem[];
  escolas: EscolaOpcao[];
}) {
  const [busca, setBusca] = useState("");
  const [escolaId, setEscolaId] = useState(TODAS);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return usuarios.filter(
      (usuario) =>
        (escolaId === TODAS || usuario.escolaId === escolaId) &&
        (!termo ||
          usuario.nomeCompleto.toLowerCase().includes(termo) ||
          usuario.email.toLowerCase().includes(termo)),
    );
  }, [usuarios, busca, escolaId]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
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
              placeholder="Buscar por nome ou e-mail"
              className="w-full pl-[38px] sm:w-[300px]"
              aria-label="Buscar usuário"
            />
          </div>
          <Select value={escolaId} onValueChange={setEscolaId}>
            <SelectTrigger className="w-full sm:w-[260px]" aria-label="Filtrar por escola">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODAS}>Todas as escolas</SelectItem>
              {escolas.map((escola) => (
                <SelectItem key={escola.id} value={escola.id}>
                  {escola.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button asChild>
          <Link href="/usuarios/novo">
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
            Novo usuário
          </Link>
        </Button>
      </div>

      {filtrados.length > 0 ? (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Escola</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <div className="font-semibold text-ink">{usuario.nomeCompleto}</div>
                      <div className="text-[12.5px] text-muted">{usuario.email}</div>
                    </TableCell>
                    <TableCell>{usuario.escola}</TableCell>
                    <TableCell>{funcaoDe(usuario)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        <SituacaoBadges usuario={usuario} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" icon asChild>
                              <Link href={`/usuarios/${usuario.id}`} aria-label="Editar usuário">
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
            {filtrados.map((usuario) => (
              <ListCard key={usuario.id}>
                <div className="min-w-0 flex-1">
                  <ListCardLink href={`/usuarios/${usuario.id}`}>{usuario.nomeCompleto}</ListCardLink>
                  <div className="truncate text-[12.5px] text-muted">
                    {funcaoDe(usuario)} · {usuario.escola}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <SituacaoBadges usuario={usuario} />
                  </div>
                </div>
                <ChevronRight size={16} strokeWidth={2} className="shrink-0 text-muted" aria-hidden="true" />
              </ListCard>
            ))}
          </ListCardList>
        </>
      ) : usuarios.length === 0 ? (
        <div className="rounded-md border border-line bg-surface px-[24px] py-[48px] text-center">
          <p className="text-sm font-medium text-ink">Nenhum usuário cadastrado ainda</p>
          <p className="mt-1 text-[13px] text-muted">
            Clique em &ldquo;Novo usuário&rdquo; para criar o administrador de uma escola.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-line bg-surface px-[24px] py-[48px] text-center">
          <p className="text-sm font-medium text-ink">Nenhum usuário encontrado</p>
          <p className="mt-1 text-[13px] text-muted">Ajuste a busca ou o filtro de escola e tente novamente.</p>
        </div>
      )}
    </div>
  );
}
