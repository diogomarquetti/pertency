"use client";

import type { Control } from "react-hook-form";

import { Card } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { gerarLinkAcesso } from "@/app/(app)/usuarios/actions";
import type { UpdateUsuarioValues } from "@/app/(app)/usuarios/schema";

import { LinkDeAcesso } from "./link-de-acesso";

type AcessoCardProps = {
  control: Control<UpdateUsuarioValues>;
  /** Número do bloco — 3 quando o card de Turmas vinculadas aparece (professor), senão 2. */
  numero: number;
} & ({ mode: "create" } | { mode: "edit"; usuarioId: string });

export function AcessoCard(props: AcessoCardProps) {
  // id="acesso": destino da pendência usuario_sem_primeiro_acesso na homepage.
  return (
    <Card id="acesso" className="scroll-mt-2 gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">{props.numero}.</span> Acesso
      </h2>

      <FormField
        control={props.control}
        name="emailLogin"
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-mail de login</FormLabel>
            <FormControl>
              <Input type="email" placeholder="voce@instituicao.org.br" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex flex-col gap-[6px]">
        <label className="text-label text-ink">Convite de acesso</label>

        {props.mode === "create" ? (
          <p className="text-[13px] text-muted">
            Salve o cadastro primeiro para gerar o link de acesso.
          </p>
        ) : (
          <LinkDeAcesso gerar={() => gerarLinkAcesso(props.usuarioId)} />
        )}
      </div>
    </Card>
  );
}
