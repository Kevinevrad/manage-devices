import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // 2. Définissez l'alias @
    },
  },

  server: {
    proxy: {
      // En développement, /api est relayé vers le backend Express (port 3000)
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },

  optimizeDeps: {
    include: ["@tabler/icons-react"],
  },
});
