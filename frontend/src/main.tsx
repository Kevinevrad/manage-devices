import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { FournisseurAuth } from "@/hooks/auth";

import "./styles/index.css";

const router = createRouter({ routeTree });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Évite les allers-retours API systématiques entre deux navigations
      staleTime: 30_000,
      // Une seule relance : l'erreur remonte vite à l'écran
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Déclaration du type du routeur pour l'autocomplétion TypeScript
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FournisseurAuth>
        <RouterProvider router={router} />
      </FournisseurAuth>
    </QueryClientProvider>
  </StrictMode>,
);
