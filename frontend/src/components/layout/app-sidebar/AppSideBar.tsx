import { IconDeviceLaptop } from "@tabler/icons-react";

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

import { type AppSidebarProps } from "./app-sidebar.types";

export const AppSideBar = ({ ...props }: AppSidebarProps) => {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" variant={"outline"}>
              <a href="#" className="flex flex-row items-center gap-2.5">
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  <IconDeviceLaptop className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Manage Devices</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Gestion de parc
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <Nav items={props.navMain} navLabel="Navigation" />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="w-full border-t">
        <DropDownNav user={props.user} />
      </SidebarFooter>
    </Sidebar>
  );
};
