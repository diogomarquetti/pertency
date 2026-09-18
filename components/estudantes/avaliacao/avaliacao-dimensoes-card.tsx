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

export function AvaliacaoDimensoesCard({ control }: { control: Control<AvaliacaoValues> }) {
  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">3.</span> Análise pedagógica por dimensões
      </h2>

      <FormField
        control={control}
        name="habilidadesConceituais"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Habilidades conceituais</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Atenção, memória, linguagem, leitura, escrita, matemática, raciocínio…"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="habilidadesSociais"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Habilidades sociais</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Interação, regras, comunicação social, participação, comportamento…"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="habilidadesPraticas"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Habilidades práticas</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Autonomia, rotina, autocuidado, organização, mobilidade, funcionalidade…"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="dimensaoParticipacao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dimensão da participação</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Como participa de atividades individuais, coletivas, livres e dirigidas…"
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
