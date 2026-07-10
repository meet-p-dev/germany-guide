import {
  Compass,
  MapPin,
  GitCompareArrows,
  TriangleAlert,
  Mail,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

/** Primary navigation, shared by the desktop pill nav and the mobile menu. */
export const NAV: NavItem[] = [
  { href: "/process", label: "The process", icon: Compass },
  { href: "/germany", label: "Cities", icon: MapPin },
  { href: "/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/problems", label: "Problems", icon: TriangleAlert },
  { href: "/letters", label: "Letters", icon: Mail },
  { href: "/glossary", label: "Glossary", icon: BookOpen },
];
