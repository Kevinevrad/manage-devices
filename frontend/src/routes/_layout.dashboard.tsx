// import { MetricsCard } from "@/components";
// import { Card, CardContent, CardHeader, MetricsCard } from "@/components";
import { MetricsSection } from "@/components/sections/metrics";
import { stats } from "@/data/stats";
// import { Separator } from "@base-ui/react";
// import { IconDeviceLaptop } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/dashboard")({
  component: () => {
    return (
      <>
        <div className="border px-12 py-12 rounded-xl bg-[url('../assets/imgs/backgrounds/registerBg.svg')] bg-left bg-cover bg-no-repeat ">
          <div className="  text-secondary">
            <h1 className="text-3xl font-extrabold uppercase font-serif">
              Ravis de vous revoir Mr ASSOKO{" "}
            </h1>
            <hr className="mb-2" />
            <p>
              Gerer tout l'ensemble de votre parc informatique sans prise de
              tête
            </p>
          </div>
        </div>
        <>
          <MetricsSection stats={stats} />
        </>
      </>
    );
  },
});
