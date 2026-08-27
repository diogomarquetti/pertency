import type { Control } from "react-hook-form";

import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";

import type { EscolaValues } from "@/app/(app)/minha-escola/schema";

function ResponsavelFields({
  control,
  titulo,
  prefixo,
}: {
  control: Control<EscolaValues>;
  titulo: string;
  prefixo: "diretor" | "coordenador";
}) {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-label text-ink">{titulo}</h3>

      <FormField
        control={control}
        name={`${prefixo}Nome`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome completo</FormLabel>
            <FormControl>
              <Input placeholder="Nome completo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`${prefixo}Fone`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone</FormLabel>
            <FormControl>
              <PhoneInput value={field.value} onChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`${prefixo}Email`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-mail</FormLabel>
            <FormControl>
              <Input type="email" placeholder="voce@instituicao.org.br" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function EscolaResponsaveisCard({ control }: { control: Control<EscolaValues> }) {
  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">3.</span> Responsáveis
      </h2>

      <div className="grid gap-[24px] sm:grid-cols-2">
        <ResponsavelFields control={control} titulo="Diretor(a)" prefixo="diretor" />
        <ResponsavelFields
          control={control}
          titulo="Coordenador(a) pedagógico(a)"
          prefixo="coordenador"
        />
      </div>
    </Card>
  );
}
