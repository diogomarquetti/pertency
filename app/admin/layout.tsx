import type { Metadata } from "next";

// Admin da plataforma (admin.pertency.com.br). No domínio do admin, o proxy
// reescreve /escolas para /admin/escolas; no app das escolas, /admin não
// existe (ver lib/supabase/session.ts).
export const metadata: Metadata = {
  title: "Pertency Admin",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
