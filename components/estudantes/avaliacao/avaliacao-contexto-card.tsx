import type { Control } from "react-hook-form";

import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

import type { AvaliacaoValues } from "@/app/(app)/estudantes/avaliacao-schema";

export function AvaliacaoContextoCard({ control }: { control: Control<AvaliacaoValues> }) {
  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">4.</span> Contexto
      </h2>

      <FormField
        control={control}
        name="contextoEscolar"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contexto escolar</FormLabel>
            <FormControl>
              <Textarea placeholder="Estrutura, rotinas e apoios existentes…" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="contextoFamiliar"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contexto familiar</FormLabel>
            <FormControl>
              <Textarea placeholder="Práticas educativas e apoio à aprendizagem…" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="contextoComunitario"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contexto comunitário</FormLabel>
            <FormControl>
              <Textarea placeholder="Acessos, interações e atividades…" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="fatoresFacilitadores"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Fatores facilitadores <span className="font-normal text-muted">(opcional)</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Elementos que favorecem desenvolvimento e participação…"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="barreirasIdentificadas"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Barreiras identificadas <span className="font-normal text-muted">(opcional)</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Elementos que dificultam aprendizagem, participação e permanência…"
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
