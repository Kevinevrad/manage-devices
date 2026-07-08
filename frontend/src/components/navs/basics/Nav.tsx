import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../../ui";
import { IconChevronRight } from "@tabler/icons-react";
import type { NavItem } from "./nav.types";

export const Nav = ({
  items,
  navLabel,
}: {
  items: NavItem[];
  navLabel: string;
}) => {
  return (
    <>
      <SidebarGroupLabel>{navLabel}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} defaultOpen={item.isActive}>
            <SidebarMenuItem className="flex flex-col">
              <SidebarMenuButton tooltip={item.title}>
                <a href={item.url} className="flex flex-row gap-2 items-center">
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <IconChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </>
  );
};
