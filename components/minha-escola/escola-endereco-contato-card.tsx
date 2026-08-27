import type { Control } from "react-hook-form";

import { CepInput } from "@/components/ui/cep-input";
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

import { UF_OPTIONS, type EscolaValues } from "@/app/(app)/minha-escola/schema";

export function EscolaEnderecoContatoCard({ control }: { control: Control<EscolaValues> }) {
  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">2.</span> Endereço e contato
      </h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={control}
          name="logradouro"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Logradouro</FormLabel>
              <FormControl>
                <Input placeholder="Rua, avenida..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="numero"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número</FormLabel>
              <FormControl>
                <Input placeholder="Número" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="complemento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Complemento <span className="font-normal text-muted">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Sala, bloco, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="bairro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bairro</FormLabel>
              <FormControl>
                <Input placeholder="Bairro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="cep"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP</FormLabel>
              <FormControl>
                <CepInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="municipio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Município</FormLabel>
              <FormControl>
                <Input placeholder="Município" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="uf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UF</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {UF_OPTIONS.map((uf) => (
                    <SelectItem key={uf} value={uf}>
                      {uf}
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
          name="foneInstitucional"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fone institucional</FormLabel>
              <FormControl>
                <PhoneInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="emailInstitucional"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail institucional</FormLabel>
              <FormControl>
                <Input type="email" placeholder="contato@instituicao.org.br" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Card>
  );
}
