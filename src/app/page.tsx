import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/shared/Hero";
import SectionHeader from "@/components/shared/SectionHeader";
import StatsCounter from "@/components/shared/StatsCounter";
import TestimonialCard from "@/components/shared/TestimonialCard";
import TestimonialsCarousel from "@/components/shared/TestimonialsCarousel";
import ExpertiseAccordion from "@/components/shared/ExpertiseAccordion";
import WhatsAppFAB from "@/components/shared/WhatsAppFAB";
import CTAButton from "@/components/shared/CTAButton";
import Reveal, { staggerContainer, staggerItem } from "@/components/shared/Reveal";
import {
  Scale,
  GraduationCap,
  ArrowRight,
  MapPin,
  Phone,
  CheckCircle2,
} from "lucide-react";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";
import WhatsAppLink from "@/components/shared/WhatsAppLink";
import {
  buildWhatsAppUrl,
  WHATSAPP_MESSAGES,
} from "@/lib/whatsapp";
import { getPublicTestimonials } from "@/lib/back-office/public-content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Témoignages mixtes pilotés par le back-office (repli statique intégré)
  const [temoignagesCabinetHome, temoignagesAcademyHome] = await Promise.all([
    getPublicTestimonials("CABINET"),
    getPublicTestimonials("ACADEMY"),
  ]);
  const temoignagesHome = [
    ...temoignagesCabinetHome.slice(0, 2),
    ...temoignagesAcademyHome.slice(0, 1),
  ];

  return (
    <>
      <Navbar />

      {/* ── 01 · HERO GROUPE ── */}
      <Hero
        badge={
          <span className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-orange-logo/10 border border-orange-logo/30 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vert-tech opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-vert-tech" />
            </span>
            <span className="text-orange-logo font-bold text-[11px] sm:text-xs uppercase tracking-[0.18em]">
              Groupe SERMA — Parakou, Bénin
            </span>
          </span>
        }
        title={
          <>
            Former. Structurer.
            <br />
            <span className="text-orange-logo">Performer.</span>
            <span className="sr-only"> Le Groupe SERMA à Parakou.</span>
          </>
        }
        subtitle={
          <>
            Une alliance unique : l&apos;expertise comptable du{" "}
            <strong className="text-white">Cabinet SERMA SARL</strong> et la
            puissance pédagogique de{" "}
            <strong className="text-white">SERMA HUB Impact Academy</strong>.
            Pour les entreprises qui veulent grandir. Pour les individus qui
            veulent changer leur vie.
          </>
        }
        actions={
          <>
            <CTAButton href="/cabinet" variant="premium">
              Je cherche un expert-comptable
            </CTAButton>
            <CTAButton href="/academy" variant="primary" breathing>
              Je veux me former
            </CTAButton>
          </>
        }
      />

      {/* ── 02 · PRÉSENTATION GROUPE ── */}
      <section id="presentation" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-10 -left-20 w-72 h-72 rounded-full bg-orange-logo/[0.05] blur-[100px] pointer-events-none" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">
            <Reveal className="md:col-span-5">
              <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] bg-orange-logo/[0.08] text-orange-contrast border border-orange-logo/20 mb-5">
                Qui sommes-nous
              </span>
              <h2 className="font-playfair text-3xl sm:text-4xl md:text-[2.6rem] font-extrabold tracking-tight text-marine-profond leading-[1.15]">
                Deux expertises. Un seul engagement :{" "}
                <span className="text-orange-contrast">des résultats.</span>
              </h2>
              <div className="mt-7 h-1 w-16 bg-orange-logo rounded-full" />
            </Reveal>

            <Reveal delay={0.15} className="md:col-span-7">
              <p className="text-gris-texte text-base sm:text-lg leading-relaxed mb-6 font-medium">
                Le Groupe SERMA est né d&apos;un constat simple : les
                entreprises béninoises ont besoin de deux choses pour prospérer.
                Des comptes en ordre. Et des équipes compétentes.
              </p>
              <p className="text-gris-texte/80 text-sm sm:text-base leading-relaxed">
                Le{" "}
                <strong className="text-marine-profond">
                  Cabinet SERMA SARL
                </strong>{" "}
                s&apos;occupe de la première.{" "}
                <strong className="text-marine-profond">
                  SERMA HUB Impact Academy
                </strong>{" "}
                s&apos;occupe de la seconde. Ensemble, ils forment le partenaire
                le plus complet du développement économique à Parakou.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 03 · CHIFFRES CLÉS ── */}
      <section className="py-20 bg-gris-bleute relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" aria-hidden />
        <div className="absolute -top-24 right-1/4 w-80 h-80 rounded-full bg-orange-logo/[0.06] blur-[100px] pointer-events-none" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7">
            <StatsCounter value="50+" label="Entreprises & ONG accompagnées" />
            <StatsCounter value="200+" label="Apprenants formés" />
            <StatsCounter value="5" label="Filières métiers maîtrisées" />
            <StatsCounter value="100%" label="Pratique — zéro théorie inutile" />
          </Reveal>
        </div>
      </section>

      {/* ── 04 · CARDS DES DEUX ESPACES ── */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="Notre écosystème"
            title="Choisissez votre"
            highlight="espace."
            subtitle="Deux espaces, deux parcours, une seule exigence d'excellence. Le visiteur sait en trois secondes où il doit aller."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Card Cabinet — premium inversée marine */}
            <Reveal>
              <div className="relative edge-glow flex flex-col h-full rounded-3xl bg-marine-profond text-white p-8 sm:p-10 border-2 border-orange-logo/60 shadow-[0_24px_60px_rgba(12,25,61,0.35)] transition-transform duration-300 hover:-translate-y-2 overflow-hidden">
                <div className="absolute inset-0 bg-grain-light opacity-40 pointer-events-none" aria-hidden />
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full bg-orange-logo text-white font-black text-[10px] uppercase tracking-[0.14em] shadow-lg z-10 whitespace-nowrap">
                  Espace Entreprises
                </span>

                <div className="relative">
                  <div className="w-14 h-14 bg-white/[0.08] border border-white/15 text-orange-logo rounded-2xl flex items-center justify-center mb-6">
                    <Scale className="w-7 h-7" strokeWidth={1.6} />
                  </div>
                  <h3 className="font-playfair text-2xl sm:text-[1.7rem] font-bold mb-2">
                    Cabinet SERMA SARL
                  </h3>
                  <p className="text-orange-logo font-bold text-[11px] uppercase tracking-[0.14em] mb-6">
                    Expertise Comptable & Conseil Fiscal
                  </p>
                  <p className="text-slate-300 text-sm sm:text-[15px] leading-relaxed mb-8">
                    Votre comptabilité OHADA, vos états financiers certifiés,
                    votre conformité fiscale et sociale. On s&apos;occupe de
                    tout — pour que vous puissiez vous concentrer sur ce qui
                    compte vraiment : développer votre activité.
                  </p>
                </div>

                <div className="relative mt-auto pt-6 border-t border-white/10">
                  <Link
                    href="/cabinet"
                    className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-orange-logo hover:bg-orange-sature text-white font-bold text-sm transition-colors"
                  >
                    Découvrir le Cabinet
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </Reveal>

            {/* Card Academy — carte claire orange/vert */}
            <Reveal delay={0.12}>
              <div className="relative flex flex-col h-full rounded-3xl bg-white p-8 sm:p-10 border border-marine-profond/10 shadow-[0_8px_32px_rgba(12,25,61,0.08)] transition-all duration-300 hover:-translate-y-2 hover:border-orange-logo/40 hover:shadow-[0_20px_52px_rgba(224,127,10,0.15)] overflow-hidden">
                <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-orange-logo/[0.07] blur-[70px] pointer-events-none" aria-hidden />
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full bg-vert-tech text-white font-black text-[10px] uppercase tracking-[0.14em] shadow-lg z-10 whitespace-nowrap">
                  Espace Formations
                </span>

                <div className="relative">
                  <div className="w-14 h-14 bg-orange-logo/10 border border-orange-logo/25 text-orange-contrast rounded-2xl flex items-center justify-center mb-6">
                    <GraduationCap className="w-7 h-7" strokeWidth={1.6} />
                  </div>
                  <h3 className="font-playfair text-2xl sm:text-[1.7rem] font-bold text-marine-profond mb-2">
                    SERMA HUB Impact Academy
                  </h3>
                  <p className="text-orange-contrast font-bold text-[11px] uppercase tracking-[0.14em] mb-6">
                    Formation Professionnelle & Entrepreneuriat
                  </p>
                  <p className="text-gris-texte text-sm sm:text-[15px] leading-relaxed mb-8">
                    Tu travailles dur. Mais les résultats ne suivent pas.
                    L&apos;Academy te donne les compétences concrètes pour
                    changer ça — en commerce, agro-business, digital, services
                    techniques ou entrepreneuriat féminin.
                  </p>
                  <div className="flex items-center gap-2 mb-2 -mt-4 mb-8">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vert-tech opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-vert-tech" />
                    </span>
                    <span className="text-vert-tech text-xs font-bold">
                      Inscriptions ouvertes — places limitées à 10 par cohorte
                    </span>
                  </div>
                </div>

                <div className="relative mt-auto pt-6 border-t border-marine-profond/[0.08]">
                  <Link
                    href="/academy"
                    className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-marine-profond hover:bg-marine-moyen text-white font-bold text-sm transition-colors"
                  >
                    Découvrir l&apos;Academy
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 05 · ACCORDÉON EXPERTISES ── */}
      <ExpertiseAccordion />

      {/* ── 06 · POURQUOI SERMA ── */}
      <section id="pourquoi" className="py-24 bg-marine-profond text-white relative overflow-hidden rounded-t-[2.5rem] sm:rounded-t-[3rem] -mt-6">
        <div className="absolute inset-0 bg-grain-light opacity-50 pointer-events-none" aria-hidden />
        <div className="absolute -top-32 left-1/4 w-[420px] h-[420px] rounded-full bg-orange-logo/[0.08] blur-[120px] pointer-events-none" aria-hidden />
        <div className="absolute bottom-0 -right-24 w-80 h-80 rounded-full bg-vert-tech/[0.1] blur-[100px] pointer-events-none" aria-hidden />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tone="dark"
            kicker="Notre différence"
            title="Pourquoi choisir le"
            highlight="Groupe SERMA ?"
            subtitle="Quatre arguments qui font la différence entre un prestataire et un partenaire."
          />

          <Reveal
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            delay={0.1}
          >
            {[
              {
                num: "01",
                title: "Approche 360°",
                desc: "Formation, application et certification au sein d'un seul écosystème. Vous n'avez pas besoin d'aller ailleurs.",
              },
              {
                num: "02",
                title: "Ancrage local",
                desc: "Nous connaissons parfaitement le marché béninois, les normes OHADA et le contexte de Parakou. Nos solutions fonctionnent ici.",
              },
              {
                num: "03",
                title: "Résultats mesurables",
                desc: "Nos clients certifient leurs comptes et passent les contrôles sans peur. Nos apprenants lancent des activités réelles.",
              },
              {
                num: "04",
                title: "Accompagnement continu",
                desc: "Nous ne disparaissons pas après la prestation. Le suivi fait partie intégrante de notre service, sans supplément.",
              },
            ].map((item, i) => (
              <div
                key={item.num}
                className="glass-panel-dark rounded-3xl p-7 sm:p-8 flex items-start gap-5 transition-colors duration-300 hover:border-orange-logo/40 group"
              >
                <span className="font-playfair text-4xl font-black text-orange-logo/50 leading-none group-hover:text-orange-logo transition-colors">
                  {item.num}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── 07 · TÉMOIGNAGES ── */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="Réussites"
            title="Ils ont fait confiance à"
            highlight="SERMA."
            subtitle="Le social proof mixte : clients entreprises du Cabinet et apprenants de l'Academy."
          />

          <TestimonialsCarousel
            items={temoignagesHome.map((t, i) => (
              <Reveal key={`temoignage-home-${i}`} delay={0.12 * i}>
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

      {/* ── 08 · CONTACT RAPIDE ── */}
      <section id="contact" className="py-24 bg-gris-bleute relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" aria-hidden />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-orange-logo/[0.06] blur-[110px] pointer-events-none" aria-hidden />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="Contact"
            title="Une question ?"
            highlight="On répond aujourd'hui."
            subtitle="Que vous cherchiez un expert-comptable ou une formation adaptée à votre profil — écrivez-nous."
          />

          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <WhatsAppLink
              href={buildWhatsAppUrl(WHATSAPP_MESSAGES.homepage)}
              source="homepage"
              ariaLabel="Contacter le Groupe SERMA sur WhatsApp"
              className="group bg-white rounded-3xl border border-marine-profond/10 hover:border-vert-tech/50 p-7 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(55,137,100,0.16)]"
            >
              <div className="w-12 h-12 bg-vert-tech/10 text-vert-tech rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <WhatsAppIcon className="w-[22px] h-[22px]" />
              </div>
              <div>
                <p className="text-[10px] text-gris-texte uppercase font-bold tracking-[0.12em] mb-1.5">
                  WhatsApp
                </p>
                <p className="text-marine-profond text-sm font-bold">
                  +229 01 40 37 71 99
                </p>
                <p className="text-gris-texte/70 text-xs mt-1.5">
                  Discuter directement
                </p>
              </div>
            </WhatsAppLink>

            <a
              href="tel:+2290196237343"
              className="group bg-white rounded-3xl border border-marine-profond/10 hover:border-orange-logo/50 p-7 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(224,127,10,0.16)]"
            >
              <div className="w-12 h-12 bg-orange-logo/10 text-orange-contrast rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Phone className="w-[22px] h-[22px]" strokeWidth={1.7} />
              </div>
              <div>
                <p className="text-[10px] text-gris-texte uppercase font-bold tracking-[0.12em] mb-1.5">
                  Téléphone
                </p>
                <p className="text-marine-profond text-sm font-bold">
                  +229 01 96 23 73 43
                </p>
                <p className="text-gris-texte/70 text-xs mt-1.5">
                  Appeler notre bureau
                </p>
              </div>
            </a>

            <div className="bg-white rounded-3xl border border-marine-profond/10 p-7 flex items-start gap-4">
              <div className="w-12 h-12 bg-marine-profond/8 bg-marine-profond/[0.07] text-marine-profond rounded-2xl flex items-center justify-center shrink-0">
                <MapPin className="w-[22px] h-[22px]" strokeWidth={1.7} />
              </div>
              <div>
                <p className="text-[10px] text-gris-texte uppercase font-bold tracking-[0.12em] mb-1.5">
                  Adresse
                </p>
                <p className="text-marine-profond text-sm font-bold leading-snug">
                  Zongo 2, axe BENI CHIC – PRESIDO
                </p>
                <p className="text-gris-texte/70 text-xs mt-1.5">
                  Parakou, Bénin
                </p>
              </div>
            </div>
          </Reveal>

          {/* Bandeau conversion */}
          <Reveal delay={0.15} className="mt-14 max-w-4xl mx-auto">
            <div className="relative edge-glow rounded-3xl bg-marine-profond text-white p-8 sm:p-10 text-center overflow-hidden">
              <div className="absolute inset-0 bg-grain-light opacity-40 pointer-events-none" aria-hidden />
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-orange-logo/15 blur-[70px] pointer-events-none" aria-hidden />
              <div className="relative">
                <h3 className="font-playfair text-2xl sm:text-3xl font-bold mb-3">
                  Prêt à passer à l&apos;action ?
                </h3>
                <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
                  Prenez rendez-vous avec le Cabinet ou réservez votre place
                  dans la prochaine cohorte de l&apos;Academy.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <CTAButton href="/cabinet#contact" variant="primary">
                    Prendre rendez-vous
                  </CTAButton>
                  <CTAButton href="/academy/inscription" variant="outline">
                    Réserver ma place
                  </CTAButton>
                </div>
                <p className="flex items-center justify-center gap-2 mt-7 text-xs text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-vert-tech" />
                  Réponse garantie sous 24h — par un expert, pas un commercial.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <WhatsAppFAB />
      <Footer />
    </>
  );
}
