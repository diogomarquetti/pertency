"use client";

import type { UseFormReturn } from "react-hook-form";

import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

import type { DadosEscolaresValues } from "@/app/(app)/estudantes/dados-escolares-schema";

export function ObservacoesCard({
  form,
  numero,
}: {
  form: UseFormReturn<DadosEscolaresValues>;
  numero: number;
}) {
  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">{numero}.</span> Observações escolares
      </h2>

      <FormField
        control={form.control}
        name="observacoes"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea
                placeholder="Registre apenas informações relevantes sobre o vínculo escolar que não estejam contempladas nos campos anteriores."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Card>
  );
}
