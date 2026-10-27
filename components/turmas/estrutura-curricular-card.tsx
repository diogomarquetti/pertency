"use client";

import type { Control, UseFormReturn } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  AREAS_CONHECIMENTO_EJA,
  EIXOS_FUNCIONAIS,
  UNIDADES_OCUPACIONAIS,
  type UpdateTurmaValues,
} from "@/app/(app)/turmas/schema";
import type { ReferenciaTurmaForm } from "@/app/(app)/turmas/queries";

type MultiSelectName =
  | "areasConhecimento"
  | "componenteIds"
  | "unidadesOcupacionais"
  | "eixosFuncionais";

function toggleValue(current: string[], value: string) {
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

function toOptions(values: readonly string[]) {
  return values.map((value) => ({ value, label: value }));
}

function MultiSelectField({
  control,
  name,
  label,
  hint,
  options,
  optional,
}: {
  control: Control<UpdateTurmaValues>;
  name: MultiSelectName;
  label: string;
  hint?: string;
  options: { value: string; label: string }[];
  optional?: boolean;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = field.value as string[];
        return (
          <FormItem>
            <FormLabel>
              {label} {optional && <span className="font-normal text-muted">(opcional)</span>}
            </FormLabel>
            {hint && <span className="-mt-1 text-[12.5px] text-muted">{hint}</span>}
            <div className="rounded-sm border border-line px-[10px]">
              {options.map((option, index) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-[10px] py-[9px] text-[14px] text-ink",
                    index > 0 && "border-t border-line",
                  )}
                >
                  <Checkbox
                    checked={value.includes(option.value)}
                    onCheckedChange={() => field.onChange(toggleValue(value, option.value))}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

/** Itens que vêm da matriz curricular — só leitura na turma. */
function ItensDaMatriz({ label, itens }: { label: string; itens: string[] }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {itens.length === 0 ? (
        <p className="text-[13px] text-muted">Não definido na matriz curricular.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {itens.map((item) => (
            <span
              key={item}
              className="inline-flex items-center rounded-sm border border-dashed border-line bg-bg px-[14px] py-[9px] text-[14px] text-ink"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function EstruturaCurricularCard({
  form,
  referencia,
}: {
  form: UseFormReturn<UpdateTurmaValues>;
  referencia: ReferenciaTurmaForm;
}) {
  const ofertaSlug = form.watch("ofertaSlug");
  const matrizId = form.watch("matrizCurricularId");
  const matriz = referencia.matrizes.find((m) => m.id === matrizId);
  const componenteOptions = referencia.componentes.map((c) => ({ value: c.id, label: c.nome }));

  // Ensino Fundamental: componentes da matriz agrupados por área, na ordem
  // em que aparecem.
  const componentesPorArea = new Map<string, string[]>();
  for (const componente of matriz?.componentes ?? []) {
    componentesPorArea.set(componente.area, [...(componentesPorArea.get(componente.area) ?? []), componente.nome]);
  }

  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">3.</span> Organização específica
      </h2>

      {!ofertaSlug && (
        <p className="text-[13px] text-muted">
          Selecione a oferta no bloco anterior para ver a organização específica da turma.
        </p>
      )}

      {(ofertaSlug === "ei" || ofertaSlug === "ef") && !matriz && (
        <p className="text-[13px] text-muted">
          Selecione a matriz curricular no bloco anterior — a organização da turma vem dela.
        </p>
      )}

      {ofertaSlug === "ei" && matriz && (
        <div className="flex flex-col gap-5">
          <p className="text-[13px] text-muted">
            Definidos pela matriz curricular ({matriz.nome}). A escolha pedagógica acontece no Planejamento.
          </p>
          <ItensDaMatriz label="Campos de experiências" itens={matriz.camposExperiencias} />
          <ItensDaMatriz label="Direitos de aprendizagem" itens={matriz.direitosAprendizagem} />
          <ItensDaMatriz label="Eixos estruturantes" itens={matriz.eixosEstruturantes} />
          <FormField
            control={form.control}
            name="objetivoGeral"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Objetivo geral da turma <span className="font-normal text-muted">(opcional)</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Foco pedagógico geral — não substitui o PAI individual."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {ofertaSlug === "ef" && matriz && (
        <div className="flex flex-col gap-5">
          <p className="text-[13px] text-muted">
            Áreas do conhecimento e componentes curriculares definidos pela matriz ({matriz.nome}).
          </p>
          {componentesPorArea.size === 0 ? (
            <p className="text-[13px] text-muted">A matriz ainda não tem componentes cadastrados.</p>
          ) : (
            [...componentesPorArea].map(([area, componentes]) => (
              <ItensDaMatriz key={area} label={area} itens={componentes} />
            ))
          )}
        </div>
      )}
      {ofertaSlug === "eja" && (
        <div className="flex flex-col gap-5">
          <MultiSelectField
            control={form.control}
            name="areasConhecimento"
            label="Áreas do conhecimento"
            options={toOptions(AREAS_CONHECIMENTO_EJA)}
          />
          <MultiSelectField
            control={form.control}
            name="unidadesOcupacionais"
            label="Unidades ocupacionais"
            options={toOptions(UNIDADES_OCUPACIONAIS)}
          />
          <MultiSelectField
            control={form.control}
            name="eixosFuncionais"
            label="Eixos funcionais"
            options={toOptions(EIXOS_FUNCIONAIS)}
          />
          <MultiSelectField
            control={form.control}
            name="componenteIds"
            label="Componentes curriculares"
            hint="Complementa a organização, se a escola quiser — não é obrigatório na EJA."
            options={componenteOptions}
            optional
          />
        </div>
      )}
    </Card>
  );
}
