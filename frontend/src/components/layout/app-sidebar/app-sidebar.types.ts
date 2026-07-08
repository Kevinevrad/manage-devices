import type { Sidebar } from "@/components";
// import { IconCommand } from "@tabler/icons-react";
import type { NavItem, User } from "@/components/navs";
// import type { TablerIcon } from "@tabler/icons-react";

// export interface Team {
//   name: string;
//   logo: TablerIcon;
//   plan: string;
// }

// export interface Project {
//   name: string;
//   url: string;
//   icon: TablerIcon;
// }

export type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: User;
  // teams: Team[];
  navMain: NavItem[];
  // projects: Project[];
};
