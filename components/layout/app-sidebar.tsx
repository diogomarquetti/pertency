"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Menu, X } from "lucide-react";

import { LogoHorizontal } from "@/components/brand/logo-horizontal";
import { Mark } from "@/components/brand/mark";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NAV_ITEMS } from "@/components/layout/nav-items";

const COLLAPSED_STORAGE_KEY = "pertency:sidebar-collapsed";
// `storage` só dispara em OUTRAS abas — pra refletir o toggle na mesma aba
// que escreveu, dispara também esse evento próprio depois de gravar.
const COLLAPSED_CHANGE_EVENT = "pertency:sidebar-collapsed-change";

function subscribeCollapsed(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(COLLAPSED_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(COLLAPSED_CHANGE_EVENT, callback);
  };
}

function getCollapsedSnapshot() {
  return window.localStorage.getItem(COLLAPSED_STORAGE_KEY) === "1";
}

function getCollapsedServerSnapshot() {
  return false;
}

// Mesmo padding em qualquer estado (px-[14px] no container + px-[12px] no
// próprio link/botão = ícone sempre começa a 26px da borda) — isso é o que
// garante que nada "dança" ao abrir/fechar: só o texto some, a coluna de
// ícone nunca muda de lugar.
const ICON_SLOT_CLASSES = "flex items-center justify-center rounded-sm px-[12px] py-1";

function Nav({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        const link = (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            aria-label={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-[13px] rounded-sm px-[12px] py-1 text-[13.5px] font-medium transition-colors duration-fast ease-standard",
              isActive
                ? "bg-blue-500/16 text-white [&_svg]:text-blue-100"
                : "text-white/68 hover:bg-white/6 hover:text-white",
            )}
          >
            <Icon size={20} strokeWidth={2} className="shrink-0" aria-hidden="true" />
            {!collapsed && item.label}
          </Link>
        );

        if (!collapsed) return link;

        return (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}

function EscolaAtivaFooter({
  escolaNome,
  collapsed,
}: {
  escolaNome: string | null;
  collapsed: boolean;
}) {
  if (!escolaNome) return null;

  const icone = (
    <div className="flex size-[32px] shrink-0 items-center justify-center rounded-sm bg-white/8">
      <Building2 size={16} strokeWidth={2} className="text-white" aria-hidden="true" />
    </div>
  );

  return (
    <div className={cn("border-t border-white/8 p-[16px]", collapsed && "flex justify-center px-[14px]")}>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{icone}</div>
          </TooltipTrigger>
          <TooltipContent side="right">{escolaNome}</TooltipContent>
        </Tooltip>
      ) : (
        <div className="flex items-center gap-[10px] rounded-sm bg-white/5 px-[12px] py-[10px]">
          {icone}
          <div className="min-w-0">
            <div className="text-[12.5px] font-medium text-white/55">Escola ativa</div>
            <div className="truncate text-[13.5px] font-semibold text-white">{escolaNome}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppSidebar({
  open,
  onClose,
  escolaNome,
}: {
  open: boolean;
  onClose: () => void;
  escolaNome: string | null;
}) {
  // Preferência só de UI, por navegador — não precisa ir pro servidor.
  // useSyncExternalStore em vez de useState+useEffect: o servidor sempre
  // renderiza expandida (getCollapsedServerSnapshot), e o valor real do
  // localStorage entra assim que hidrata, sem precisar de setState dentro
  // de efeito.
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    getCollapsedSnapshot,
    getCollapsedServerSnapshot,
  );

  function toggleCollapsed() {
    window.localStorage.setItem(COLLAPSED_STORAGE_KEY, collapsed ? "0" : "1");
    window.dispatchEvent(new Event(COLLAPSED_CHANGE_EVENT));
  }

  return (
    <>
      <aside
        className={cn(
          "hidden shrink-0 flex-col overflow-y-auto bg-navy transition-[width] duration-base ease-standard md:flex",
          collapsed ? "w-[var(--sidebar-w-collapsed)]" : "w-[var(--sidebar-w)]",
        )}
      >
        <div className="mb-2 flex h-[var(--topbar-h)] shrink-0 items-center px-[14px]">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleCollapsed}
                  aria-label="Abrir menu"
                  className={cn(ICON_SLOT_CLASSES, "text-white/68 hover:bg-white/6 hover:text-white")}
                >
                  <Mark className="h-[20px] w-auto shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Abrir menu</TooltipContent>
            </Tooltip>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label="Fechar menu"
                className={cn(ICON_SLOT_CLASSES, "text-white/68 hover:bg-white/6 hover:text-white")}
              >
                <Menu size={20} strokeWidth={2} className="shrink-0" aria-hidden="true" />
              </button>
              <LogoHorizontal variant="dark" className="ml-[1px] h-[23px] w-auto" />
            </>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-[14px]">
          <Nav collapsed={collapsed} />
        </div>
        <EscolaAtivaFooter escolaNome={escolaNome} collapsed={collapsed} />
      </aside>

      <div
        className={cn("fixed inset-0 z-40 md:hidden", !open && "pointer-events-none")}
        aria-hidden={!open}
      >
        <div
          onClick={onClose}
          className={cn(
            "absolute inset-0 bg-ink/50 transition-opacity duration-base ease-standard",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[var(--sidebar-w)] flex-col bg-navy shadow-lg transition-transform duration-base ease-standard",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="mb-6 flex h-[var(--topbar-h)] shrink-0 items-center justify-between px-[26px]">
            <LogoHorizontal variant="dark" className="h-[23px] w-auto" />
            <button
              type="button"
              onClick={onClose}
              className="text-white/68 hover:text-white"
              aria-label="Fechar menu"
            >
              <X size={20} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-[14px]">
            <Nav collapsed={false} onNavigate={onClose} />
          </div>
          <EscolaAtivaFooter escolaNome={escolaNome} collapsed={false} />
        </aside>
      </div>
    </>
  );
}
