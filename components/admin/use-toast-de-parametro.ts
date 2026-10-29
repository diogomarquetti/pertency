"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { toast } from "@/lib/use-toast";

/**
 * A criação no admin termina em redirect para a lista com `?<parametro>=1`
 * (Server Action não devolve dado depois de um redirect) — mesmo padrão do
 * `?salvo=1` em usuarios-lista.tsx. Dispara o toast uma vez e limpa a URL; o
 * ref evita disparar duas vezes sob o StrictMode do dev.
 */
export function useToastDeParametro(parametro: string, mensagem: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const disparado = useRef(false);

  useEffect(() => {
    if (searchParams.get(parametro) === "1" && !disparado.current) {
      disparado.current = true;
      toast.success(mensagem);
      router.replace(pathname, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
