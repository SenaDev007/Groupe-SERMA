'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

// --- Adapted Data for the image accordion in the context of Groupe SERMA ---
const accordionItems = [
  {
    id: 1,
    title: 'Audit & Commissariat aux Comptes',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Gestion de la Caisse en Entreprise',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Conseil Fiscal & Social',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 4,
    title: 'Gestion de Projet Agile',
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 5,
    title: 'Comptabilité Pratique Perfecto',
    imageUrl: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=600&auto=format&fit=crop',
  },
];

interface AccordionItemProps {
  item: typeof accordionItems[0];
  isActive: boolean;
  onMouseEnter: () => void;
}

// --- Accordion Item Component ---
const AccordionItem = ({ item, isActive, onMouseEnter }: AccordionItemProps) => {
  return (
    <div
      className={`
        relative h-[450px] rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-700 ease-in-out border border-white/5
        ${isActive ? 'w-[300px] xs:w-[350px] sm:w-[400px]' : 'w-[50px] sm:w-[60px]'}
      `}
      onMouseEnter={onMouseEnter}
    >
      {/* Background Image */}
      <img
        src={item.imageUrl}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        onError={(e: any) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x450/0c193d/ffffff?text=SERMA'; }}
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20"></div>

      {/* Caption Text */}
      <span
        className={`
          absolute text-white text-sm sm:text-base font-semibold whitespace-nowrap
          transition-all duration-300 ease-in-out font-playfair
          ${
            isActive
              ? 'bottom-6 left-1/2 -translate-x-1/2 rotate-0 text-center w-full px-4' // Active state: horizontal, bottom-center
              // Inactive state: vertical, positioned at the bottom, for all screen sizes
              : 'w-auto text-left bottom-24 left-1/2 -translate-x-1/2 rotate-90 origin-center tracking-wider text-white/50'
          }
        `}
      >
        {item.title}
      </span>
    </div>
  );
};

// --- Main App Component (Adapted to Groupe SERMA theme and colors) ---
export function LandingAccordionItem() {
  const [activeIndex, setActiveIndex] = useState(4);

  const handleItemHover = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="bg-[#05091a] text-white font-sans overflow-hidden py-12 md:py-24 relative">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-orange-logo/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-vert-tech/5 blur-[120px] rounded-full" />
      </div>

      <section className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Left Side: Text Content */}
          <div className="w-full lg:w-5/12 text-center lg:text-left space-y-6">
            <span className="inline-flex px-3 py-1 rounded-full bg-orange-logo/15 border border-orange-logo/30 text-orange-logo text-xs font-bold uppercase tracking-wider">
              Cabinet SERMA & Academy
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight font-playfair">
              Propulsez vos compétences financières et fiscales
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              Du commissariat aux comptes pour structurer votre entreprise à la formation pratique en gestion de caisse pour lancer votre carrière, le Groupe SERMA vous donne les outils pour exceller.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/cabinet#contact"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-orange-logo to-orange-sature hover:from-orange-sature hover:to-orange-logo text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-orange-logo/15 hover:shadow-orange-logo/25 active:scale-95 gap-2"
              >
                <span>Prendre rendez-vous</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/academy/inscription"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 font-bold rounded-xl transition-colors duration-200"
              >
                S'inscrire à l'Academy
              </Link>
            </div>
          </div>

          {/* Right Side: Image Accordion */}
          <div className="w-full lg:w-7/12 flex items-center justify-center">
            {/* Horizontal accordion scroll area */}
            <div className="flex flex-row items-center justify-start sm:justify-center gap-3 sm:gap-4 overflow-x-auto p-4 w-full scrollbar-none">
              {accordionItems.map((item, index) => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  isActive={index === activeIndex}
                  onMouseEnter={() => handleItemHover(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
