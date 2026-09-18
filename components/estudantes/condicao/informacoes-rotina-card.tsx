"use client";

import type { UseFormReturn } from "react-hook-form";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import {
  AVD_CHECKLIST_OPTIONS,
  MEIO_COMUNICACAO_OPTIONS,
  RECURSO_CAA_OPTIONS,
  RECURSOS_ACESSIBILIDADE_OPTIONS,
  type PerfilFuncionalValues,
} from "@/app/(app)/estudantes/perfil-funcional-schema";

function toggleValue(current: string[], value: string) {
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

function CheckboxList({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="rounded-sm border border-line px-[10px]">
      {options.map((option, index) => (
        <label
          key={option}
          className={cn(
            "flex cursor-pointer items-center gap-[10px] py-[9px] text-[14px] text-ink",
            index > 0 && "border-t border-line",
          )}
        >
          <Checkbox checked={value.includes(option)} onCheckedChange={() => onChange(toggleValue(value, option))} />
          {option}
        </label>
      ))}
    </div>
  );
}

export function InformacoesRotinaCard({ form }: { form: UseFormReturn<PerfilFuncionalValues> }) {
  const apoioAvd = form.watch("apoioAvd");
  const necessitaMedicacao = form.watch("necessitaMedicacao");

  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">2.</span> Informações importantes para a rotina escolar
      </h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="meioComunicacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Meio de comunicação predominante <span className="font-normal text-muted">(opcional)</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MEIO_COMUNICACAO_OPTIONS.map((opcao) => (
                    <SelectItem key={opcao.value} value={opcao.value}>
                      {opcao.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="recursosCaa"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Recurso de Comunicação Aumentativa e Alternativa (CAA) utilizado{" "}
              <span className="font-normal text-muted">(opcional)</span>
            </FormLabel>
            <CheckboxList options={RECURSO_CAA_OPTIONS} value={field.value} onChange={field.onChange} />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="apoioAlimentacao"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-sm border border-line px-[14px] py-[11px] space-y-0">
              <FormLabel className="font-normal">Apoio para alimentação</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="apoioHigiene"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-sm border border-line px-[14px] py-[11px] space-y-0">
              <FormLabel className="font-normal">Apoio para higiene</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="apoioLocomocao"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-sm border border-line px-[14px] py-[11px] space-y-0">
              <FormLabel className="font-normal">Apoio para locomoção</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="apoioAvd"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-sm border border-line px-[14px] py-[11px] space-y-0">
            <FormLabel className="font-normal">Necessita apoio em outras atividades de vida diária?</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      {apoioAvd && (
        <FormField
          control={form.control}
          name="apoioAvdChecklist"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quais atividades</FormLabel>
              <CheckboxList options={AVD_CHECKLIST_OPTIONS} value={field.value} onChange={field.onChange} />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="alergiasRestricoes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Alergias e restrições relevantes para a rotina escolar{" "}
              <span className="font-normal text-muted">(opcional)</span>
            </FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="necessitaMedicacao"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-sm border border-line px-[14px] py-[11px] space-y-0">
            <FormLabel className="font-normal">Necessita medicação durante o período escolar?</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      {necessitaMedicacao && (
        <FormField
          control={form.control}
          name="medicacaoDetalhes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Informações adicionais autorizadas pela escola{" "}
                <span className="font-normal text-muted">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Textarea placeholder="Sem prontuário ou prescrição detalhada…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="recursosAcessibilidade"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Recursos de acessibilidade e apoio utilizados{" "}
              <span className="font-normal text-muted">(opcional)</span>
            </FormLabel>
            <CheckboxList options={RECURSOS_ACESSIBILIDADE_OPTIONS} value={field.value} onChange={field.onChange} />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="outrasInformacoes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Outras informações relevantes para a rotina escolar{" "}
              <span className="font-normal text-muted">(opcional)</span>
            </FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Card>
  );
}
