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

export function AvaliacaoHistoricoCard({ control }: { control: Control<AvaliacaoValues> }) {
  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">2.</span> Histórico e contexto
      </h2>

      <FormField
        control={control}
        name="historicoEscolar"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Breve histórico escolar</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Trajetória escolar, mudanças de escola, frequência, participação, estratégias já utilizadas…"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="informacoesFamilia"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Informações relevantes da família</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Rotina, comunicação, autonomia, interações, expectativas e apoios já utilizados…"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="contextoSociocultural"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contexto sociocultural</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ambiente, recursos disponíveis, condições socioeconômicas e interações comunitárias…"
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
