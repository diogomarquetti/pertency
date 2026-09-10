"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Pencil, Plus, Search } from "lucide-react";

import { toast } from "@/lib/use-toast";
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

import { OFERTA_OPTIONS, STATUS_OPTIONS } from "./schema";

const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map((option) => [option.value, option.label]),
);
const STATUS_BADGE: Record<string, "success" | "neutral" | "danger"> = {
  ativa: "success",
  inativa: "neutral",
  encerrada: "danger",
};

const TODAS_OFERTAS = "todas";

export type TurmaListItem = {
  id: string;
  nome: string;
  status: "ativa" | "inativa" | "encerrada";
  ofertaSlug: string;
  ofertaNome: string;
  turnoNome: string;
  anoLetivo: number;
};

export function TurmasLista({
  turmas,
  canEdit,
}: {
  turmas: TurmaListItem[];
  canEdit: boolean;
}) {
  const [busca, setBusca] = useState("");
  const [ofertaFiltro, setOfertaFiltro] = useState(TODAS_OFERTAS);
  const router = useRouter();
  const searchParams = useSearchParams();

  const salvoToastDisparado = useRef(false);
  useEffect(() => {
    if (searchParams.get("salvo") === "1" && !salvoToastDisparado.current) {
      salvoToastDisparado.current = true;
      toast.success("Alterações salvas com sucesso.");
      router.replace("/turmas", { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const turmasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return turmas.filter((turma) => {
      const combinaBusca = !termo || turma.nome.toLowerCase().includes(termo);
      const combinaOferta = ofertaFiltro === TODAS_OFERTAS || turma.ofertaSlug === ofertaFiltro;
      return combinaBusca && combinaOferta;
    });
  }, [turmas, busca, ofertaFiltro]);

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
              placeholder="Buscar por nome da turma"
              className="w-[340px] pl-[38px]"
              aria-label="Buscar turma"
            />
          </div>

          <Select value={ofertaFiltro} onValueChange={setOfertaFiltro}>
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODAS_OFERTAS}>Todas as ofertas</SelectItem>
              {OFERTA_OPTIONS.map((option) => (
                <SelectItem key={option.slug} value={option.slug}>
                  {option.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {canEdit && (
          <Button asChild>
            <Link href="/turmas/novo">
              <Plus size={16} strokeWidth={2} aria-hidden="true" />
              Nova turma
            </Link>
          </Button>
        )}
      </div>

      {turmasFiltradas.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Turma</TableHead>
              <TableHead>Oferta</TableHead>
              <TableHead>Turno</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {turmasFiltradas.map((turma) => (
              <TableRow key={turma.id}>
                <TableCell>
                  <div className="font-semibold text-ink">{turma.nome}</div>
                  <div className="text-[12.5px] text-muted">{turma.anoLetivo}</div>
                </TableCell>
                <TableCell>{turma.ofertaNome}</TableCell>
                <TableCell>{turma.turnoNome}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE[turma.status]}>{STATUS_LABEL[turma.status]}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Button variant="secondary" size="sm" icon asChild>
                      <Link
                        href={`/turmas/${turma.id}/editar`}
                        aria-label={canEdit ? "Editar turma" : "Visualizar turma"}
                      >
                        {canEdit ? (
                          <Pencil size={14} strokeWidth={2} aria-hidden="true" />
                        ) : (
                          <Eye size={14} strokeWidth={2} aria-hidden="true" />
                        )}
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : turmas.length === 0 ? (
        <div className="rounded-md border border-line bg-surface px-[24px] py-[48px] text-center">
          <p className="text-sm font-medium text-ink">Nenhuma turma cadastrada ainda</p>
          <p className="mt-1 text-[13px] text-muted">
            Clique em &ldquo;Nova turma&rdquo; para cadastrar a primeira turma.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-line bg-surface px-[24px] py-[48px] text-center">
          <p className="text-sm font-medium text-ink">Nenhuma turma encontrada</p>
          <p className="mt-1 text-[13px] text-muted">
            Ajuste a busca ou o filtro de oferta e tente novamente.
          </p>
        </div>
      )}
    </div>
  );
}
