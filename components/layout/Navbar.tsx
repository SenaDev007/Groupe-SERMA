"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle scroll border-bottom/shadow effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine context
  const isCabinet = pathname?.startsWith("/cabinet");
  const isAcademy = pathname?.startsWith("/academy");

  let navLinks: Array<{ label: string; href: string }> = [];
  let ctaText = "Nous contacter";
  let ctaHref = "#contact";
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
      { label: "Admin", href: "/admin" },
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
      { label: "Admin", href: "/admin" },
    ];
  } else {
    // Homepage or other (blog)
    logoSub = "GROUPE";
    ctaText = "Nous contacter";
    ctaHref = "#contact";
    navLinks = [
      { label: "Cabinet SERMA", href: "/cabinet" },
      { label: "SERMA HUB Academy", href: "/academy" },
      { label: "Ressources", href: "/blog" },
      { label: "Contact", href: "#contact" },
      { label: "Admin", href: "/admin" },
    ];
  }

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 bg-white transition-all duration-300 ${
        isScrolled
          ? "border-b border-orange-logo/30 shadow-md py-3"
          : "border-b border-orange-logo/10 shadow-sm py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="font-playfair text-2xl font-black tracking-tight text-marine-profond transition-colors duration-200">
              SERMA <span className="text-orange-logo group-hover:text-orange-sature">{logoSub}</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-slate-600 hover:text-marine-profond text-sm font-semibold transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-orange-logo hover:bg-orange-sature text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:shadow-md active:scale-95 gap-1.5"
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-marine-profond hover:bg-slate-100 focus:outline-none transition-colors"
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 py-4 px-6 space-y-3 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block text-slate-700 hover:text-marine-profond text-base font-medium py-2 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              href={ctaHref}
              className="w-full inline-flex items-center justify-center px-5 py-3 rounded-lg bg-orange-logo hover:bg-orange-sature text-white text-sm font-bold uppercase tracking-wider transition-colors gap-2"
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
