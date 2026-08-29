"use client";

import { useState } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { PageActionsProvider } from "@/components/layout/page-actions-context";
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
        <div className="flex h-screen flex-1 overflow-hidden">
          <AppSidebar
            open={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
            escolaNome={escolaNome}
          />

          <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
            <AppTopbar
              userName={userName}
              userEmail={userEmail}
              onMenuClick={() => setMobileNavOpen(true)}
            />
            <main className="min-h-0 flex-1 overflow-y-auto bg-bg px-4 py-4 md:px-6 md:py-6">
              {children}
            </main>
          </div>
        </div>

        <Toaster />
      </PageActionsProvider>
    </PageTitleProvider>
  );
}
