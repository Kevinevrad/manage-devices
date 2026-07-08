import { IconCardsFilled } from "@tabler/icons-react";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_layoutRegisterLogin")({
  component: () => {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10 bg-[url('../assets/imgs/backgrounds/loginBg.svg')] bg-cover bg-center bg-no-repeat">
        <div className="flex w-full max-w-sm flex-col gap-8 ">
          <div className="flex items-center gap-2 self-center font-medium  bg-background py-5 rounded-xl justify-center w-full">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <IconCardsFilled className="size-20" />
            </div>
            Acme Inc.
          </div>
          <Outlet />
        </div>
      </div>
    );
  },
});
