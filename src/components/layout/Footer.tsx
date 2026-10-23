import React from "react";
import {
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";
import WhatsAppLink from "@/components/shared/WhatsAppLink";
import {
  buildWhatsAppUrl,
  WHATSAPP_MESSAGES,
} from "@/lib/whatsapp";

/* Icônes sociales inline — pas de dépendance externe */
const Facebook = (props: React.ComponentProps<"svg">) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = (props: React.ComponentProps<"svg">) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const data = {
  contact: {
    email: "contact@sermagroupe.bj",
    phone: "+229 01 96 23 73 43",
    whatsapp: "+229 01 40 37 71 99",
    address: "Zongo 2, axe BENI CHIC – PRESIDO, Parakou, Bénin",
  },
  company: {
    name: "Groupe SERMA",
    slogan: "Former. Structurer. Performer.",
    description:
      "Le Groupe SERMA accompagne les entreprises et les individus vers l'excellence économique et professionnelle au Bénin. Une alliance unique d'expertise comptable et de formation pratique.",
  },
};

const socialLinks = [
  { icon: Facebook, label: "Facebook", href: "https://facebook.com", hover: "hover:bg-[#1877F2] hover:border-[#1877F2]" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com", hover: "hover:bg-[#C13584] hover:border-[#C13584]" },
];

const aboutLinks = [
  { text: "Qui sommes-nous", href: "/#presentation" },
  { text: "Notre différence", href: "/#pourquoi" },
  { text: "Ressources & Blog", href: "/blog" },
];

const cabinetLinks = [
  { text: "Tenue comptable", href: "/cabinet#services" },
  { text: "Certification", href: "/cabinet#services" },
  { text: "Conseil fiscal & social", href: "/cabinet#services" },
  { text: "Prendre rendez-vous", href: "/cabinet#contact" },
];

const academyLinks = [
  { text: "Les 5 filières métiers", href: "/academy#filieres" },
  { text: "Formations courtes", href: "/academy#formations" },
  { text: "Inscription cohorte", href: "/academy/inscription" },
  { text: "Contact Academy", href: "/academy#contact" },
];

const contactInfo = [
  { icon: Mail, text: data.contact.email, href: `mailto:${data.contact.email}` },
  { icon: Phone, text: `Direct : ${data.contact.phone}`, href: `tel:${data.contact.phone.replace(/\s+/g, "")}` },
];

/**
 * Footer — dôme arrondi, liseré orange, trame grain,
 * 4 colonnes + barre légale (pages mentions/confidentialité créées).
 */
export default function Footer() {
  return (
    <footer className="relative bg-marine-profond text-slate-300 mt-24 rounded-t-[2.5rem] sm:rounded-t-[3rem] border-t-4 border-orange-logo overflow-hidden">
      {/* Trame grain + halo décoratif */}
      <div className="absolute inset-0 bg-grain-light opacity-60 pointer-events-none" aria-hidden />
      <div className="absolute -top-32 right-1/4 w-96 h-96 rounded-full bg-orange-logo/[0.07] blur-[110px] pointer-events-none" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Colonne marque */}
          <div className="lg:col-span-4 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-white/[0.06] border border-white/10 shrink-0">
                <span className="font-playfair font-black text-2xl text-orange-logo">
                  S
                </span>
              </span>
              <span className="font-playfair text-2xl font-black tracking-tight text-white">
                SERMA <span className="text-orange-logo">GROUPE</span>
              </span>
            </div>

            <p className="text-orange-logo text-[11px] font-bold uppercase tracking-[0.2em] mt-4">
              {data.company.slogan}
            </p>

            <p className="text-slate-400 mt-5 max-w-sm text-sm leading-relaxed mx-auto lg:mx-0">
              {data.company.description}
            </p>

            <ul className="mt-7 flex justify-center lg:justify-start gap-3">
              {socialLinks.map(({ icon: Icon, label, href, hover }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 text-slate-300 hover:text-white hover:scale-110 transition-all duration-300 ${hover}`}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                  </a>
                </li>
              ))}
              <li>
                <WhatsAppLink
                  href={buildWhatsAppUrl(WHATSAPP_MESSAGES.homepage)}
                  source="footer"
                  ariaLabel="WhatsApp — Groupe SERMA"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 text-slate-300 hover:text-white hover:scale-110 hover:bg-[#25D366] hover:border-[#25D366] transition-all duration-300"
                >
                  <WhatsAppIcon className="w-[18px] h-[18px]" />
                </WhatsAppLink>
              </li>
            </ul>
          </div>

          {/* Colonnes liens */}
          <div className="lg:col-span-8 grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <p className="text-white font-playfair font-bold text-sm uppercase tracking-[0.12em] border-b border-orange-logo/30 pb-3 mb-6">
                Le Groupe
              </p>
              <ul className="space-y-3.5 text-sm">
                {aboutLinks.map(({ text, href }) => (
                  <li key={text}>
                    <Link
                      className="text-slate-400 hover:text-orange-logo transition-colors inline-flex items-center gap-1.5 group"
                      href={href}
                    >
                      <span className="w-1 h-1 rounded-full bg-orange-logo/50 group-hover:bg-orange-logo group-hover:w-2 transition-all" />
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-white font-playfair font-bold text-sm uppercase tracking-[0.12em] border-b border-orange-logo/30 pb-3 mb-6">
                Cabinet SERMA
              </p>
              <ul className="space-y-3.5 text-sm">
                {cabinetLinks.map(({ text, href }) => (
                  <li key={text}>
                    <Link
                      className="text-slate-400 hover:text-orange-logo transition-colors inline-flex items-center gap-1.5 group"
                      href={href}
                    >
                      <span className="w-1 h-1 rounded-full bg-orange-logo/50 group-hover:bg-orange-logo group-hover:w-2 transition-all" />
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-white font-playfair font-bold text-sm uppercase tracking-[0.12em] border-b border-orange-logo/30 pb-3 mb-6">
                Academy
              </p>
              <ul className="space-y-3.5 text-sm">
                {academyLinks.map(({ text, href }) => (
                  <li key={text}>
                    <Link
                      className="text-slate-400 hover:text-orange-logo transition-colors inline-flex items-center gap-1.5 group"
                      href={href}
                    >
                      <span className="w-1 h-1 rounded-full bg-orange-logo/50 group-hover:bg-orange-logo group-hover:w-2 transition-all" />
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-white font-playfair font-bold text-sm uppercase tracking-[0.12em] border-b border-orange-logo/30 pb-3 mb-6">
                Contact
              </p>
              <ul className="space-y-3.5 text-sm">
                {contactInfo.map(({ icon: Icon, text, href }) => (
                  <li key={text}>
                    <a
                      className="flex items-center gap-2.5 text-slate-400 hover:text-orange-logo transition-colors group"
                      href={href}
                      {...(href?.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      <Icon className="w-4 h-4 text-vert-tech shrink-0" />
                      <span className="text-xs leading-relaxed">{text}</span>
                    </a>
                  </li>
                ))}
                <li>
                  <WhatsAppLink
                    href={buildWhatsAppUrl(WHATSAPP_MESSAGES.homepage)}
                    source="footer"
                    ariaLabel="Contacter le Groupe SERMA sur WhatsApp"
                    className="flex items-center gap-2.5 text-slate-400 hover:text-orange-logo transition-colors group"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-vert-tech shrink-0" />
                    <span className="text-xs leading-relaxed">
                      WhatsApp : {data.contact.whatsapp}
                    </span>
                  </WhatsAppLink>
                </li>
                <li>
                  <div className="flex items-start gap-2.5 text-slate-400">
                    <MapPin className="w-4 h-4 text-vert-tech shrink-0 mt-0.5" />
                    <address className="text-xs not-italic leading-relaxed">
                      {data.contact.address}
                    </address>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Barre légale */}
        <div className="mt-14 border-t border-white/[0.07] pt-7">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Groupe SERMA &middot; Cabinet
              SERMA SARL + SERMA HUB Impact Academy. Tous droits réservés.
            </p>
            <div className="flex gap-5 text-xs text-slate-500">
              <Link
                href="/confidentialite"
                className="inline-flex items-center gap-1.5 hover:text-orange-logo transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Politique de confidentialité
              </Link>
              <Link
                href="/mentions"
                className="inline-flex items-center gap-1.5 hover:text-orange-logo transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Mentions légales
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
