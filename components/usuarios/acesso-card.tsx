"use client";

import { useState, useTransition } from "react";
import type { Control } from "react-hook-form";
import { Link2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/use-toast";

import { gerarLinkAcesso } from "@/app/(app)/usuarios/actions";
import type { UpdateUsuarioValues } from "@/app/(app)/usuarios/schema";

type AcessoCardProps = {
  control: Control<UpdateUsuarioValues>;
} & ({ mode: "create" } | { mode: "edit"; usuarioId: string });

export function AcessoCard(props: AcessoCardProps) {
  const [link, setLink] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleGerarLink() {
    if (props.mode !== "edit") return;
    setCopiado(false);

    startTransition(async () => {
      const result = await gerarLinkAcesso(props.usuarioId);
      if ("error" in result) {
        toast.error("Não foi possível gerar o link", result.error);
        return;
      }
      setLink(result.link);
    });
  }

  async function handleCopiar() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">3.</span> Acesso
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
          <>
            <div className="flex items-center justify-between gap-[10px] rounded-sm border border-line bg-bg px-[14px] py-[10px]">
              <span className="truncate text-[13.5px] font-medium text-brand-ink">
                {link ?? "Link não gerado"}
              </span>
              {link ? (
                <Button type="button" variant="secondary" size="sm" onClick={handleCopiar}>
                  {copiado ? "Copiado!" : "Copiar"}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isPending}
                  onClick={handleGerarLink}
                >
                  {isPending ? (
                    <Loader2 className="animate-spin" size={14} strokeWidth={2} aria-hidden="true" />
                  ) : (
                    <Link2 size={14} strokeWidth={2} aria-hidden="true" />
                  )}
                  Gerar link
                </Button>
              )}
            </div>
            <p className="text-[12.5px] leading-relaxed text-muted">
              O usuário recebe este link e define a própria senha no primeiro acesso. Copie e
              envie por onde preferir — e-mail, WhatsApp, etc.
            </p>
          </>
        )}
      </div>
    </Card>
  );
}
