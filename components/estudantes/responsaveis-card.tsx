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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { PARENTESCO_OPTIONS, type UpdateEstudanteValues } from "@/app/(app)/estudantes/schema";

export function ResponsaveisCard({ control }: { control: Control<UpdateEstudanteValues> }) {
  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">3.</span> Responsáveis e contatos
      </h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={control}
          name="responsavelPrincipalNome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável principal</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="responsavelPrincipalParentesco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parentesco</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PARENTESCO_OPTIONS.map((parentesco) => (
                    <SelectItem key={parentesco} value={parentesco}>
                      {parentesco}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="responsavelPrincipalTelefone"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Telefone principal</FormLabel>
              <FormControl>
                <PhoneInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="segundoResponsavelNome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Segundo responsável <span className="font-normal text-muted">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="segundoResponsavelParentesco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Parentesco <span className="font-normal text-muted">(opcional)</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PARENTESCO_OPTIONS.map((parentesco) => (
                    <SelectItem key={parentesco} value={parentesco}>
                      {parentesco}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="segundoResponsavelTelefone"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>
                Telefone do segundo responsável{" "}
                <span className="font-normal text-muted">(opcional)</span>
              </FormLabel>
              <FormControl>
                <PhoneInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="filiacao"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Filiação</FormLabel>
              <FormControl>
                <Input placeholder="Nome do pai e da mãe, conforme documentação" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="quemPodeRetirar"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Quem pode retirar o estudante</FormLabel>
              <FormControl>
                <Textarea placeholder="Nomes das pessoas autorizadas a retirar o estudante" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="contatoEmergencia"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Contato de emergência</FormLabel>
              <FormControl>
                <Input placeholder="Nome e telefone" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Card>
  );
}
