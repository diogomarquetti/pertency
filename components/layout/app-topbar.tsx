"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronRight, HelpCircle, LogOut, Loader2, Menu, User } from "lucide-react";

import { getInitials } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePageActions } from "@/components/layout/page-actions-context";
import { usePageBreadcrumb, usePageTitle } from "@/components/layout/page-title-context";
import { logout } from "@/app/(app)/actions";

export function AppTopbar({
  userName,
  userEmail,
  onMenuClick,
}: {
  userName: string;
  userEmail: string;
  onMenuClick: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const router = useRouter();
  const title = usePageTitle();
  const breadcrumb = usePageBreadcrumb();
  const actions = usePageActions();
  const initials = getInitials(userName || userEmail);

  function proceedCancel() {
    if (actions?.onCancel) {
      actions.onCancel();
    } else if (actions?.cancelHref) {
      router.push(actions.cancelHref);
    }
  }

  function handleCancelClick() {
    if (actions?.isDirty) {
      setShowUnsavedDialog(true);
      return;
    }
    proceedCancel();
  }

  function handleConfirmDiscard() {
    setShowUnsavedDialog(false);
    proceedCancel();
  }

  return (
    <header className="flex h-[var(--topbar-h)] shrink-0 items-center justify-between gap-4 border-b border-line bg-surface px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="text-ink md:hidden"
          aria-label="Abrir menu"
        >
          <Menu size={22} strokeWidth={2} aria-hidden="true" />
        </button>

        <div className="min-w-0">
          {breadcrumb.length > 0 ? (
            <h1 className="flex items-center gap-2 truncate text-[19px] leading-[1.2] font-bold">
              {breadcrumb.map((item, index) => {
                const isLast = index === breadcrumb.length - 1;
                return (
                  <span key={index} className="flex items-center gap-2">
                    {index > 0 && (
                      <ChevronRight
                        size={14}
                        strokeWidth={2}
                        className="shrink-0 text-[#A7B1BE]"
                        aria-hidden="true"
                      />
                    )}
                    {item.href && !isLast ? (
                      <Link href={item.href} className="text-muted hover:text-ink">
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-ink">{item.label}</span>
                    )}
                  </span>
                );
              })}
            </h1>
          ) : (
            title && <h1 className="truncate text-[19px] leading-[1.2] font-bold text-ink">{title}</h1>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {actions && (
          <>
            {(actions.onCancel || actions.cancelHref) && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelClick}
                disabled={actions.pending}
              >
                {actions.cancelLabel ?? "Cancelar"}
              </Button>
            )}
            {!actions.readOnly && (
              <Button type="submit" form={actions.formId} disabled={actions.pending}>
                {actions.pending && (
                  <Loader2 className="animate-spin" size={15} strokeWidth={2} aria-hidden="true" />
                )}
                {actions.saveLabel ?? "Salvar"}
              </Button>
            )}
          </>
        )}

        <button
          type="button"
          aria-label="Notificações"
          className="flex size-[36px] items-center justify-center rounded-sm border border-line bg-surface text-muted transition-colors duration-fast ease-standard hover:border-brand hover:bg-brand-tint hover:text-brand-ink"
        >
          <Bell size={16} strokeWidth={2} aria-hidden="true" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-full outline-none transition-[box-shadow] duration-base ease-standard hover:shadow-[0_0_0_var(--focus-ring-inner)_var(--brand-tint)] focus-visible:shadow-[0_0_0_var(--focus-ring-inner)_var(--brand-tint),0_0_0_var(--focus-ring-outer)_var(--brand)]"
              aria-label="Menu do usuário"
            >
              <Avatar size="md">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{userEmail}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/minha-conta">
                <User size={16} strokeWidth={2} aria-hidden="true" />
                Minha conta
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* Sem destino definido ainda — item mantido desabilitado até termos
                central de ajuda/documentação/e-mail de suporte pra apontar. */}
            <DropdownMenuItem disabled>
              <HelpCircle size={16} strokeWidth={2} aria-hidden="true" />
              Ajuda
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="danger"
              disabled={isPending}
              onSelect={() => startTransition(() => logout())}
            >
              <LogOut size={16} strokeWidth={2} aria-hidden="true" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterações não salvas</AlertDialogTitle>
            <AlertDialogDescription>
              Se sair agora, elas serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDiscard}>Sair sem salvar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
