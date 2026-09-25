"use client";

import { useState } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { PageActionButtons } from "@/components/layout/page-action-buttons";
import { PageActionsProvider, usePageActions } from "@/components/layout/page-actions-context";
import { PageTitleProvider } from "@/components/layout/page-title-context";
import { Toaster } from "@/components/ui/toaster";

export function AppShell({
  userName,
  userEmail,
  escolaNome,
  children,
}: {
  userName: string;
  userEmail: string;
  escolaNome: string | null;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <PageTitleProvider>
      <PageActionsProvider>
        {/* `fixed inset-0` tira o shell do fluxo do documento (imune a
            scroll do <html>/<body>). Os wrappers internos usam
            `overflow-clip`, não `overflow-hidden` — "hidden" ainda permite
            scrollTop programático (é o que um scrollIntoView nativo usa pra
            tentar trazer o botão de submit de volta à vista depois de um
            router.refresh()), então mesmo escondido ele vira alvo válido de
            scroll; "clip" recusa ter uma scroll box, então não sobra
            nenhum container pra esse scroll "pousar" — só o <main>
            (overflow-y-auto) é rolável de verdade. Ver também
            refreshAndBlur() em lib/utils.ts. */}
        <div className="fixed inset-0 flex overflow-clip">
          <AppSidebar
            open={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
            escolaNome={escolaNome}
          />

          <div className="flex min-w-0 flex-1 flex-col overflow-clip">
            <AppTopbar
              userName={userName}
              userEmail={userEmail}
              onMenuClick={() => setMobileNavOpen(true)}
            />
            <main className="min-h-0 flex-1 overflow-y-auto bg-bg px-2 py-4 md:px-6 md:py-6">
              {children}
            </main>
            <MobileActionBar />
          </div>
        </div>

        <Toaster />
      </PageActionsProvider>
    </PageTitleProvider>
  );
}

/**
 * No mobile, o par Cancelar/Salvar da página sai da topbar e fica numa
 * barra no rodapé (irmã do <main>, não `fixed` — o <main> encolhe e o
 * conteúdo nunca fica escondido atrás dela).
 */
function MobileActionBar() {
  const actions = usePageActions();
  if (!actions) return null;

  return (
    <PageActionButtons
      actions={actions}
      className="shrink-0 border-t border-line bg-surface px-2 pt-[12px] pb-[max(12px,env(safe-area-inset-bottom))] md:hidden"
      buttonClassName="flex-1"
    />
  );
}
