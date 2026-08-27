"use client";

import { useEffect } from "react";

import {
  usePageBreadcrumbSetter,
  usePageTitleSetter,
  type BreadcrumbItem,
} from "@/components/layout/page-title-context";

/**
 * Declara o título (e, opcionalmente, o breadcrumb) da página atual para o
 * AppTopbar exibir — cada página (Server Component) renderiza
 * <PageTitle value="..." /> em vez de um <h1> próprio, já que o topbar vive
 * fora da árvore da página.
 */
export function PageTitle({
  value,
  breadcrumb,
}: {
  value: string;
  breadcrumb?: BreadcrumbItem[];
}) {
  const setTitle = usePageTitleSetter();
  const setBreadcrumb = usePageBreadcrumbSetter();

  useEffect(() => {
    setTitle(value);
    setBreadcrumb(breadcrumb ?? []);
    return () => {
      setTitle("");
      setBreadcrumb([]);
    };
  }, [value, breadcrumb, setTitle, setBreadcrumb]);

  return null;
}
