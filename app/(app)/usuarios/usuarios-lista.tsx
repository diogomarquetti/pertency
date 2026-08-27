"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, UserPlus } from "lucide-react";

import { getInitials } from "@/lib/utils";
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

import { FUNCAO_OPTIONS } from "./schema";

const FUNCAO_LABEL: Record<string, string> = Object.fromEntries(
  FUNCAO_OPTIONS.map((option) => [option.value, option.label]),
);

const TODAS_FUNCOES = "todas";

export type UsuarioListItem = {
  id: string;
  nome_completo: string;
  email: string;
  funcao: string;
  status: "ativo" | "inativo";
  foto_url: string | null;
};

export function UsuariosLista({ usuarios }: { usuarios: UsuarioListItem[] }) {
  const [busca, setBusca] = useState("");
  const [funcaoFiltro, setFuncaoFiltro] = useState(TODAS_FUNCOES);

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return usuarios.filter((usuario) => {
      const combinaBusca =
        !termo ||
        usuario.nome_completo.toLowerCase().includes(termo) ||
        usuario.email.toLowerCase().includes(termo);
      const combinaFuncao = funcaoFiltro === TODAS_FUNCOES || usuario.funcao === funcaoFiltro;
      return combinaBusca && combinaFuncao;
    });
  }, [usuarios, busca, funcaoFiltro]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
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
              className="w-[340px] pl-[38px]"
              aria-label="Buscar usuário"
            />
          </div>

          <Select value={funcaoFiltro} onValueChange={setFuncaoFiltro}>
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODAS_FUNCOES}>Todas as funções</SelectItem>
              {FUNCAO_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button asChild>
          <Link href="/usuarios/novo">
            <UserPlus size={16} strokeWidth={2} aria-hidden="true" />
            Novo usuário
          </Link>
        </Button>
      </div>

      {usuariosFiltrados.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuariosFiltrados.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>
                  <div className="flex items-center gap-[10px]">
                    <Avatar size="sm">
                      {usuario.foto_url && (
                        <AvatarImage src={usuario.foto_url} alt={usuario.nome_completo} />
                      )}
                      <AvatarFallback>{getInitials(usuario.nome_completo)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-ink">
                        {usuario.nome_completo}
                      </div>
                      <div className="text-[12.5px] text-muted">{usuario.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="brand" dot={false}>
                    {FUNCAO_LABEL[usuario.funcao] ?? usuario.funcao}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={usuario.status === "ativo" ? "success" : "neutral"}>
                    {usuario.status === "ativo" ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/usuarios/${usuario.id}/editar`}>Editar</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : usuarios.length === 0 ? (
        <div className="rounded-md border border-line bg-surface px-[24px] py-[48px] text-center">
          <p className="text-sm font-medium text-ink">
            Nenhum usuário cadastrado ainda
          </p>
          <p className="mt-1 text-[13px] text-muted">
            Clique em &ldquo;Novo usuário&rdquo; para cadastrar o primeiro profissional.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-line bg-surface px-[24px] py-[48px] text-center">
          <p className="text-sm font-medium text-ink">
            Nenhum usuário encontrado
          </p>
          <p className="mt-1 text-[13px] text-muted">
            Ajuste a busca ou o filtro de função e tente novamente.
          </p>
        </div>
      )}
    </div>
  );
}
