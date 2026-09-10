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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  AREAS_CONHECIMENTO_EF,
  AREAS_CONHECIMENTO_EJA,
  CAMPOS_EXPERIENCIA,
  DIREITOS_APRENDIZAGEM,
  EIXO_ESTRUTURANTE_EI,
  EIXOS_FUNCIONAIS,
  UNIDADES_OCUPACIONAIS,
  getEtapasDoCiclo,
  type UpdateTurmaValues,
} from "@/app/(app)/turmas/schema";
import type { ReferenciaTurmaForm } from "@/app/(app)/turmas/queries";

type MultiSelectName =
  | "camposExperiencias"
  | "direitosAprendizagem"
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

export function EstruturaCurricularCard({
  form,
  referencia,
}: {
  form: UseFormReturn<UpdateTurmaValues>;
  referencia: ReferenciaTurmaForm;
}) {
  const ofertaSlug = form.watch("ofertaSlug");
  const organizacaoId = form.watch("organizacaoId");
  const organizacaoNome = referencia.organizacoes.find((o) => o.id === organizacaoId)?.nome;
  const etapasDoCiclo = getEtapasDoCiclo(organizacaoNome);
  const componenteOptions = referencia.componentes.map((c) => ({ value: c.id, label: c.nome }));

  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">3.</span> Estrutura curricular
      </h2>

      {!ofertaSlug && (
        <p className="text-[13px] text-muted">
          Selecione a oferta no bloco anterior para configurar a estrutura curricular da turma.
        </p>
      )}

      {ofertaSlug === "ei" && (
        <div className="flex flex-col gap-5">
          <MultiSelectField
            control={form.control}
            name="camposExperiencias"
            label="Campos de experiências"
            options={toOptions(CAMPOS_EXPERIENCIA)}
          />
          <MultiSelectField
            control={form.control}
            name="direitosAprendizagem"
            label="Direitos de aprendizagem"
            options={toOptions(DIREITOS_APRENDIZAGEM)}
          />
          <div className="grid gap-2">
            <Label>Eixos estruturantes</Label>
            <div className="inline-flex w-fit items-center gap-2 rounded-sm border border-dashed border-line bg-bg px-[14px] py-[9px] text-[14px] font-semibold text-ink">
              {EIXO_ESTRUTURANTE_EI}
            </div>
          </div>
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

      {ofertaSlug === "ef" && (
        <div className="flex flex-col gap-5">
          <FormField
            control={form.control}
            name="etapaDoCiclo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Etapa do ciclo</FormLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={etapasDoCiclo.length === 0}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          organizacaoId ? "Selecione…" : "Selecione a organização da oferta primeiro"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {etapasDoCiclo.map((etapa) => (
                      <SelectItem key={etapa} value={etapa}>
                        {etapa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <MultiSelectField
            control={form.control}
            name="areasConhecimento"
            label="Áreas do conhecimento"
            options={toOptions(AREAS_CONHECIMENTO_EF)}
          />
          <MultiSelectField
            control={form.control}
            name="componenteIds"
            label="Componentes curriculares"
            options={componenteOptions}
          />
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
