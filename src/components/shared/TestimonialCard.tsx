"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  /** Résultat concret — badge orange */
  result: string;
  quote: string;
  author: string;
  roleOrSub?: string;
  dark?: boolean;
}

/**
 * Carte témoignage premium : badge résultat, citation avec
 * guillemets décoratifs, avatar à initiale, survol relevé.
 */
export default function TestimonialCard({
  result,
  quote,
  author,
  roleOrSub,
  dark = false,
}: TestimonialCardProps) {
  const initials = author
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <motion.figure
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={cn(
        "relative flex flex-col rounded-3xl p-7 sm:p-8 transition-colors duration-300",
        dark
          ? "bg-white/[0.04] border border-white/10 hover:border-orange-logo/35"
          : "bg-white border border-marine-profond/10 hover:border-orange-logo/40 shadow-[0_8px_32px_rgba(12,25,61,0.08)]"
      )}
    >
      {/* Guillet décoratif */}
      <Quote
        className={cn(
          "absolute top-6 right-7 w-8 h-8 opacity-15",
          dark ? "text-white" : "text-marine-profond"
        )}
        aria-hidden
      />

      {/* Badge résultat */}
      <span
        className={cn(
          "self-start inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide mb-5",
          dark
            ? "bg-orange-logo/15 text-orange-logo border border-orange-logo/25"
            : "bg-orange-logo/[0.09] text-orange-contrast border border-orange-logo/25"
        )}
      >
        {result}
      </span>

      {/* Citation */}
      <blockquote
        className={cn(
          "text-sm md:text-[15px] italic leading-relaxed mb-7 flex-1",
          dark ? "text-slate-300" : "text-gris-texte"
        )}
      >
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Auteur */}
      <figcaption className="flex items-center gap-4 pt-5 border-t border-marine-profond/[0.07] dark:border-white/10">
        <span
          className={cn(
            "flex items-center justify-center w-11 h-11 rounded-full font-playfair font-black text-sm shrink-0",
            dark
              ? "bg-orange-logo/20 text-orange-logo border border-orange-logo/30"
              : "bg-marine-profond text-orange-logo"
          )}
          aria-hidden
        >
          {initials}
        </span>
        <div>
          <p
            className={cn(
              "text-sm font-bold",
              dark ? "text-white" : "text-marine-profond"
            )}
          >
            {author}
          </p>
          {roleOrSub && (
            <p
              className={cn(
                "text-xs mt-0.5 font-medium",
                dark ? "text-slate-400" : "text-gris-texte"
              )}
            >
              {roleOrSub}
            </p>
          )}
        </div>
      </figcaption>
    </motion.figure>
  );
}
