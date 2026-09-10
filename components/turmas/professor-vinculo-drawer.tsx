"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ChevronDown, Loader2, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/lib/use-toast";

import {
  atualizarVinculoProfessor,
  vincularProfessor,
  type EscopoProfessorInput,
} from "@/app/(app)/turmas/professores-actions";
import type { ProfessorElegivel, ProfessorVinculado } from "@/app/(app)/turmas/queries";
import type { OfertaSlug } from "@/app/(app)/turmas/schema";

export type ScopePool = {
  ofertaSlug: OfertaSlug;
  componentes: { id: string; nome: string }[];
  areasConhecimento: string[];
  unidadesOcupacionais: string[];
  eixosFuncionais: string[];
};

function toggleValue(current: string[], value: string) {
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

/**
 * Select com busca por nome — o Radix Select não pagina/filtra bem listas
 * longas, e a tendência é ter muitos professores cadastrados. Sem
 * componente de combobox no design system ainda, então isso fica local por
 * enquanto (extrair pra components/ui se surgir um segundo uso).
 */
function ProfessorCombobox({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (id: string) => void;
  options: { id: string; nome: string }[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.id === value);
  const filtered = options.filter((option) =>
    option.nome.toLowerCase().includes(query.trim().toLowerCase()),
  );

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setQuery("");
          setOpen((current) => !current);
        }}
        className={cn(
          "flex h-[42px] w-full items-center justify-between rounded-sm border-[1.5px] border-line bg-surface px-[14px] text-control text-ink outline-none",
          "transition-colors duration-base ease-standard hover:border-[#C7D0DB]",
          open && "border-brand shadow-[0_0_0_var(--focus-ring-inner)_var(--brand-tint)]",
          disabled && "cursor-not-allowed border-line bg-bg text-muted hover:border-line",
        )}
      >
        <span className={cn("truncate text-left", !selected && "text-[#94A3B8]")}>
          {selected?.nome ?? "Selecionar professor ativo…"}
        </span>
        <ChevronDown size={16} strokeWidth={2} className="shrink-0 text-muted" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-line bg-surface shadow-md">
          <div className="flex items-center gap-[8px] border-b border-line px-[12px] py-[9px]">
            <Search size={14} strokeWidth={2} className="shrink-0 text-muted" aria-hidden="true" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nome…"
              className="w-full text-[13.5px] text-ink outline-none placeholder:text-[#94A3B8]"
            />
          </div>
          <div className="max-h-[220px] overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-[12px] py-[9px] text-[13px] text-muted">
                Nenhum professor encontrado.
              </p>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-[12px] py-[8px] text-left text-[13.5px] font-medium text-ink outline-none",
                    "transition-colors duration-fast ease-standard hover:bg-brand-tint",
                    option.id === value && "bg-brand-tint",
                  )}
                >
                  {option.nome}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * O estado do formulário vive aqui, não no componente de fora — o Radix
 * Dialog só mantém este corpo montado enquanto o Sheet está
 * aberto/animando (Presence), então cada abertura já nasce com estado
 * limpo (ou pré-preenchido pelo `editing` daquela vez), sem precisar de
 * useEffect pra resetar.
 */
function DrawerBody({
  turmaId,
  editing,
  professoresElegiveis,
  professoresVinculados,
  pool,
  onOpenChange,
}: {
  turmaId: string;
  editing: ProfessorVinculado | null;
  professoresElegiveis: ProfessorElegivel[];
  professoresVinculados: ProfessorVinculado[];
  pool: ScopePool;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [usuarioId, setUsuarioId] = useState(editing?.usuarioId ?? "");
  const [componenteIds, setComponenteIds] = useState<string[]>(editing?.componenteIds ?? []);
  const [escopoEja, setEscopoEja] = useState<string[]>(editing?.escopoEja ?? []);
  const [status, setStatus] = useState<"ativo" | "inativo">(editing?.status ?? "ativo");
  const [error, setError] = useState<string | null>(null);

  // Professor já vinculado não pode ser selecionado de novo — exceto o
  // próprio vínculo sendo editado, senão ele desaparece da lista.
  const jaVinculadosIds = new Set(
    professoresVinculados.filter((p) => p.id !== editing?.id).map((p) => p.usuarioId),
  );
  const opcoesProfessor = professoresElegiveis.filter(
    (p) => !jaVinculadosIds.has(p.id) || p.id === usuarioId,
  );

  function handleSubmit() {
    if (!usuarioId) {
      setError("Selecione um professor.");
      return;
    }
    if (pool.ofertaSlug === "ef" && componenteIds.length === 0) {
      setError("Selecione ao menos um componente curricular.");
      return;
    }
    setError(null);

    const escopo: EscopoProfessorInput = {
      componenteIds: pool.ofertaSlug === "ef" ? componenteIds : [],
      escopoEja: pool.ofertaSlug === "eja" ? escopoEja : [],
    };

    startTransition(async () => {
      const result = editing
        ? await atualizarVinculoProfessor(turmaId, editing.id, escopo, status)
        : await vincularProfessor(turmaId, usuarioId, escopo);

      if (result && "error" in result) {
        toast.error("Não foi possível salvar", result.error);
        return;
      }

      toast.success(editing ? "Vínculo atualizado." : "Professor vinculado.");
      router.refresh();
      onOpenChange(false);
    });
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{editing ? "Editar vínculo" : "Vincular professor"}</SheetTitle>
      </SheetHeader>

      <SheetBody className="flex flex-col gap-5">
        <div className="grid gap-2">
          <Label>Professor</Label>
          <ProfessorCombobox
            value={usuarioId}
            onChange={setUsuarioId}
            options={opcoesProfessor.map((professor) => ({ id: professor.id, nome: professor.nome }))}
            disabled={!!editing}
          />
        </div>

        {pool.ofertaSlug === "ei" && (
          <p className="text-[13px] text-muted">
            Educação Infantil: o professor é vinculado à turma inteira, sem escopo adicional.
          </p>
        )}

        {pool.ofertaSlug === "ef" && (
          <div className="grid gap-2">
            <Label>Componentes curriculares</Label>
            <span className="text-[12.5px] text-muted">Selecione ao menos um</span>
            <div className="rounded-sm border border-line px-[10px]">
              {pool.componentes.length === 0 ? (
                <p className="py-[9px] text-[13px] text-muted">
                  Nenhum componente selecionado no Bloco 3 desta turma ainda.
                </p>
              ) : (
                pool.componentes.map((componente, index) => (
                  <label
                    key={componente.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-[10px] py-[9px] text-[14px] text-ink",
                      index > 0 && "border-t border-line",
                    )}
                  >
                    <Checkbox
                      checked={componenteIds.includes(componente.id)}
                      onCheckedChange={() =>
                        setComponenteIds((current) => toggleValue(current, componente.id))
                      }
                    />
                    {componente.nome}
                  </label>
                ))
              )}
            </div>
          </div>
        )}

        {pool.ofertaSlug === "eja" && (
          <div className="grid gap-2">
            <Label>
              Escopo de atuação <span className="font-normal text-muted">(opcional)</span>
            </Label>
            <span className="text-[12.5px] text-muted">
              Áreas, unidades ocupacionais e eixos funcionais desta turma
            </span>
            <div className="rounded-sm border border-line px-[10px]">
              {[...pool.areasConhecimento, ...pool.unidadesOcupacionais, ...pool.eixosFuncionais].map(
                (label, index) => (
                  <label
                    key={label}
                    className={cn(
                      "flex cursor-pointer items-center gap-[10px] py-[9px] text-[14px] text-ink",
                      index > 0 && "border-t border-line",
                    )}
                  >
                    <Checkbox
                      checked={escopoEja.includes(label)}
                      onCheckedChange={() => setEscopoEja((current) => toggleValue(current, label))}
                    />
                    {label}
                  </label>
                ),
              )}
            </div>
          </div>
        )}

        {editing && (
          <div className="flex items-center justify-between rounded-sm border border-line px-[14px] py-[11px]">
            <Label className="text-[13.5px] font-medium text-ink">Vínculo ativo</Label>
            <Switch
              checked={status === "ativo"}
              onCheckedChange={(checked) => setStatus(checked ? "ativo" : "inativo")}
            />
          </div>
        )}

        {error && (
          <p className="flex items-center gap-[5px] text-[12.5px] text-danger" role="alert">
            <AlertCircle size={14} strokeWidth={2} className="shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </SheetBody>

      <SheetFooter>
        <Button
          type="button"
          variant="secondary"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          {isPending && (
            <Loader2 className="animate-spin" size={15} strokeWidth={2} aria-hidden="true" />
          )}
          {editing ? "Salvar" : "Vincular"}
        </Button>
      </SheetFooter>
    </>
  );
}

export function ProfessorVinculoDrawer({
  open,
  onOpenChange,
  turmaId,
  editing,
  professoresElegiveis,
  professoresVinculados,
  pool,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turmaId: string;
  editing: ProfessorVinculado | null;
  professoresElegiveis: ProfessorElegivel[];
  professoresVinculados: ProfessorVinculado[];
  pool: ScopePool;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <DrawerBody
          turmaId={turmaId}
          editing={editing}
          professoresElegiveis={professoresElegiveis}
          professoresVinculados={professoresVinculados}
          pool={pool}
          onOpenChange={onOpenChange}
        />
      </SheetContent>
    </Sheet>
  );
}
