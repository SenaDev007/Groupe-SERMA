import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/shared/Hero";
import SectionHeader from "@/components/shared/SectionHeader";
import TestimonialCard from "@/components/shared/TestimonialCard";
import TestimonialsCarousel from "@/components/shared/TestimonialsCarousel";
import ContactCabinet from "@/components/cabinet/ContactCabinet";
import WhatsAppFAB from "@/components/shared/WhatsAppFAB";
import CTAButton from "@/components/shared/CTAButton";
import Reveal from "@/components/shared/Reveal";
import type { Metadata } from "next";
import { getPublicTestimonials } from "@/lib/back-office/public-content";
import {
  ArrowRight,
  BookOpen,
  FileCheck,
  ShieldAlert,
  Sparkles,
  Check,
  Building2,
  Landmark,
  Rocket,
  UserCheck,
  AlertTriangle,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";
import WhatsAppLink from "@/components/shared/WhatsAppLink";
import {
  buildWhatsAppUrl,
  WHATSAPP_MESSAGES,
} from "@/lib/whatsapp";

export const metadata: Metadata = {
  title:
    "Cabinet SERMA SARL — Expertise Comptable & Conseil Fiscal Parakou | Bénin",
  description:
    "Cabinet d'expertise comptable à Parakou. Tenue comptable, certification états financiers OHADA, conseil fiscal et social. Entreprises, ONG, startups.",
  openGraph: {
    title: "Cabinet SERMA SARL — Experts Comptables à Parakou, Bénin",
    description:
      "Expertise comptable OHADA, certification des états financiers, conseil fiscal et social.",
    type: "website",
  },
};

const services = [
  {
    icon: BookOpen,
    num: "01",
    title: "Tenue & Organisation Comptable",
    hook: "Vos livres de comptes sont à jour. Votre trésorerie est lisible. Vous pouvez prendre des décisions.",
    desc: "Beaucoup d'entreprises béninoises gèrent leur comptabilité à l'intuition — jusqu'au jour du contrôle ou du blocage bancaire. Nous intervenons en amont pour assainir vos finances.",
    items: [
      "Mise en place d'un système comptable conforme OHADA",
      "Tenue régulière de vos journaux comptables",
      "Suivi rigoureux de la trésorerie et rapports périodiques",
      "Archivage numérique et physique sécurisé de vos pièces",
    ],
    cta: "Discuter de ma comptabilité",
    premium: false,
  },
  {
    icon: FileCheck,
    num: "02",
    title: "Certification des États Financiers",
    hook: "Vos états financiers parlent à vos banquiers, bailleurs et investisseurs. Ils doivent être irréprochables.",
    desc: "Un état financier non certifié ou mal structuré peut bloquer un crédit, faire échouer un appel d'offres, ou attirer un redressement fiscal immédiat. On vous évite cela.",
    items: [
      "Établissement du bilan, compte de résultat et annexes",
      "Vérification de conformité SYSCOHADA révisé",
      "Certification officielle de vos états financiers de fin d'année",
      "Accompagnement lors d'audits externes par vos partenaires",
    ],
    cta: "Certifier mes états financiers",
    premium: false,
  },
  {
    icon: Sparkles,
    num: "03",
    title: "Conseil Fiscal & Social",
    hook: "Les impôts et la CNSS ne sont pas vos ennemis. Ce sont des règles. On vous apprend à les naviguer.",
    desc: "Payer trop, payer mal, payer en retard. Trois erreurs que l'on observe régulièrement chez les dirigeants d'entreprises qui ne disposent pas d'un conseiller fiscal dédié.",
    items: [
      "Déclarations fiscales dans les délais légaux (DFU, TVA, IS, IRF)",
      "Optimisation légale de la charge fiscale de votre structure",
      "Gestion des obligations sociales (CNSS, déclarations d'embauche)",
      "Conseil lors du choix de restructuration juridique ou fiscale",
    ],
    cta: "Optimiser ma fiscalité",
    premium: false,
  },
  {
    icon: ShieldAlert,
    num: "04",
    title: "Assistance & Déblocage Urgents",
    hook: "Un blocage CNSS. Un contrôle fiscal imprévu. Un différend avec les impôts. Nous intervenons rapidement.",
    desc: "Certaines situations ne peuvent pas attendre. Si votre compte est bloqué, si un agent fiscal est dans vos locaux, ou si vous avez reçu une mise en demeure : vous avez besoin d'un expert réactif.",
    items: [
      "Diagnostic et audit de crise immédiats de la situation",
      "Interface professionnelle avec l'administration fiscale et la CNSS",
      "Régularisation comptable accélérée pour lever les blocages",
      "Plan d'action préventif pour éviter toute récidive fiscale",
    ],
    cta: "Traiter une urgence",
    premium: true,
  },
];

const clients = [
  {
    icon: Building2,
    title: "PME & Commerçants",
    desc: "Besoin d'externaliser pour structurer la croissance sans recruter à plein temps.",
  },
  {
    icon: Landmark,
    title: "ONG & Associations",
    desc: "Obligations de rapports précis pour les bailleurs de fonds sous normes OHADA.",
  },
  {
    icon: Rocket,
    title: "Startups",
    desc: "Structuration juridique, prévisionnels financiers et comptabilité de démarrage.",
  },
  {
    icon: UserCheck,
    title: "Professions libérales",
    desc: "Médecins, avocats, consultants. Optimisation des déclarations personnelles.",
  },
  {
    icon: AlertTriangle,
    title: "Structures en crise",
    desc: "Arriérés, redressements ou litiges. Audit et régularisation d'urgence.",
  },
];

export const dynamic = "force-dynamic";

export default async function CabinetPage() {
  // Témoignages clients pilotés par le back-office (repli statique intégré)
  const temoignagesCabinet = await getPublicTestimonials("CABINET");

  return (
    <>
      <Navbar />

      {/* ── HERO CABINET ── */}
      <Hero
        backgroundOpacity={0.13}
        badge={
          <span className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-orange-logo/10 border border-orange-logo/30 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-vert-tech" />
            <span className="text-orange-logo font-bold text-[11px] sm:text-xs uppercase tracking-[0.16em]">
              Cabinet SERMA SARL — Expertise & Conseil
            </span>
          </span>
        }
        title={
          <>
            Votre comptabilité est en règle.
            <br />
            <span className="text-orange-logo">
              Votre business peut avancer.
            </span>
          </>
        }
        subtitle={
          <>
            Expertise comptable OHADA, certification des états financiers,
            conseil fiscal et social. Cabinet SERMA SARL prend en charge la
            conformité de votre structure — pour que vous puissiez diriger sans
            la peur du contrôle.
          </>
        }
        actions={
          <>
            <CTAButton href="#contact" variant="primary" breathing>
              Prendre rendez-vous
            </CTAButton>
            <CTAButton href="#services" variant="outline">
              Découvrir nos services
            </CTAButton>
          </>
        }
      />

      {/* ── SERVICES ── */}
      <section id="services" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 -right-24 w-80 h-80 rounded-full bg-orange-logo/[0.05] blur-[110px] pointer-events-none" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="Nos services"
            title="Ce que nous faisons pour"
            highlight="votre structure."
            subtitle="Quatre offres complémentaires — de la tenue quotidienne au déblocage d'urgence."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {services.map((service, i) => (
              <Reveal key={service.num} delay={0.06 * i}>
                <div
                  className={
                    service.premium
                      ? "relative flex flex-col h-full rounded-3xl bg-marine-profond text-white p-8 border-2 border-orange-logo/60 shadow-[0_24px_60px_rgba(12,25,61,0.32)] transition-transform duration-300 hover:-translate-y-2 overflow-hidden"
                      : "relative flex flex-col h-full rounded-3xl bg-white p-8 border border-marine-profond/10 shadow-[0_8px_32px_rgba(12,25,61,0.07)] transition-all duration-300 hover:-translate-y-2 hover:border-orange-logo/40 hover:shadow-[0_18px_48px_rgba(224,127,10,0.14)]"
                  }
                >
                  {service.premium && (
                    <>
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full bg-orange-logo text-white font-black text-[10px] uppercase tracking-[0.14em] shadow-lg z-10 whitespace-nowrap">
                        Intervention rapide
                      </span>
                      <div className="absolute inset-0 bg-grain-light opacity-40 pointer-events-none" aria-hidden />
                    </>
                  )}

                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={
                          service.premium
                            ? "w-[52px] h-[52px] bg-white/[0.09] border border-white/15 text-orange-logo rounded-2xl flex items-center justify-center"
                            : "w-[52px] h-[52px] bg-marine-profond text-orange-logo rounded-2xl flex items-center justify-center"
                        }
                      >
                        <service.icon className="w-6 h-6" strokeWidth={1.6} />
                      </div>
                      <span
                        className={
                          service.premium
                            ? "font-playfair text-3xl font-black text-orange-logo/40"
                            : "font-playfair text-3xl font-black text-marine-profond/10"
                        }
                      >
                        {service.num}
                      </span>
                    </div>

                    <h3
                      className={
                        service.premium
                          ? "font-playfair text-xl sm:text-2xl font-bold mb-3"
                          : "font-playfair text-xl sm:text-2xl font-bold text-marine-profond mb-3"
                      }
                    >
                      {service.title}
                    </h3>
                    <p
                      className={
                        service.premium
                          ? "text-orange-logo italic text-sm font-semibold mb-4 leading-relaxed border-l-2 border-orange-logo/50 pl-4"
                          : "text-orange-contrast italic text-sm font-semibold mb-4 leading-relaxed border-l-2 border-orange-logo/50 pl-4"
                      }
                    >
                      &ldquo;{service.hook}&rdquo;
                    </p>
                    <p
                      className={
                        service.premium
                          ? "text-slate-300 text-sm leading-relaxed mb-7"
                          : "text-gris-texte/90 text-sm leading-relaxed mb-7"
                      }
                    >
                      {service.desc}
                    </p>

                    <div
                      className={
                        service.premium
                          ? "w-full h-px bg-white/10 mb-6"
                          : "w-full h-px bg-marine-profond/[0.08] mb-6"
                      }
                    />

                    <p
                      className={
                        service.premium
                          ? "text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-3"
                          : "text-[11px] font-bold uppercase tracking-[0.12em] text-gris-texte mb-3"
                      }
                    >
                      Ce que nous faisons
                    </p>
                    <ul className="space-y-2.5 mb-8">
                      {service.items.map((item) => (
                        <li
                          key={item}
                          className={
                            service.premium
                              ? "flex items-start gap-2.5 text-slate-300 text-sm"
                              : "flex items-start gap-2.5 text-gris-texte text-sm"
                          }
                        >
                          <Check
                            className={
                              service.premium
                                ? "w-4 h-4 text-orange-logo shrink-0 mt-1"
                                : "w-4 h-4 text-vert-tech shrink-0 mt-1"
                            }
                            strokeWidth={2.5}
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href="#contact"
                    className={
                      service.premium
                        ? "relative group mt-auto inline-flex items-center justify-center gap-2 w-full py-4 rounded-full bg-orange-logo hover:bg-orange-sature text-white font-bold text-sm transition-colors"
                        : "relative group mt-auto inline-flex items-center justify-center gap-2 w-full py-4 rounded-full bg-marine-profond hover:bg-marine-moyen text-white font-bold text-sm transition-colors"
                    }
                  >
                    {service.cta}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOTRE MÉTHODE ── */}
      <section id="approche" className="py-24 bg-marine-profond text-white relative overflow-hidden rounded-t-[2.5rem] sm:rounded-t-[3rem] -mt-6">
        <div className="absolute inset-0 bg-grain-light opacity-50 pointer-events-none" aria-hidden />
        <div className="absolute -top-28 right-1/4 w-[380px] h-[380px] rounded-full bg-orange-logo/[0.08] blur-[110px] pointer-events-none" aria-hidden />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <Reveal className="lg:col-span-5">
              <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] bg-white/[0.07] text-orange-logo border border-white/15 mb-5">
                Notre méthode
              </span>
              <h2 className="font-playfair text-3xl sm:text-4xl md:text-[2.6rem] font-black tracking-tight leading-[1.15]">
                Nous ne tenons pas seulement vos livres.{" "}
                <span className="text-orange-logo">Nous vous guidons.</span>
              </h2>
              <div className="mt-6 h-1 w-16 bg-orange-logo rounded-full" />
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed mt-6">
                La comptabilité n&apos;est pas une fin en soi. C&apos;est un
                tableau de bord. Chez Cabinet SERMA SARL, chaque mission
                commence par la compréhension approfondie de votre activité, de
                vos contraintes et de vos objectifs.
              </p>
            </Reveal>

            <div className="lg:col-span-7 space-y-5">
              {[
                {
                  num: "01",
                  title: "Conformité d'abord",
                  desc: "Zéro compromis sur les normes OHADA et le SYSCOHADA révisé. Vos états financiers doivent être d'une rigueur absolue.",
                },
                {
                  num: "02",
                  title: "Lisibilité ensuite",
                  desc: "Vos chiffres doivent être lisibles pour vous — pas uniquement pour nous. Nous vous les expliquons pour faciliter vos décisions.",
                },
                {
                  num: "03",
                  title: "Anticipation toujours",
                  desc: "Nous ne réagissons pas aux crises. Nous mettons en place des alertes pour les détecter et les régler avant qu'elles ne soient coûteuses.",
                },
              ].map((principle, i) => (
                <Reveal key={principle.num} delay={0.08 * i}>
                  <div className="glass-panel-dark rounded-3xl p-6 sm:p-7 flex gap-5 items-start transition-colors duration-300 hover:border-orange-logo/40 group">
                    <span className="font-playfair text-3xl font-black text-orange-logo group-hover:text-orange-sature transition-colors">
                      {principle.num}
                    </span>
                    <div>
                      <h3 className="font-bold text-white mb-1.5">
                        {principle.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {principle.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── NOS CLIENTS ── */}
      <section id="clients" className="py-24 bg-white relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="Nos clients"
            title="Du commerçant local à"
            highlight="la multinationale."
            subtitle="Cinq profils de structures, un même niveau d'exigence. On adapte."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {clients.map((client, i) => (
              <Reveal key={client.title} delay={0.06 * i}>
                <div className="group h-full bg-gris-bleute/70 border border-marine-profond/[0.07] rounded-3xl p-6 text-left hover:border-orange-logo/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col">
                  <div className="mb-5 w-12 h-12 bg-white border border-marine-profond/[0.07] text-orange-contrast rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-orange-logo group-hover:text-white group-hover:border-orange-logo transition-all duration-300">
                    <client.icon className="w-[22px] h-[22px]" strokeWidth={1.6} />
                  </div>
                  <h4 className="font-bold text-sm text-marine-profond mb-2">
                    {client.title}
                  </h4>
                  <p className="text-gris-texte/80 text-xs leading-relaxed">
                    {client.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section id="temoignages" className="py-24 bg-gris-bleute relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="Résultats clients"
            title="Ce que nos clients"
            highlight="disent de nous."
          />

          <TestimonialsCarousel
            items={temoignagesCabinet.map((t, i) => (
              <Reveal key={`temoignage-cabinet-${i}`} delay={0.12 * i}>
                <TestimonialCard
                  result={t.result}
                  quote={t.quote}
                  author={t.author}
                  roleOrSub={t.roleOrSub}
                />
              </Reveal>
            ))}
          />
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-vert-tech/[0.06] blur-[100px] pointer-events-none" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <Reveal className="lg:col-span-5">
              <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] bg-orange-logo/[0.08] text-orange-contrast border border-orange-logo/20 mb-5">
                Prendre contact
              </span>
              <h2 className="font-playfair text-3xl sm:text-4xl font-extrabold tracking-tight text-marine-profond leading-[1.15]">
                Parlons de votre comptabilité et de votre{" "}
                <span className="text-orange-contrast">fiscalité.</span>
              </h2>
              <div className="mt-6 h-1 w-16 bg-orange-logo rounded-full" />
              <p className="text-gris-texte text-sm sm:text-base leading-relaxed mt-6 mb-8">
                Remplissez ce formulaire de demande d&apos;analyse. L&apos;un de
                nos comptables qualifiés étudiera votre dossier et prendra
                contact avec vous sous 24h ouvrées.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3.5 text-sm">
                  <span className="w-10 h-10 rounded-full bg-gris-bleute text-orange-contrast flex items-center justify-center shrink-0">
                    <MapPin className="w-[18px] h-[18px]" />
                  </span>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-[0.12em] text-gris-texte/70">
                      Bureau
                    </p>
                    <p className="font-semibold text-marine-profond">
                      Zongo 2, Parakou
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 text-sm">
                  <span className="w-10 h-10 rounded-full bg-gris-bleute text-orange-contrast flex items-center justify-center shrink-0">
                    <Phone className="w-[18px] h-[18px]" />
                  </span>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-[0.12em] text-gris-texte/70">
                      Téléphone
                    </p>
                    <a
                      href="tel:+2290140377199"
                      className="font-semibold text-marine-profond hover:text-orange-contrast transition-colors"
                    >
                      +229 01 40 37 71 99
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 text-sm">
                  <span className="w-10 h-10 rounded-full bg-gris-bleute text-vert-tech flex items-center justify-center shrink-0">
                    <WhatsAppIcon className="w-[18px] h-[18px]" />
                  </span>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-[0.12em] text-gris-texte/70">
                      WhatsApp
                    </p>
                    <WhatsAppLink
                      href={buildWhatsAppUrl(WHATSAPP_MESSAGES.cabinet)}
                      source="cabinet"
                      ariaLabel="Contacter le Cabinet SERMA sur WhatsApp"
                      className="font-semibold text-marine-profond hover:text-vert-tech transition-colors inline-flex items-center gap-1.5"
                    >
                      +229 01 40 37 71 99
                    </WhatsAppLink>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.12} className="lg:col-span-7">
              <ContactCabinet />
            </Reveal>
          </div>
        </div>
      </section>

      <WhatsAppFAB />
      <Footer />
    </>
  );
}
