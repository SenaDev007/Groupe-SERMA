"use client";

import type { ReactNode } from "react";

interface TestimonialsCarouselProps {
  /** Cartes témoignages (TestimonialCard) */
  items: ReactNode[];
}

/**
 * Témoignages — grille desktop, carrousel swipe mobile.
 * CDC §8 : "Témoignages — carousel drag — Mobile" : rail horizontal
 * scroll-snap (glissement tactile natif, fluide), desktop en grille.
 */
export default function TestimonialsCarousel({ items }: TestimonialsCarouselProps) {
  return (
    <>
      {/* Mobile — rail horizontal swipe */}
      <div className="md:hidden -mx-4 px-4 flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2">
        {items.map((item, i) => (
          <div key={i} className="snap-center shrink-0 w-[86%]">
            {item}
          </div>
        ))}
      </div>

      {/* Desktop — grille */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-7">
        {items.map((item, i) => (
          <div key={i}>{item}</div>
        ))}
      </div>
    </>
  );
}
