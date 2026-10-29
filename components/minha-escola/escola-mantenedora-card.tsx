import type { Control } from "react-hook-form";

import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
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

import type { EscolaValues } from "@/app/(app)/minha-escola/schema";

export type MantenedoraOpcao = {
  id: string;
  razaoSocial: string;
  cnpj: string;
  status: "ativa" | "inativa";
};

/** Bloco 4 do cadastro da Escola — só no admin da plataforma. */
export function EscolaMantenedoraCard({
  control,
  mantenedoras,
}: {
  control: Control<EscolaValues>;
  mantenedoras: MantenedoraOpcao[];
}) {
  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">4.</span> Mantenedora
      </h2>

      <FormField
        control={control}
        name="mantenedoraId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mantenedora</FormLabel>
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a mantenedora" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {mantenedoras.map((mantenedora) => (
                  // Inativa não pode ser escolhida, mas continua na lista se já
                  // for a da escola — senão o campo apareceria vazio.
                  <SelectItem
                    key={mantenedora.id}
                    value={mantenedora.id}
                    disabled={mantenedora.status === "inativa" && mantenedora.id !== field.value}
                  >
                    {mantenedora.razaoSocial} · {mantenedora.cnpj}
                    {mantenedora.status === "inativa" && " (inativa)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {mantenedoras.length === 0 && (
              <FormDescription>Nenhuma mantenedora cadastrada. Cadastre em Mantenedoras primeiro.</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </Card>
  );
}
