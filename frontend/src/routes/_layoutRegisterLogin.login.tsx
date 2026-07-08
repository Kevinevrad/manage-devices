import { LoginForm } from "@/components";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layoutRegisterLogin/login")({
  component: () => {
    return <LoginForm />;
  },
});
