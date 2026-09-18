"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { refreshAndBlur } from "@/lib/utils";
import { toast } from "@/lib/use-toast";

import { salvarContribuicao } from "@/app/(app)/estudantes/contribuicoes-actions";
import { AREA_CONTRIBUICAO_OPTIONS } from "@/app/(app)/estudantes/contribuicoes-schema";
import type { ContribuicaoAvaliacao, UsuarioElegivel } from "@/app/(app)/estudantes/queries";

/**
 * Mesmo racional de components/turmas/professor-vinculo-drawer.tsx: o
 * estado do formulário vive no corpo montado só enquanto o Sheet está
 * aberto (Presence do Radix), então cada abertura já nasce limpa ou
 * pré-preenchida por `editing`, sem precisar de useEffect pra resetar.
 */
function DrawerBody({
  estudanteId,
  avaliacaoId,
  editing,
  equipeElegivel,
  viewerId,
  travarProfissional,
  onOpenChange,
}: {
  estudanteId: string;
  avaliacaoId: string;
  editing: ContribuicaoAvaliacao | null;
  equipeElegivel: UsuarioElegivel[];
  viewerId: string | null;
  travarProfissional: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [profissionalId, setProfissionalId] = useState(
    editing?.profissionalId ?? (travarProfissional ? (viewerId ?? "") : ""),
  );
  const [areaContribuicao, setAreaContribuicao] = useState(editing?.areaContribuicao ?? "");
  const [observacoes, setObservacoes] = useState(editing?.observacoes ?? "");
  const [implicacoesParticipacao, setImplicacoesParticipacao] = useState(
    editing?.implicacoesParticipacao ?? "",
  );
  const [recomendacoesEscolares, setRecomendacoesEscolares] = useState(
    editing?.recomendacoesEscolares ?? "",
  );
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!profissionalId) {
      setError("Selecione o profissional.");
      return;
    }
    if (!areaContribuicao) {
      setError("Selecione a área da contribuição.");
      return;
    }
    if (!observacoes.trim()) {
      setError("Descreva a contribuição.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await salvarContribuicao(
        estudanteId,
        avaliacaoId,
        {
          profissionalId,
          areaContribuicao,
          observacoes,
          implicacoesParticipacao,
          recomendacoesEscolares,
        },
        editing?.id,
      );

      if (result && "error" in result) {
        toast.error("Não foi possível salvar", result.error);
        return;
      }

      toast.success(editing ? "Contribuição atualizada." : "Contribuição adicionada.");
      refreshAndBlur(router);
      onOpenChange(false);
    });
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{editing ? "Editar contribuição" : "Adicionar contribuição"}</SheetTitle>
      </SheetHeader>

      <SheetBody className="flex flex-col gap-5">
        <div className="grid gap-2">
          <Label>Profissional</Label>
          {travarProfissional ? (
            <div className="rounded-md border border-line bg-bg px-[12px] py-[9px] text-[14px] text-ink">
              {equipeElegivel.find((usuario) => usuario.id === viewerId)?.nome ?? "Você"}
            </div>
          ) : (
            <Select value={profissionalId} onValueChange={setProfissionalId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione…" />
              </SelectTrigger>
              <SelectContent>
                {equipeElegivel.map((usuario) => (
                  <SelectItem key={usuario.id} value={usuario.id}>
                    {usuario.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="grid gap-2">
          <Label>Área da contribuição</Label>
          <Select value={areaContribuicao} onValueChange={setAreaContribuicao}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione…" />
            </SelectTrigger>
            <SelectContent>
              {AREA_CONTRIBUICAO_OPTIONS.map((opcao) => (
                <SelectItem key={opcao.value} value={opcao.value}>
                  {opcao.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Observações</Label>
          <Textarea
            value={observacoes}
            onChange={(event) => setObservacoes(event.target.value)}
            placeholder="Contribuição objetiva, vinculada à participação e ao contexto escolar…"
          />
        </div>

        <div className="grid gap-2">
          <Label>
            Implicações para participação/aprendizagem{" "}
            <span className="font-normal text-muted">(opcional)</span>
          </Label>
          <Textarea
            value={implicacoesParticipacao}
            onChange={(event) => setImplicacoesParticipacao(event.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label>
            Recomendações escolares <span className="font-normal text-muted">(opcional)</span>
          </Label>
          <Textarea
            value={recomendacoesEscolares}
            onChange={(event) => setRecomendacoesEscolares(event.target.value)}
          />
        </div>

        {error && (
          <p className="flex items-center gap-[5px] text-[12.5px] text-danger" role="alert">
            <AlertCircle size={14} strokeWidth={2} className="shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </SheetBody>

      <SheetFooter>
        <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" size={15} strokeWidth={2} aria-hidden="true" />}
          {editing ? "Salvar" : "Adicionar"}
        </Button>
      </SheetFooter>
    </>
  );
}

export function ContribuicaoDrawer({
  open,
  onOpenChange,
  estudanteId,
  avaliacaoId,
  editing,
  equipeElegivel,
  viewerId,
  travarProfissional,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estudanteId: string;
  avaliacaoId: string;
  editing: ContribuicaoAvaliacao | null;
  equipeElegivel: UsuarioElegivel[];
  viewerId: string | null;
  travarProfissional: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <DrawerBody
          estudanteId={estudanteId}
          avaliacaoId={avaliacaoId}
          editing={editing}
          equipeElegivel={equipeElegivel}
          viewerId={viewerId}
          travarProfissional={travarProfissional}
          onOpenChange={onOpenChange}
        />
      </SheetContent>
    </Sheet>
  );
}
