"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Navbar — conforme CDC §5.4 : fond blanc, logo marine+orange
 * parfaitement lisible, border-bottom orange au scroll.
 * Navigation contextuelle par espace + CTA adapté.
 */
export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isCabinet = pathname?.startsWith("/cabinet");
  const isAcademy = pathname?.startsWith("/academy");

  let navLinks: Array<{ label: string; href: string }> = [];
  let ctaText = "Nous contacter";
  let ctaHref = "/#contact";
  let logoSub = "GROUPE";

  if (isCabinet) {
    logoSub = "CABINET";
    ctaText = "Prendre rendez-vous";
    ctaHref = "/cabinet#contact";
    navLinks = [
      { label: "Nos services", href: "/cabinet#services" },
      { label: "Notre approche", href: "/cabinet#approche" },
      { label: "Nos clients", href: "/cabinet#clients" },
      { label: "Témoignages", href: "/cabinet#temoignages" },
      { label: "Espace Academy", href: "/academy" },
    ];
  } else if (isAcademy) {
    logoSub = "ACADEMY";
    ctaText = "S'inscrire maintenant";
    ctaHref = "/academy/inscription";
    navLinks = [
      { label: "Les filières", href: "/academy#filieres" },
      { label: "Formations courtes", href: "/academy#formations" },
      { label: "Pour qui", href: "/academy#profils" },
      { label: "Témoignages", href: "/academy#temoignages" },
      { label: "Espace Cabinet", href: "/cabinet" },
    ];
  } else {
    navLinks = [
      { label: "Cabinet SERMA", href: "/cabinet" },
      { label: "SERMA HUB Academy", href: "/academy" },
      { label: "Ressources", href: "/blog" },
      { label: "Contact", href: "/#contact" },
    ];
  }

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/92 backdrop-blur-xl shadow-[0_6px_30px_rgba(12,25,61,0.1)] border-b-2 border-orange-logo/70 py-2"
          : "bg-white/97 backdrop-blur-md border-b border-marine-profond/[0.06] py-3.5"
      )}
    >
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo — pastille marine statique + wordmark marine/orange */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="Groupe SERMA — Accueil"
        >
          <span className="flex items-center justify-center w-11 h-11 rounded-full bg-marine-profond shadow-md shrink-0">
            <span className="font-playfair font-black text-lg text-orange-logo">
              S
            </span>
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-playfair text-xl sm:text-2xl font-black tracking-tight text-marine-profond">
              SERMA{" "}
              <span className="text-orange-logo group-hover:text-orange-sature transition-colors">
                {logoSub}
              </span>
            </span>
            <span className="hidden sm:block text-[9px] font-bold uppercase tracking-[0.22em] text-vert-tech mt-1">
              Former · Structurer · Performer
            </span>
          </span>
        </Link>

        {/* Navigation desktop */}
        <div className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative text-[13.5px] font-semibold text-gris-texte hover:text-marine-profond transition-colors duration-200 after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:w-0 after:bg-orange-logo after:rounded-full after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link
              href={ctaHref}
              className="group inline-flex items-center gap-2 bg-orange-logo hover:bg-orange-sature text-white font-bold text-[13px] uppercase tracking-wider px-6 py-3 rounded-full shadow-[0_6px_22px_rgba(224,127,10,0.35)] transition-colors"
            >
              {ctaText}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Bouton menu mobile */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          className="lg:hidden flex items-center justify-center w-11 h-11 rounded-xl border border-marine-profond/15 text-marine-profond hover:bg-gris-bleute transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Menu mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden bg-white border-t border-marine-profond/[0.07] shadow-xl"
          >
            <div className="px-5 py-6 flex flex-col gap-1.5">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    className="flex items-center justify-between py-3.5 px-4 rounded-xl text-[15px] font-semibold text-marine-profond hover:bg-gris-bleute transition-colors"
                  >
                    {link.label}
                    <ArrowRight className="w-4 h-4 text-orange-logo" />
                  </Link>
                </motion.div>
              ))}
              <Link
                href={ctaHref}
                className="mt-4 inline-flex items-center justify-center gap-2 bg-orange-logo hover:bg-orange-sature text-white font-bold text-sm uppercase tracking-wider py-4 rounded-full shadow-[0_8px_26px_rgba(224,127,10,0.35)] transition-colors"
              >
                {ctaText}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
