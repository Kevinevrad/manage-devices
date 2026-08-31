import { IconDeviceLaptop } from "@tabler/icons-react";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_layoutRegisterLogin")({
  component: () => {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10 bg-[url('../assets/imgs/backgrounds/loginBg.svg')] bg-cover bg-center bg-no-repeat">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <div className="flex w-full items-center justify-center gap-3 rounded-xl bg-background py-5 shadow-sm">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <IconDeviceLaptop className="size-5" />
            </div>
            <div className="grid text-left leading-tight">
              <span className="font-heading font-semibold">Manage Devices</span>
              <span className="text-xs text-muted-foreground">
                Gestion de parc informatique
              </span>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    );
  },
});
