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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { DIAS_SEMANA } from "@/lib/ofertas-config";
import { frequenciaSemanalLabel, type UpdateTurmaValues } from "@/app/(app)/turmas/schema";

/**
 * Cronograma de atendimento — só aparece quando a forma de funcionamento é
 * "Por cronograma". O cronograma é da turma; o estudante não tem cronograma
 * próprio.
 */
// PROVISÓRIO: validar com P.O — não valida se o horário cabe no turno da
// turma, e o cronograma é só da turma (sem cronograma individual do estudante).
export function CronogramaCard({
  numero,
  form,
}: {
  numero: number;
  form: UseFormReturn<UpdateTurmaValues>;
}) {
  const dias = form.watch("cronogramaDias");

  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">{numero}.</span> Cronograma de atendimento
      </h2>

      <FormField
        control={form.control}
        name="cronogramaDias"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dias de atendimento</FormLabel>
            <div className="grid rounded-sm border border-line px-[10px] sm:grid-cols-5">
              {DIAS_SEMANA.map((dia, index) => (
                <label
                  key={dia.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-[10px] py-[9px] text-[14px] text-ink",
                    index > 0 && "border-t border-line sm:border-t-0",
                  )}
                >
                  <Checkbox
                    checked={field.value.includes(dia.value)}
                    onCheckedChange={() =>
                      field.onChange(
                        field.value.includes(dia.value)
                          ? field.value.filter((v) => v !== dia.value)
                          : [...field.value, dia.value].sort((a, b) => a - b),
                      )
                    }
                  />
                  {dia.label}
                </label>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="cronogramaHoraInicio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário inicial</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cronogramaHoraFim"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário final</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid content-start gap-2">
          <Label htmlFor="turma-frequencia-semanal">Frequência semanal</Label>
          <Input id="turma-frequencia-semanal" value={frequenciaSemanalLabel(dias.length)} disabled readOnly />
          <p className="text-[12.5px] text-muted">Calculada pelos dias marcados.</p>
        </div>
      </div>
    </Card>
  );
}
