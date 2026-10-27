"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ORIGEM } from "@/components/inicio/pendencia-item";
import type { NotificacoesDoUsuario } from "@/lib/notificacoes";
import { carregarNotificacoes, marcarComoLida, marcarTodasComoLidas } from "@/lib/notificacoes/actions";

const FUSO = "America/Sao_Paulo";
const formatoDia = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, day: "2-digit", month: "2-digit" });

function tempoCurto(iso: string, agora: number): string {
  const minutos = Math.max(0, Math.floor((agora - Date.parse(iso)) / 60_000));
  if (minutos < 1) return "agora";
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return "ontem";
  if (dias < 7) return `há ${dias} dias`;
  return formatoDia.format(new Date(iso));
}

/**
 * Sino da topbar. Mostra acontecimentos (alguém fez algo que muda o seu
 * trabalho) — o que falta fazer continua na homepage. O ponto vermelho
 * indica notificação não lida. O layout não re-renderiza ao trocar de
 * página, então o sino recarrega a cada navegação e ao abrir.
 */
export function NotificacoesMenu({ inicial }: { inicial: NotificacoesDoUsuario }) {
  const [notificacoes, setNotificacoes] = useState(inicial);
  const [aberto, setAberto] = useState(false);
  // Referência do "há X min", atualizada a cada recarga do sino.
  const [agora, setAgora] = useState(() => Date.now());
  const [, startTransition] = useTransition();
  const pathname = usePathname();

  useEffect(() => {
    let ativo = true;
    carregarNotificacoes().then((novas) => {
      if (!ativo) return;
      setNotificacoes(novas);
      setAgora(Date.now());
    });
    return () => {
      ativo = false;
    };
  }, [pathname, aberto]);

  function marcarLidaLocal(id?: string) {
    setNotificacoes((atual) => {
      const itens = atual.itens.map((item) => (!id || item.id === id ? { ...item, lida: true } : item));
      return { itens, naoLidas: itens.filter((item) => !item.lida).length };
    });
  }

  const { itens, naoLidas } = notificacoes;

  return (
    <DropdownMenu open={aberto} onOpenChange={setAberto}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={
            naoLidas > 0 ? `Notificações (${naoLidas} ${naoLidas === 1 ? "não lida" : "não lidas"})` : "Notificações"
          }
          className="relative flex size-[36px] items-center justify-center rounded-sm border border-line bg-surface text-muted transition-colors duration-fast ease-standard hover:border-brand hover:bg-brand-tint hover:text-brand-ink data-[state=open]:border-brand data-[state=open]:bg-brand-tint data-[state=open]:text-brand-ink"
        >
          <Bell size={16} strokeWidth={2} aria-hidden="true" />
          {naoLidas > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-[5px] right-[6px] size-[8px] rounded-full border-2 border-surface bg-danger"
            />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[340px] max-w-[calc(100vw-32px)] p-0">
        <div className="flex items-center justify-between gap-2 px-[12px] py-[10px]">
          <DropdownMenuLabel className="p-0 text-[14.5px] font-semibold text-ink">Notificações</DropdownMenuLabel>
          {naoLidas > 0 && (
            <button
              type="button"
              className="text-[12.5px] font-semibold text-brand hover:underline"
              onClick={() => {
                marcarLidaLocal();
                startTransition(() => marcarTodasComoLidas());
              }}
            >
              Marcar todas como lidas
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="my-0" />

        {itens.length === 0 ? (
          <p className="px-[12px] py-4 text-center text-[13px] text-muted">Nenhuma notificação por aqui.</p>
        ) : (
          <div className="max-h-[min(420px,70vh)] overflow-y-auto p-1">
            {itens.map((item) => {
              const Icone = ORIGEM[item.origem].icone;
              return (
                <DropdownMenuItem
                  key={item.id}
                  asChild
                  onSelect={() => {
                    if (item.lida) return;
                    marcarLidaLocal(item.id);
                    startTransition(() => marcarComoLida(item.id));
                  }}
                >
                  <Link href={item.destino} className="items-start gap-[10px] py-[8px]">
                    <span
                      className={cn(
                        "mt-[1px] flex size-[28px] shrink-0 items-center justify-center rounded-full",
                        item.lida ? "bg-bg text-muted" : "bg-brand-tint text-brand-ink",
                      )}
                    >
                      <Icone size={14} strokeWidth={2} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-[13.5px]",
                          item.lida ? "font-medium text-muted" : "font-semibold text-ink",
                        )}
                      >
                        {item.titulo}
                      </span>
                      <span className="block truncate text-[12.5px] font-normal text-muted">
                        {item.sujeito ? `${item.sujeito} · ` : ""}
                        {tempoCurto(item.criadaEm, agora)}
                      </span>
                    </span>
                    {!item.lida && (
                      <span className="mt-[6px] size-[8px] shrink-0 rounded-full bg-brand">
                        <span className="sr-only">Não lida</span>
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
