import {
  ClipboardList,
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
