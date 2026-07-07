import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

// import { TooltipProvider } from "@/components";

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <Outlet />
        <TanStackRouterDevtools position="bottom-right" />
      </>
    );
  },
});
