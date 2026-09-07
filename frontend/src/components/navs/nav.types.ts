import type { TablerIcon } from "@tabler/icons-react";

export interface NavSubItem {
  title: string;
  url: string;
}

export interface NavItem {
  title: string;
  url: string;
  icon: TablerIcon;
  isActive?: boolean;
  items?: NavSubItem[];
  /** Si true, l'élément n'est visible que pour les administrateurs. */
  adminOnly?: boolean;
}