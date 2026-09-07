import { IconChevronRight } from "@tabler/icons-react";
import { Link, useRouterState } from "@tanstack/react-router";

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
import type { NavItem, NavSubItem } from "./nav.types";

/**
 * Chemins réellement enregistrés dans le routeur — permet de rendre
 * les liens de la sidebar avec `Link` (navigation SPA + état actif).
 */
type AppRoutePath =
  | "/"
  | "/dashboard"
  | "/equipements"
  | "/licences"
  | "/affectations"
  | "/users"
  | "/rapports/inventaire"
  | "/rapports/licences-expirantes"
  | "/parametres";

const isRouteLink = (url: string): url is AppRoutePath =>
  url === "/" ||
  url === "/dashboard" ||
  url === "/equipements" ||
  url === "/licences" ||
  url === "/affectations" ||
  url === "/users" ||
  url === "/rapports/inventaire" ||
  url === "/rapports/licences-expirantes" ||
  url === "/parametres";

/** Bouton principal d'un groupe de navigation. */
function NavButton({ item, active }: { item: NavItem; active: boolean }) {
  if (isRouteLink(item.url)) {
    return (
      <SidebarMenuButton
        tooltip={item.title}
        isActive={active}
        render={<Link to={item.url} />}
      >
        <item.icon />
        <span>{item.title}</span>
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuButton tooltip={item.title}>
      <a href={item.url} className="flex flex-row items-center gap-2">
        <item.icon />
        <span>{item.title}</span>
      </a>
    </SidebarMenuButton>
  );
}

/** Sous-élément d'un groupe de navigation. */
function NavSubButton({
  item,
  active,
}: {
  item: NavSubItem;
  active: boolean;
}) {
  if (isRouteLink(item.url)) {
    return (
      <SidebarMenuSubButton
        isActive={active}
        render={<Link to={item.url} />}
      >
        <span>{item.title}</span>
      </SidebarMenuSubButton>
    );
  }

  return (
    <SidebarMenuSubButton>
      <a href={item.url}>
        <span>{item.title}</span>
      </a>
    </SidebarMenuSubButton>
  );
}

export const Nav = ({
  items,
  navLabel,
}: {
  items: NavItem[];
  navLabel: string;
}) => {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <>
      <SidebarGroupLabel>{navLabel}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} defaultOpen={item.isActive}>
            <SidebarMenuItem className="flex flex-col">
              <NavButton item={item} active={pathname === item.url} />
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
                          <NavSubButton
                            item={subItem}
                            active={pathname === subItem.url}
                          />
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
