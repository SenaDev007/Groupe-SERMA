"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CTAButtonProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "dark" | "premium";
  className?: string;
  /** Respiration douce pour attirer l'œil */
  breathing?: boolean;
}

/**
 * Bouton CTA signature — pilule arrondie, flèche glissante,
 * respiration optionnelle.
 */
export default function CTAButton({
  href,
  children,
  variant = "primary",
  className,
  breathing = false,
}: CTAButtonProps) {
  const styles: Record<string, string> = {
    primary:
      "bg-orange-logo hover:bg-orange-sature text-white shadow-[0_8px_28px_rgba(224,127,10,0.32)] hover:shadow-[0_12px_36px_rgba(224,127,10,0.42)]",
    outline:
      "border border-white/25 hover:border-orange-logo hover:text-orange-logo text-white bg-transparent",
    dark: "bg-marine-profond hover:bg-marine-moyen text-white shadow-[0_8px_28px_rgba(12,25,61,0.3)]",
    premium:
      "bg-white hover:bg-gris-bleute text-marine-profond font-black shadow-[0_10px_32px_rgba(224,127,10,0.25)]",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      animate={breathing ? { scale: [1, 1.025, 1] } : undefined}
      transition={
        breathing
          ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
          : { type: "spring", stiffness: 400, damping: 17 }
      }
      className="inline-block"
    >
      <Link
        href={href}
        className={cn(
          "group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-bold text-sm sm:text-base transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-logo/30",
          styles[variant],
          className
        )}
      >
        {children}
        <ArrowRight className="w-4.5 h-4.5 w-[18px] h-[18px] transition-transform duration-200 group-hover:translate-x-1" />
      </Link>
    </motion.div>
  );
}
