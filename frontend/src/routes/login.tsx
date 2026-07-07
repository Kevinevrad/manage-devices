import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: () => {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
          <h2 className="mb-6 text-center text-2xl font-bold">Connexion Pro</h2>
          {/* Formulaire de connexion épuré, plein écran */}
        </div>
      </div>
    );
  },
});
