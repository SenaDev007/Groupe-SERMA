"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  kicker: string;
  title: string;
  /** Partie du titre mise en accent orange */
  highlight?: string;
  subtitle?: string;
  /** Fond sombre (marine) ou clair */
  tone?: "light" | "dark";
  align?: "center" | "left";
  className?: string;
}

/**
 * Kit d'en-tête de section — signature de la refonte.
 * Kicker en pill + titre Playfair + filet orange animé + sous-titre.
 */
export default function SectionHeader({
  kicker,
  title,
  highlight,
  subtitle,
  tone = "light",
  align = "center",
  className,
}: SectionHeaderProps) {
  const dark = tone === "dark";

  return (
    <div
      className={cn(
        "mb-14 sm:mb-16",
        align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      {/* Kicker pill */}
      <motion.span
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "inline-block px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] mb-5",
          dark
            ? "bg-white/[0.07] text-orange-logo border border-white/15"
            : "bg-orange-logo/[0.08] text-orange-contrast border border-orange-logo/20"
        )}
      >
        {kicker}
      </motion.span>

      {/* Titre */}
      <motion.h2
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
        className={cn(
          "font-playfair text-3xl sm:text-4xl md:text-[2.75rem] font-extrabold tracking-tight leading-[1.15]",
          dark ? "text-white" : "text-marine-profond"
        )}
      >
        {title}
        {highlight && (
          <>
            {" "}
            <span className={dark ? "text-orange-logo" : "text-orange-contrast"}>
              {highlight}
            </span>
          </>
        )}
      </motion.h2>

      {/* Filet signature animé */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "h-1 w-16 bg-orange-logo rounded-full mt-6",
          align === "center" ? "mx-auto" : ""
        )}
      />

      {/* Sous-titre */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
          className={cn(
            "text-base sm:text-lg leading-relaxed mt-5 max-w-2xl",
            align === "center" ? "mx-auto" : "",
            dark ? "text-slate-300/90" : "text-gris-texte"
          )}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
