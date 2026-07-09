// src/components/common/animated-counter/AnimatedCounter.tsx

import { cn } from "@/lib/utils"; // J'assume l'utilisation de ton utilitaire habituel
import type { AnimatedCounterProps } from "./animated-counter.types";
import { useAnimatedCounter } from "./useAnimatedCounter";

export function AnimatedCounter(props: AnimatedCounterProps) {
  const {
    value,
    duration = 1200,
    suffix = "",
    prefix = "",
    decimals = 0,
    className,
  } = props;

  const { ref, currentValue } = useAnimatedCounter(value, duration);

  return (
    <span ref={ref} className={cn("font-bold tabular-nums", className)}>
      {prefix}
      {currentValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}
