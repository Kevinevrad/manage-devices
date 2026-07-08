import { RegisterForm } from "@/components";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layoutRegisterLogin/register")({
  component: () => {
    return <RegisterForm />;
  },
});
