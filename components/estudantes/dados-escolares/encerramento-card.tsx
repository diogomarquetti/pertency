"use client";

import type { UseFormReturn } from "react-hook-form";

import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  MOTIVO_ENCERRAMENTO_OPTIONS,
  type DadosEscolaresValues,
} from "@/app/(app)/estudantes/dados-escolares-schema";

/** Só aparece com situação Transferido, Desligado ou Inativo (ver situacaoTemEncerramento). */
export function EncerramentoCard({
  form,
  numero,
}: {
  form: UseFormReturn<DadosEscolaresValues>;
  numero: number;
}) {
  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">{numero}.</span> Encerramento
      </h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="dataEncerramento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de encerramento</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="motivoEncerramento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo do encerramento</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MOTIVO_ENCERRAMENTO_OPTIONS.map((opcao) => (
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
    </Card>
  );
}
