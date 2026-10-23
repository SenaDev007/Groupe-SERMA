"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface HeroProps {
  /** Badge kicker au-dessus du H1 */
  badge?: ReactNode;
  /** Titre H1 — les ligns sont passées en children */
  title: ReactNode;
  subtitle?: ReactNode;
  /** CTA principaux */
  actions?: ReactNode;
  /** Nom de l'image de fond (dans /public/images) */
  backgroundImage?: string;
  /** Opacité de l'image de fond */
  backgroundOpacity?: number;
  children?: ReactNode;
}

/**
 * Hero premium multicouche — pattern signature de la refonte :
 * image + mesh gradient marine + trame grain + grille fine +
 * blobs flottants orange/vert + contenu staggeré.
 */
export default function Hero({
  badge,
  title,
  subtitle,
  actions,
  backgroundImage = "/images/hero_background.png",
  backgroundOpacity = 0.16,
  children,
}: HeroProps) {
  return (
    <section className="relative min-h-[88vh] flex items-center justify-center pt-32 pb-20 overflow-hidden bg-marine-profond text-white rounded-b-[2.5rem] sm:rounded-b-[3rem]">
      {/* Couche 1 — image de fond */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ opacity: backgroundOpacity }}
      >
        <img
          src={backgroundImage}
          alt=""
          aria-hidden
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-marine-profond via-transparent to-transparent" />
      </div>

      {/* Couche 2 — mesh gradient marine */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-br from-marine-profond/80 via-[#0e1d45]/60 to-marine-moyen/85 mix-blend-multiply"
        aria-hidden
      />

      {/* Couche 3 — trame grain + grille fine */}
      <div className="absolute inset-0 z-[2] pointer-events-none bg-grain-light opacity-50" aria-hidden />
      <div className="absolute inset-0 z-[2] pointer-events-none bg-grid-fine opacity-60" aria-hidden />

      {/* Couche 4 — blobs flottants */}
      <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-orange-logo/[0.13] blur-[110px] animate-float" />
        <div
          className="absolute -bottom-36 -left-28 w-[460px] h-[460px] rounded-full bg-vert-tech/[0.12] blur-[130px] animate-float-slow"
        />
        <div className="absolute top-1/3 left-1/2 w-56 h-56 rounded-full bg-orange-logo/[0.06] blur-[80px]" />
      </div>

      {/* Contenu */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {badge && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            {badge}
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-black tracking-tight leading-[1.08]"
          )}
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.26, ease: "easeOut" }}
            className="max-w-2xl mt-7 text-slate-300 text-base sm:text-lg md:text-xl leading-relaxed font-medium"
          >
            {subtitle}
          </motion.p>
        )}

        {actions && (
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="mt-11 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            {actions}
          </motion.div>
        )}

        {children}
      </div>

      {/* Liseré inférieur lumineux */}
      <div
        className="absolute bottom-0 inset-x-0 h-[2px] z-[5] bg-gradient-to-r from-transparent via-orange-logo/60 to-transparent"
        aria-hidden
      />
    </section>
  );
}
