"use client";

import { useState, useTransition } from "react";
import { Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/lib/use-toast";

export type GerarLink = () => Promise<{ link: string } | { error: string }>;

/**
 * Caixa "Gerar link / Copiar" do link de acesso — usada no bloco Acesso do
 * Cadastro de Usuários e, no admin da plataforma, para operadores e para o
 * administrador da escola. Não persiste nada: cada clique gera um link novo.
 */
export function LinkDeAcesso({ gerar }: { gerar: GerarLink }) {
  const [link, setLink] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleGerarLink() {
    setCopiado(false);
    startTransition(async () => {
      const result = await gerar();
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
    <>
      <div className="flex items-center justify-between gap-[10px] rounded-sm border border-line bg-bg px-[14px] py-[10px]">
        <span className="truncate text-[13.5px] font-medium text-brand-ink">{link ?? "Link não gerado"}</span>
        {link ? (
          <Button type="button" variant="secondary" size="sm" onClick={handleCopiar}>
            {copiado ? "Copiado!" : "Copiar"}
          </Button>
        ) : (
          <Button type="button" variant="secondary" size="sm" loading={isPending} onClick={handleGerarLink}>
            <Link2 size={14} strokeWidth={2} aria-hidden="true" />
            Gerar link
          </Button>
        )}
      </div>
      <p className="text-[12.5px] leading-relaxed text-muted">
        O usuário recebe este link e define a própria senha no primeiro acesso. Copie e envie por
        onde preferir — e-mail, WhatsApp, etc.
      </p>
    </>
  );
}
