// AppLayout.tsx
import { IconBell, IconSearch } from "@tabler/icons-react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  AppSideBar,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Input,
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components";
import { useAuth } from "@/hooks/auth";
import type { AppLayoutProps } from "./app-layout.types";
import { navs } from "@/data";

/** Libellé du fil d'Ariane pour chaque page connue. */
const breadcrumbLabels: Record<string, string> = {
  "/dashboard": "Vue d'ensemble",
  "/equipements": "Équipements",
  "/licences": "Licences",
  "/affectations": "Affectations",
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const navigate = useNavigate();
  const { utilisateur, deconnecter } = useAuth();
  const currentPage = breadcrumbLabels[pathname] ?? "Vue d'ensemble";

  /** Déconnexion puis retour au formulaire de connexion. */
  const deconnecterEtRediriger = () => {
    deconnecter();
    void navigate({ to: "/login" });
  };

  return (
    <SidebarProvider>
      <AppSideBar
        navMain={navs.navMain}
        onDeconnexion={deconnecterEtRediriger}
        user={{
          name: utilisateur?.nomComplet ?? "…",
          email: utilisateur?.email ?? "",
          avatar: "",
        }}
      />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur">
          <div className="flex flex-1 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Parc</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="hidden items-center gap-2 px-4 md:flex">
            <div className="relative">
              <IconSearch className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un équipement, une licence…"
                className="h-9 w-64 rounded-xl bg-muted/50 pl-8 pr-10"
              />
              <kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <IconBell />
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-rose-500" />
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};
