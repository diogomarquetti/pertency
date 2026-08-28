"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, X } from "lucide-react";

import { LogoHorizontal } from "@/components/brand/logo-horizontal";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/layout/nav-items";

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-[9px] rounded-sm px-[12px] py-1 text-[13.5px] font-medium transition-colors duration-fast ease-standard",
              isActive
                ? "bg-blue-500/16 text-white [&_svg]:text-blue-100"
                : "text-white/68 hover:bg-white/6 hover:text-white",
            )}
          >
            <Icon size={20} strokeWidth={2} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function EscolaAtivaFooter({ escolaNome }: { escolaNome: string | null }) {
  if (!escolaNome) return null;

  return (
    <div className="border-t border-white/8 p-[16px]">
      <div className="flex items-center gap-[10px] rounded-sm bg-white/5 px-[12px] py-[10px]">
        <div className="flex size-[32px] shrink-0 items-center justify-center rounded-sm bg-white/8">
          <Building2 size={16} strokeWidth={2} className="text-white" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="text-[12.5px] font-medium text-white/55">Escola ativa</div>
          <div className="truncate text-[13.5px] font-semibold text-white">{escolaNome}</div>
        </div>
      </div>
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
  return (
    <>
      <aside className="hidden w-[var(--sidebar-w)] shrink-0 flex-col overflow-y-auto bg-navy md:flex">
        <div className="mb-2 flex h-[var(--topbar-h)] shrink-0 items-center px-[26px]">
          <LogoHorizontal variant="dark" className="h-[23px] w-auto" />
        </div>
        <div className="flex-1 overflow-y-auto px-[14px]">
          <Nav />
        </div>
        <EscolaAtivaFooter escolaNome={escolaNome} />
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
            <Nav onNavigate={onClose} />
          </div>
          <EscolaAtivaFooter escolaNome={escolaNome} />
        </aside>
      </div>
    </>
  );
}
