"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface StatsCounterProps {
  value: string;
  label: string;
  suffix?: string;
  /** Rendu sur fond sombre marine */
  dark?: boolean;
}

/**
 * Compteur animé — carte premium arrondie, barre "shine"
 * qui s'élargit au survol, chiffre en Inter.
 */
export default function StatsCounter({
  value,
  label,
  suffix = "",
  dark = false,
}: StatsCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [count, setCount] = useState(0);

  const numericMatch = value.match(/\d+/);
  const targetNumber = numericMatch ? parseInt(numericMatch[0], 10) : 0;
  const originalSuffix = value.replace(/\d+/, "") + suffix;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || targetNumber === 0) return;
    let start = 0;
    const duration = 1800;
    const stepTime = Math.max(Math.floor(duration / targetNumber), 16);
    const timer = setInterval(() => {
      start += Math.ceil(targetNumber / (duration / stepTime));
      if (start >= targetNumber) {
        setCount(targetNumber);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [inView, targetNumber]);

  return (
    <div
      ref={ref}
      className={cn(
        "group relative text-center rounded-3xl p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1.5",
        dark
          ? "bg-white/[0.04] border border-white/10 hover:border-orange-logo/40 shadow-none"
          : "bg-white border border-marine-profond/10 hover:border-orange-logo/40 shadow-[0_8px_32px_rgba(12,25,61,0.08)] hover:shadow-[0_16px_44px_rgba(224,127,10,0.16)]"
      )}
    >
      <p
        className={cn(
          "font-inter text-4xl sm:text-5xl font-black tracking-tight mb-3 transition-colors duration-300",
          dark
            ? "text-white group-hover:text-orange-logo"
            : "text-marine-profond group-hover:text-orange-logo"
        )}
      >
        {targetNumber > 0 ? count : value}
        <span className="text-orange-logo">{originalSuffix}</span>
      </p>
      <p
        className={cn(
          "text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] leading-relaxed",
          dark ? "text-slate-400" : "text-gris-texte"
        )}
      >
        {label}
      </p>
      {/* Barre shine — s'élargit au survol */}
      <div
        className={cn(
          "mx-auto mt-5 h-1 rounded-full transition-all duration-500",
          "w-10 group-hover:w-20",
          dark ? "bg-orange-logo/70" : "bg-orange-logo"
        )}
      />
    </div>
  );
}
