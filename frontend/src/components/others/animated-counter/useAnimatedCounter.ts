// src/components/common/animated-counter/useAnimatedCounter.ts

import { useState, useEffect, useRef } from "react";

export function useAnimatedCounter(value: number, duration: number) {
  const [currentValue, setCurrentValue] = useState(0);
  // Utilisation d'un type générique pour le ref afin de rester flexible (span, div, etc.)
  const ref = useRef<HTMLElement | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let animationFrameId: number;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      // Calcule la progression entre 0 et 1
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing easeOutQuart pour une décélération fluide et naturelle
      const easeProgress = 1 - Math.pow(1 - progress, 4);

      setCurrentValue(value * easeProgress);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // S'assure d'atteindre exactement la valeur cible à la fin
        setCurrentValue(value);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Déclenche l'animation uniquement quand l'élément entre dans le viewport
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animationFrameId = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }, // S'active quand 10% du composant est visible
    );

    observer.observe(element);

    // Cleanup function : empêche les fuites de mémoire
    return () => {
      observer.disconnect();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value, duration]);

  return { ref, currentValue };
}
