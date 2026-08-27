import type { Control } from "react-hook-form";
import { Info } from "lucide-react";

import { Card } from "@/components/ui/card";
import { CpfInput } from "@/components/ui/cpf-input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";

import type { MantenedoraValues } from "@/app/(app)/minha-escola/schema";

export function MantenedoraRepresentacaoLegalCard({
  control,
}: {
  control: Control<MantenedoraValues>;
}) {
  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">3.</span> Representação legal
      </h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={control}
          name="presidenteNome"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Nome do(a) presidente</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="presidenteCpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF do(a) presidente</FormLabel>
              <FormControl>
                <CpfInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="presidenteFone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone do(a) presidente</FormLabel>
              <FormControl>
                <PhoneInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="presidenteEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail do(a) presidente</FormLabel>
              <FormControl>
                <Input type="email" placeholder="voce@email.com.br" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex gap-[10px] rounded-md bg-brand-tint px-[14px] py-[12px] text-brand-ink">
        <Info size={15} strokeWidth={2} className="mt-[1px] shrink-0 text-brand" aria-hidden="true" />
        <p className="text-[13px] leading-relaxed">
          O presidente cadastrado representa a mantenedora, não substitui a direção da escola.
        </p>
      </div>
    </Card>
  );
}
