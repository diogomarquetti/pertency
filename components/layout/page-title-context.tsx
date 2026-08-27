"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type BreadcrumbItem = { label: string; href?: string };

const PageTitleContext = createContext<string>("");
const PageTitleSetterContext = createContext<(title: string) => void>(() => {});

const PageBreadcrumbContext = createContext<BreadcrumbItem[]>([]);
const PageBreadcrumbSetterContext = createContext<(items: BreadcrumbItem[]) => void>(() => {});

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("");
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);

  return (
    <PageTitleSetterContext.Provider value={setTitle}>
      <PageBreadcrumbSetterContext.Provider value={setBreadcrumb}>
        <PageTitleContext.Provider value={title}>
          <PageBreadcrumbContext.Provider value={breadcrumb}>
            {children}
          </PageBreadcrumbContext.Provider>
        </PageTitleContext.Provider>
      </PageBreadcrumbSetterContext.Provider>
    </PageTitleSetterContext.Provider>
  );
}

export function usePageTitle() {
  return useContext(PageTitleContext);
}

export function usePageTitleSetter() {
  return useContext(PageTitleSetterContext);
}

export function usePageBreadcrumb() {
  return useContext(PageBreadcrumbContext);
}

export function usePageBreadcrumbSetter() {
  return useContext(PageBreadcrumbSetterContext);
}
