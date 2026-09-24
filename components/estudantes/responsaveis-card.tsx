"use client";

import { useEffect, useRef } from "react";
import { useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

import { PARENTESCO_OPTIONS, type UpdateEstudanteValues } from "@/app/(app)/estudantes/schema";

type CampoFiliacao = "filiacaoMae" | "filiacaoPai";

/**
 * Sugere o nome de filiação a partir dos responsáveis com parentesco Mãe/Pai
 * (principal tem prioridade sobre o segundo). Só escreve no campo se ele
 * estiver vazio ou ainda tiver a sugestão anterior — nunca sobrescreve o que
 * o usuário digitou à mão. No carregamento não mexe em nada: a primeira
 * sugestão vira a "anterior" e só mudanças nos responsáveis disparam escrita.
 */
function useFiliacaoSugerida(form: UseFormReturn<UpdateEstudanteValues>) {
  const [principalNome, principalParentesco, segundoNome, segundoParentesco] = useWatch({
    control: form.control,
    name: [
      "responsavelPrincipalNome",
      "responsavelPrincipalParentesco",
      "segundoResponsavelNome",
      "segundoResponsavelParentesco",
    ],
  });

  function sugerir(parentesco: string) {
    if (principalParentesco === parentesco && principalNome?.trim()) return principalNome.trim();
    if (segundoParentesco === parentesco && segundoNome?.trim()) return segundoNome.trim();
    return "";
  }

  const sugestoes: Record<CampoFiliacao, string> = {
    filiacaoMae: sugerir("Mãe"),
    filiacaoPai: sugerir("Pai"),
  };
  const ultimaSugestao = useRef(sugestoes);

  useEffect(() => {
    for (const campo of ["filiacaoMae", "filiacaoPai"] as const) {
      const anterior = ultimaSugestao.current[campo];
      const nova = sugestoes[campo];
      if (nova === anterior) continue;

      const atual = form.getValues(campo) ?? "";
      if (!atual || atual === anterior) {
        form.setValue(campo, nova, {
          shouldDirty: true,
          shouldValidate: form.formState.isSubmitted,
        });
      }
      ultimaSugestao.current[campo] = nova;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sugestoes.filiacaoMae, sugestoes.filiacaoPai]);
}

/**
 * Pessoas autorizadas a retirar o estudante: os responsáveis já cadastrados
 * entram como checkbox (nome/parentesco vêm dos campos acima, sem redigitar)
 * e outras pessoas numa lista Nome | Vínculo | Telefone. O segundo
 * responsável só aparece quando preenchido.
 */
function AutorizadosRetirada({ form }: { form: UseFormReturn<UpdateEstudanteValues> }) {
  const { control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "autorizadosRetirada",
  });
  const [principalNome, principalParentesco, segundoNome, segundoParentesco] = useWatch({
    control,
    name: [
      "responsavelPrincipalNome",
      "responsavelPrincipalParentesco",
      "segundoResponsavelNome",
      "segundoResponsavelParentesco",
    ],
  });

  function rotuloResponsavel(
    nome: string | undefined,
    parentesco: string | undefined,
    padrao: string,
  ) {
    return [nome?.trim() || padrao, parentesco].filter(Boolean).join(" · ");
  }

  return (
    <div className="flex flex-col gap-3 sm:col-span-2">
      <span className="text-label text-ink">
        Pessoas autorizadas a retirar o estudante
      </span>

      <FormField
        control={control}
        name="responsavelPrincipalPodeRetirar"
        render={({ field }) => (
          <FormItem className="space-y-0">
            <div className="rounded-sm border border-line px-[10px]">
              <label className="flex cursor-pointer items-center gap-[10px] py-[9px] text-[14px] text-ink">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                {rotuloResponsavel(principalNome, principalParentesco, "Responsável principal")}
              </label>
              {segundoNome?.trim() && (
                <FormField
                  control={control}
                  name="segundoResponsavelPodeRetirar"
                  render={({ field: segundoField }) => (
                    <label className="flex cursor-pointer items-center gap-[10px] border-t border-line py-[9px] text-[14px] text-ink">
                      <Checkbox
                        checked={segundoField.value}
                        onCheckedChange={(checked) => segundoField.onChange(checked === true)}
                      />
                      {rotuloResponsavel(segundoNome, segundoParentesco, "Segundo responsável")}
                    </label>
                  )}
                />
              )}
            </div>
            <FormMessage className="mt-2" />
          </FormItem>
        )}
      />

      {fields.map((item, index) => {
        // Rótulos das colunas só na primeira linha — nas seguintes ficam
        // só pra leitor de tela, como um cabeçalho de tabela.
        const labelClassName = index === 0 ? "sr-only sm:not-sr-only" : "sr-only";
        return (
          <div
            key={item.id}
            className="grid items-start gap-3 sm:grid-cols-[minmax(0,1fr)_180px_180px_auto]"
          >
            <FormField
              control={control}
              name={`autorizadosRetirada.${index}.nome`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClassName}>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`autorizadosRetirada.${index}.vinculo`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClassName}>Vínculo</FormLabel>
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
              name={`autorizadosRetirada.${index}.telefone`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClassName}>Telefone</FormLabel>
                  <FormControl>
                    <PhoneInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              icon
              onClick={() => remove(index)}
              aria-label="Remover pessoa autorizada"
              className={index === 0 ? "sm:mt-[26px]" : undefined}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        );
      })}

      <div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => append({ nome: "", vinculo: "", telefone: "" })}
        >
          <Plus aria-hidden="true" />
          Adicionar pessoa autorizada
        </Button>
      </div>
    </div>
  );
}

export function ResponsaveisCard({ form }: { form: UseFormReturn<UpdateEstudanteValues> }) {
  const { control } = form;
  useFiliacaoSugerida(form);

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
          name="filiacaoMae"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Filiação — Mãe</FormLabel>
              <FormControl>
                <Input placeholder="Conforme documentação" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="filiacaoPai"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Filiação — Pai</FormLabel>
              <FormControl>
                <Input placeholder="Conforme documentação" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <AutorizadosRetirada form={form} />

        <FormField
          control={control}
          name="contatoEmergenciaNome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do contato de emergência</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="contatoEmergenciaTelefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone do contato de emergência</FormLabel>
              <FormControl>
                <PhoneInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Card>
  );
}
