import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components";
import { obtenirJetton } from "@/lib/api";

export const Route = createFileRoute("/_layout")({
  /** Garde de session : un visiteur sans jeton est renvoyé vers /login. */
  beforeLoad: () => {
    if (obtenirJetton() === null) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => {
    return (
      <AppLayout>
        <Outlet />
      </AppLayout>
    );
  },
});
