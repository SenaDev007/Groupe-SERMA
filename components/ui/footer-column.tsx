import React from 'react';
import {
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import Link from 'next/link';

// Custom inline SVG icons to support older lucide-react versions in build environments
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

const Twitter = (props: React.ComponentProps<"svg">) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

const Github = (props: React.ComponentProps<"svg">) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);
const WhatsApp = (props: React.ComponentProps<"svg">) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const data = {
  facebookLink: 'https://facebook.com',
  instaLink: 'https://instagram.com',
  whatsappLink: 'https://wa.me/2290140377199',
  contact: {
    email: 'contact@sermagroupe.bj',
    phone: '+229 01 96 23 73 43',
    whatsapp: '+229 01 40 37 71 99',
    address: 'Zongo 2, axe BENI CHIC – PRESIDO, Parakou, Bénin',
  },
  company: {
    name: 'Groupe SERMA',
    description:
      'Le Groupe SERMA accompagne les entreprises et les individus vers l\'excellence économique et professionnelle au Bénin. Une alliance unique d\'expertise comptable et de formation pratique.',
    slogan: 'Former. Structurer. Performer.',
  },
};

const socialLinks = [
  { icon: Facebook, label: 'Facebook', href: data.facebookLink },
  { icon: Instagram, label: 'Instagram', href: data.instaLink },
  { icon: WhatsApp, label: 'WhatsApp', href: data.whatsappLink },
];

const aboutLinks = [
  { text: 'Qui sommes-nous', href: '/#presentation' },
  { text: 'Notre approche', href: '/#approche' },
  { text: 'Nos valeurs', href: '/#pourquoi' },
  { text: 'Ressources & Blog', href: '/blog' },
];

const serviceLinks = [
  { text: 'Tenue comptable', href: '/cabinet#services' },
  { text: 'Certification', href: '/cabinet#services' },
  { text: 'Conseil fiscal & social', href: '/cabinet#services' },
  { text: 'Prendre rendez-vous', href: '/cabinet#contact' },
];

const helpfulLinks = [
  { text: 'Les 5 filières métiers', href: '/academy#filieres' },
  { text: 'Formations courtes', href: '/academy#formations' },
  { text: 'Inscription cohorte', href: '/academy/inscription' },
  { text: 'Contact Academy', href: '/academy#contact' },
];

const contactInfo = [
  { icon: Mail, text: data.contact.email, href: `mailto:${data.contact.email}` },
  { icon: Phone, text: `Direct: ${data.contact.phone}`, href: `tel:${data.contact.phone.replace(/\s+/g, '')}` },
  { icon: Phone, text: `WhatsApp: ${data.contact.whatsapp}`, href: data.whatsappLink },
  { icon: MapPin, text: data.contact.address, isAddress: true },
];

export default function Footer4Col() {
  return (
    <footer className="bg-[#0C193D] border-t border-white/10 mt-20 w-full rounded-t-2xl">
      <div className="mx-auto max-w-screen-xl px-4 pt-16 pb-6 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div>
            <div className="text-white flex items-center justify-center gap-2 sm:justify-start">
              <span className="font-playfair text-2xl font-black tracking-tight">
                SERMA <span className="text-[#E07F0A]">GROUPE</span>
              </span>
            </div>

            <p className="text-[#E07F0A] font-mono text-xs uppercase tracking-wider font-semibold mt-2 text-center sm:text-left">
              {data.company.slogan}
            </p>

            <p className="text-slate-400 mt-6 max-w-md text-center text-sm leading-relaxed sm:max-w-xs sm:text-left">
              {data.company.description}
            </p>

            <ul className="mt-8 flex justify-center gap-6 sm:justify-start md:gap-8">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-[#E07F0A] transition"
                  >
                    <span className="sr-only">{label}</span>
                    <Icon className="size-6" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:col-span-2">
            <div className="text-center sm:text-left">
              <p className="text-white font-bold text-sm uppercase tracking-wider border-l-2 border-[#E07F0A] pl-2 mb-6">Le Groupe</p>
              <ul className="mt-6 space-y-4 text-sm">
                {aboutLinks.map(({ text, href }) => (
                  <li key={text}>
                    <Link
                      className="text-slate-400 hover:text-white transition"
                      href={href}
                    >
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <p className="text-white font-bold text-sm uppercase tracking-wider border-l-2 border-[#E07F0A] pl-2 mb-6">Cabinet SERMA</p>
              <ul className="mt-6 space-y-4 text-sm">
                {serviceLinks.map(({ text, href }) => (
                  <li key={text}>
                    <Link
                      className="text-slate-400 hover:text-white transition"
                      href={href}
                    >
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <p className="text-white font-bold text-sm uppercase tracking-wider border-l-2 border-[#E07F0A] pl-2 mb-6">Academy</p>
              <ul className="mt-6 space-y-4 text-sm">
                {helpfulLinks.map(({ text, href }) => (
                  <li key={text}>
                    <Link
                      href={href}
                      className="text-slate-400 hover:text-white transition"
                    >
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <p className="text-white font-bold text-sm uppercase tracking-wider border-l-2 border-[#E07F0A] pl-2 mb-6">Contact</p>
              <ul className="mt-6 space-y-4 text-sm">
                {contactInfo.map(({ icon: Icon, text, isAddress, href }) => (
                  <li key={text}>
                    {isAddress ? (
                      <div className="flex items-start justify-center gap-2 sm:justify-start text-left">
                        <Icon className="text-[#E07F0A] size-5 shrink-0 mt-0.5" />
                        <address className="text-slate-400 not-italic text-xs leading-relaxed">
                          {text}
                        </address>
                      </div>
                    ) : (
                      <a
                        className="flex items-center justify-center gap-2 sm:justify-start hover:text-white text-slate-400 transition"
                        href={href}
                        {...(href?.startsWith('http') ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        <Icon className="text-[#E07F0A] size-4 shrink-0" />
                        <span className="text-xs">{text}</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-6">
          <div className="text-center sm:flex sm:justify-between sm:text-left">
            <p className="text-xs text-slate-500">
              <span className="block sm:inline">Tous droits réservés.</span>
            </p>

            <p className="text-slate-500 mt-4 text-xs sm:order-first sm:mt-0">
              &copy; {new Date().getFullYear()} Groupe SERMA &middot; Cabinet SERMA SARL + SERMA HUB Impact Academy.
            </p>

            <div className="flex gap-4 mt-4 sm:mt-0 justify-center sm:justify-end text-xs text-slate-500">
              <Link href="/confidentialite" className="hover:underline">
                Politique de confidentialité
              </Link>
              <span>&middot;</span>
              <Link href="/mentions" className="hover:underline">
                Mentions légales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
