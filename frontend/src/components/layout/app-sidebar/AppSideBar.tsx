import {
  DropDownNav,
  Nav,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components";
import { IconCommand } from "@tabler/icons-react";

import { type AppSidebarProps } from "./app-sidebar.types";

export const AppSideBar = ({ ...props }: AppSidebarProps) => {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" variant={"outline"}>
              <a href="#" className="flex flex-row justify-around gap-5">
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  <IconCommand className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <Nav items={props.navMain} navLabel="Main Navigation" />
          {/* <Nav items={navs.navMain} navLabel="Main Navigation" /> */}
        </SidebarGroup>
        {/* <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter className="border-t w-full">
        <DropDownNav user={props.user} />
      </SidebarFooter>
    </Sidebar>
  );
};
