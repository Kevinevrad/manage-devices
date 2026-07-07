import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppLayout } from "@/components";

export const Route = createFileRoute("/_layout")({
  component: () => {
    return (
      <AppLayout>
        <Outlet />
      </AppLayout>
    );
  },
});
