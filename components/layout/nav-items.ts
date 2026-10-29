import {
  Building2,
  ClipboardList,
  Landmark,
  LayoutDashboard,
  Presentation,
  Settings,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Início", icon: LayoutDashboard },
  { href: "/estudantes", label: "Estudantes", icon: Users },
  { href: "/planejamentos", label: "Planejamentos", icon: ClipboardList },
  { href: "/turmas", label: "Turmas", icon: Presentation },
  { href: "/usuarios", label: "Usuários", icon: UserCog },
  { href: "/minha-escola", label: "Configurações", icon: Settings },
];

/** Admin da plataforma (admin.pertency.com.br) — só para operadores. */
export const NAV_ITEMS_PLATAFORMA: NavItem[] = [
  { href: "/escolas", label: "Escolas", icon: Building2 },
  { href: "/mantenedoras", label: "Mantenedoras", icon: Landmark },
  { href: "/usuarios", label: "Usuários", icon: UserCog },
];

export type AreaApp = "escola" | "plataforma";

export const NAV_ITEMS_POR_AREA: Record<AreaApp, NavItem[]> = {
  escola: NAV_ITEMS,
  plataforma: NAV_ITEMS_PLATAFORMA,
};
