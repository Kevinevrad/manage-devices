import type { Sidebar } from "@/components";
import type { TablerIcon } from "@tabler/icons-react";

export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface Team {
  name: string;
  logo: TablerIcon;
  plan: string;
}

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

export interface Project {
  name: string;
  url: string;
  icon: TablerIcon;
}

export type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: User;
  teams: Team[];
  navMain: NavItem[];
  projects: Project[];
};
