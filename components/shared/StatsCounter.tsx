"use client";

import { useEffect, useState, useRef } from "react";

interface StatsCounterProps {
  value: string;
  label: string;
  suffix?: string;
  dark?: boolean;
}

export default function StatsCounter({ value, label, suffix = "", dark = false }: StatsCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [count, setCount] = useState(0);

  // Extract the numeric part of the value (e.g. "200" from "200+")
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
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || targetNumber === 0) return;

    let start = 0;
    const duration = 1500; // 1.5s
    const stepTime = Math.max(Math.floor(duration / targetNumber), 15);
    
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
      className={`text-center rounded-2xl p-6 sm:p-8 border transition-all duration-300 transform hover:-translate-y-1 ${
        dark
          ? "bg-marine-moyen/30 border-white/[0.06] hover:border-orange-logo/30 text-white"
          : "bg-white border-slate-200 hover:border-orange-logo/30 text-marine-profond shadow-sm"
      }`}
    >
      <p className="font-inter text-4xl sm:text-5xl font-black text-orange-logo tracking-tight mb-2">
        {targetNumber > 0 ? count : value}
        <span className="text-orange-logo">{originalSuffix}</span>
      </p>
      <p className={`text-xs sm:text-sm font-semibold uppercase tracking-wider ${
        dark ? "text-slate-400" : "text-slate-500"
      }`}>
        {label}
      </p>
    </div>
  );
}
