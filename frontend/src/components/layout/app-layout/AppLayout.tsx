// AppLayout.tsx
import type { AppLayoutProps } from "./app-layout.types";

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="p-6"> {children}</main>
    </div>
  );
};
