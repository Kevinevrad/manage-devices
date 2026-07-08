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
}
