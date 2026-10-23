"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import { cn } from "@/lib/utils";

const panels = [
  {
    title: "Audit & Commissariat aux Comptes",
    image: "/images/serma_audit.png",
    alt: "Audit et commissariat aux comptes — Cabinet SERMA",
    tag: "Cabinet",
  },
  {
    title: "Gestion de la Caisse en Entreprise",
    image: "/images/serma_caisse.png",
    alt: "Formation gestion efficace de la caisse — SERMA HUB",
    tag: "Academy",
  },
  {
    title: "Conseil Fiscal & Social",
    image: "/images/serma_fiscal.png",
    alt: "Conseil fiscal et social OHADA — Cabinet SERMA",
    tag: "Cabinet",
  },
  {
    title: "Gestion de Projet Agile",
    image: "/images/serma_projet.png",
    alt: "Formation gestion financière de projet OHADA — SERMA HUB",
    tag: "Academy",
  },
  {
    title: "Comptabilité Pratique Perfecto",
    image: "/images/serma_perfecto.png",
    alt: "Formation SYSCOHADA révisé sur Perfecto — SERMA HUB",
    tag: "Academy",
  },
];

/**
 * Accordéon horizontal d'expertises — 5 panneaux expansibles.
 * Design premium : panneaux arrondis, images avec overlay marine,
 * numéros flottants, badge espace, expansion fluide.
 */
export default function ExpertiseAccordion() {
  const [active, setActive] = useState(4);

  return (
    <section className="py-24 bg-gris-bleute relative overflow-hidden">
      {/* Blobs décoratifs */}
      <div className="absolute top-0 right-0 w-[380px] h-[380px] rounded-full bg-orange-logo/[0.05] blur-[110px] pointer-events-none" aria-hidden />
      <div className="absolute bottom-0 left-0 w-[320px] h-[320px] rounded-full bg-vert-tech/[0.06] blur-[100px] pointer-events-none" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Cabinet SERMA & Academy"
          title="Propulsez vos compétences financières"
          highlight="et fiscales."
          subtitle="Du commissariat aux comptes pour les entreprises, à la formation pratique en gestion de caisse et SYSCOHADA pour les professionnels : tout l'écosystème SERMA sur un seul site."
        />

        {/* Accordéon desktop */}
        <div className="hidden md:flex flex-row gap-3 h-[460px]">
          {panels.map((panel, i) => {
            const isActive = i === active;
            return (
              <button
                key={panel.title}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                aria-expanded={isActive}
                aria-label={panel.title}
                className={cn(
                  "relative flex-1 rounded-3xl overflow-hidden text-left transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group",
                  isActive ? "flex-[3.2]" : "flex-[1] hover:flex-[1.4]"
                )}
              >
                {/* Image */}
                <img
                  src={panel.image}
                  alt={panel.alt}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                  className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-transform duration-700",
                    isActive ? "scale-100" : "scale-110 group-hover:scale-105"
                  )}
                />
                {/* Overlay marine */}
                <div
                  className={cn(
                    "absolute inset-0 transition-opacity duration-500 bg-gradient-to-t from-marine-profond/95 via-marine-profond/45 to-marine-profond/15",
                    isActive ? "opacity-95" : "opacity-70"
                  )}
                />
                {/* Trame grain */}
                <div className="absolute inset-0 bg-grain-light opacity-40" aria-hidden />

                {/* Badge espace */}
                <span
                  className={cn(
                    "absolute top-5 left-5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm transition-colors",
                    panel.tag === "Cabinet"
                      ? "bg-marine-profond/70 text-white border border-white/25"
                      : "bg-orange-logo/90 text-white border border-orange-sature"
                  )}
                >
                  {panel.tag}
                </span>

                {/* Titre — vertical si inactif */}
                <div
                  className={cn(
                    "absolute inset-x-0 bottom-0 p-6 transition-all duration-500",
                    isActive ? "pb-7" : "pb-6"
                  )}
                >
                  {isActive ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: 0.12 }}
                    >
                      <h3 className="font-playfair text-xl lg:text-2xl font-bold text-white leading-snug mb-2.5">
                        {panel.title}
                      </h3>
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-orange-logo">
                        En savoir plus
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </motion.div>
                  ) : (
                    <span
                      className="font-semibold text-sm text-white/90 leading-tight"
                      style={{ writingMode: "vertical-rl" }}
                    >
                      {panel.title}
                    </span>
                  )}
                </div>

                {/* Numéro flottant */}
                <span className="absolute bottom-5 right-5 flex items-center justify-center w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-inter font-black text-xs">
                  0{i + 1}
                </span>
              </button>
            );
          })}
        </div>

        {/* Accordéon mobile — pile verticale */}
        <div className="md:hidden flex flex-col gap-4">
          {panels.map((panel, i) => {
            const isActive = i === active;
            return (
              <button
                key={panel.title}
                onClick={() => setActive(isActive ? -1 : i)}
                aria-expanded={isActive}
                className={cn(
                  "relative rounded-3xl overflow-hidden text-left transition-all duration-500",
                  isActive ? "h-64" : "h-20"
                )}
              >
                <img
                  src={panel.image}
                  alt={panel.alt}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-marine-profond/95 via-marine-profond/50 to-marine-profond/25" />
                <span
                  className={cn(
                    "absolute top-4 left-4 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                    panel.tag === "Cabinet"
                      ? "bg-marine-profond/70 text-white border border-white/25"
                      : "bg-orange-logo/90 text-white"
                  )}
                >
                  {panel.tag}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-playfair text-lg font-bold text-white leading-snug">
                    {panel.title}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA sous l'accordéon */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/cabinet#contact"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-marine-profond hover:bg-marine-moyen text-white font-bold text-sm transition-colors shadow-[0_8px_28px_rgba(12,25,61,0.25)]"
          >
            Prendre rendez-vous
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/academy/inscription"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-orange-logo hover:bg-orange-sature text-white font-bold text-sm transition-colors shadow-[0_8px_28px_rgba(224,127,10,0.32)]"
          >
            <GraduationCap className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            S'inscrire à l'Academy
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
