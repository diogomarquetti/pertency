import type { Control } from "react-hook-form";

import { Card } from "@/components/ui/card";
import { CnpjInput } from "@/components/ui/cnpj-input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import type { MantenedoraValues } from "@/app/(app)/minha-escola/schema";

export function MantenedoraIdentificacaoCard({
  control,
}: {
  control: Control<MantenedoraValues>;
}) {
  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">1.</span> Identificação
      </h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={control}
          name="razaoSocial"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Razão social</FormLabel>
              <FormControl>
                <Input placeholder="Razão social da mantenedora" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="nomeFantasia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome fantasia</FormLabel>
              <FormControl>
                <Input placeholder="Nome fantasia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <CnpjInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Card>
  );
}
