import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/shared/Hero";
import SectionHeader from "@/components/shared/SectionHeader";
import StatsCounter from "@/components/shared/StatsCounter";
import TestimonialCard from "@/components/shared/TestimonialCard";
import TestimonialsCarousel from "@/components/shared/TestimonialsCarousel";
import WhatsAppFAB from "@/components/shared/WhatsAppFAB";
import CTAButton from "@/components/shared/CTAButton";
import Reveal from "@/components/shared/Reveal";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronRight,
  Phone,
  MapPin,
  Check,
  X,
  GraduationCap,
  Wallet,
  TrendingUp,
  Target,
  Users,
} from "lucide-react";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";
import WhatsAppLink from "@/components/shared/WhatsAppLink";
import {
  buildWhatsAppUrl,
  WHATSAPP_MESSAGES,
} from "@/lib/whatsapp";
import {
  getPublicFilieres,
  getPublicFormationsCourtes,
  getPublicTestimonials,
} from "@/lib/back-office/public-content";

/** Icônes des filières — attribuées par ordre d'affichage. */
const FILIERE_ICONS = [Wallet, TrendingUp, Target, GraduationCap, Users, Sparkles, CheckCircle2, ArrowRight];

export const metadata: Metadata = {
  title:
    "SERMA HUB Impact Academy — Formation Professionnelle Pratique à Parakou",
  description:
    "Centre de formation professionnelle à Parakou. 5 filières métiers, formations comptables certifiantes. Tu repars avec une activité réelle.",
  openGraph: {
    title: "SERMA HUB Impact Academy — Forme-toi. Lance-toi. Parakou, Bénin.",
    description:
      "Formations pratiques en commerce, agro-business, digital, services techniques, entrepreneuriat féminin.",
    type: "website",
  },
};

const profils = [
  {
    title: "L'étudiant",
    desc: "Tu sors de l'université ou du lycée sans expérience pratique du terrain. Nous te donnons une compétence réelle et une activité lancée pendant ta formation.",
  },
  {
    title: "Le chercheur d'emploi",
    desc: "Le marché ne répond pas ou tu stagnes. Nous t'apprenons à lancer ton propre service ou commerce autonome et rentable.",
  },
  {
    title: "La femme entrepreneure",
    desc: "Tu as déjà une petite activité mais tu n'arrives pas à la faire décoller. Nous t'apportons les clés de la gestion de stock et financière.",
  },
  {
    title: "Le professionnel",
    desc: "Tu es déjà en poste mais tu manques de maîtrise sur PERFECTO ou SYSCOHADA. Forme-toi en 3 jours intensifs pour monter en grade.",
  },
  {
    title: "Le porteur de projet",
    desc: "Tu as une idée mais tu ne sais pas comment la structurer ou démarrer. Nos coachs t'accompagnent pour bâtir ton plan de démarrage.",
  },
];

export const dynamic = "force-dynamic";

export default async function AcademyPage() {
  // Contenus pilotés depuis le back-office (repli statique intégré)
  const [filieres, formations, temoignagesAcademy] = await Promise.all([
    getPublicFilieres(),
    getPublicFormationsCourtes(),
    getPublicTestimonials("ACADEMY"),
  ]);
  return (
    <>
      <Navbar />

      {/* ── HERO ACADEMY ── */}
      <Hero
        backgroundOpacity={0.18}
        badge={
          <span className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-vert-tech/15 border border-vert-tech/40 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vert-tech opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-vert-tech" />
            </span>
            <span className="text-vert-tech font-bold text-[11px] sm:text-xs uppercase tracking-[0.16em]">
              Inscriptions ouvertes — Places limitées à 10
            </span>
          </span>
        }
        title={
          <>
            Tu travailles beaucoup. Mais l&apos;argent ne reste pas.
            <br />
            <span className="text-orange-logo">
              On t&apos;apprend pourquoi — et comment changer ça.
            </span>
          </>
        }
        subtitle={
          <>
            SERMA HUB ne forme pas pour accumuler des certificats théoriques.
            On forme pour créer des activités réelles qui génèrent vraiment des
            revenus durables. Tu repars avec un projet concret — pas une
            attestation de plus.
          </>
        }
        actions={
          <>
            <CTAButton href="/academy/inscription" variant="primary" breathing>
              M&apos;inscrire à la prochaine cohorte
            </CTAButton>
            <CTAButton href="#filieres" variant="outline">
              Voir les filières & formations
            </CTAButton>
          </>
        }
      />

      {/* ── NOTRE CONCEPT ── */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-vert-tech/[0.05] blur-[100px] pointer-events-none" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="Notre concept"
            title="La différence SERMA HUB"
            highlight="Impact Academy."
            subtitle="La différence entre une formation théorique qui vous occupe et une formation pratique qui change votre vie."
          />

          <Reveal>
            <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden border border-marine-profond/[0.1] shadow-[0_16px_52px_rgba(12,25,61,0.1)]">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Les autres */}
                <div className="p-8 sm:p-10 text-left bg-gris-bleute/70">
                  <h3 className="font-playfair text-lg font-bold text-gris-texte flex items-center gap-2.5 mb-7">
                    <XCircle className="w-5 h-5 text-red-400" />
                    CE QUE FONT LES AUTRES
                  </h3>
                  <ul className="space-y-4">
                    {[
                      "Cours uniquement théoriques dispensés en salle.",
                      "Simple remise d'une attestation de participation à la fin.",
                      "Aucun accompagnement ni suivi post-formation.",
                      "Contenu standard copié de l'étranger sans contextualisation.",
                      "Aucun accès à des solutions concrètes de financement.",
                    ].map((text, i) => (
                      <li
                        key={i}
                        className="text-gris-texte/70 text-sm leading-relaxed flex items-start gap-3"
                      >
                        <span className="w-5 h-5 rounded-full bg-red-50 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                          <X className="w-3 h-3" strokeWidth={2.5} />
                        </span>
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* SERMA HUB — côté premium */}
                <div className="relative p-8 sm:p-10 text-left bg-marine-profond text-white overflow-hidden">
                  <div className="absolute inset-0 bg-grain-light opacity-40 pointer-events-none" aria-hidden />
                  <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-orange-logo/15 blur-[60px] pointer-events-none" aria-hidden />
                  <span className="absolute top-5 right-5 bg-orange-logo rounded-full px-4 py-1.5 text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    Recommandé
                  </span>
                  <h3 className="relative font-playfair text-lg font-bold flex items-center gap-2.5 mb-7">
                    <CheckCircle2 className="w-5 h-5 text-vert-tech" />
                    L&apos;ACADEMY SERMA HUB
                  </h3>
                  <ul className="relative space-y-4">
                    {[
                      "Pratique sur le terrain dès le premier jour d'apprentissage.",
                      "Activité réelle lancée et validée pendant la formation.",
                      "Accompagnement post-formation et coaching personnalisé.",
                      "Contenu 100% adapté au marché béninois et ouest-africain.",
                      "Possibilité d'accès aux microcrédits partenaires pour démarrer.",
                    ].map((text, i) => (
                      <li
                        key={i}
                        className="font-semibold text-sm leading-relaxed flex items-start gap-3"
                      >
                        <span className="w-5 h-5 rounded-full bg-vert-tech/20 text-vert-tech flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3" strokeWidth={2.5} />
                        </span>
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CHIFFRES ACADEMY ── */}
      <section className="py-20 bg-gris-bleute relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7">
            <StatsCounter value="200+" label="Apprenants formés" />
            <StatsCounter value="5" label="Filières métiers" />
            <StatsCounter value="100%" label="Formations pratiques" />
            <StatsCounter value="10" label="Participants max / cohorte" />
          </Reveal>
        </div>
      </section>

      {/* ── LES 5 FILIÈRES ── */}
      <section id="filieres" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-1/4 -right-28 w-96 h-96 rounded-full bg-orange-logo/[0.05] blur-[120px] pointer-events-none" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="Nos filières"
            title="Quelle activité veux-tu"
            highlight="lancer ?"
            subtitle="Cinq filières métiers, un même principe : tu sors avec une activité réelle, pas un certificat mural."
          />

          <div className="space-y-8">
            {filieres.map((filiere, i) => {
              const FiliereIcon = FILIERE_ICONS[i % FILIERE_ICONS.length];
              return (
              <Reveal key={filiere.num} delay={0.05 * i}>
                <div className="group relative bg-gris-bleute/60 border border-marine-profond/[0.08] rounded-3xl p-7 sm:p-10 text-left hover:border-orange-logo/40 transition-all duration-300 hover:shadow-[0_18px_52px_rgba(224,127,10,0.12)] overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-orange-logo/[0.06] blur-[70px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" aria-hidden />

                  <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-7">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-4">
                        <span className="w-[52px] h-[52px] bg-marine-profond text-orange-logo rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <FiliereIcon className="w-6 h-6" strokeWidth={1.6} />
                        </span>
                        <h3 className="font-playfair text-xl sm:text-2xl font-black text-marine-profond">
                          <span className="text-orange-logo">{filiere.num}.</span>{" "}
                          {filiere.title}
                        </h3>
                      </div>

                      <p className="text-orange-contrast font-bold text-[15px] italic leading-relaxed border-l-2 border-orange-logo/50 pl-4">
                        &ldquo;{filiere.hook}&rdquo;
                      </p>
                      <p className="text-gris-texte text-sm leading-relaxed max-w-2xl">
                        {filiere.desc}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.12em] font-bold text-marine-profond mb-2.5">
                            Ce que tu vas apprendre
                          </p>
                          <ul className="space-y-2 text-xs text-gris-texte">
                            {filiere.learns.map((l, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-logo shrink-0" />
                                <span>{l}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-white rounded-2xl p-4 border border-vert-tech/25 flex flex-col justify-center">
                          <p className="text-[10px] uppercase font-bold text-vert-tech mb-1.5">
                            À la sortie de la formation
                          </p>
                          <p className="text-marine-profond text-xs font-semibold leading-relaxed">
                            {filiere.outcome}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0 self-stretch flex md:flex-col justify-end items-stretch md:items-end">
                      <Link
                        href="/academy/inscription"
                        className="group/cta inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-marine-profond hover:bg-orange-logo text-white hover:shadow-[0_8px_26px_rgba(224,127,10,0.35)] text-xs font-bold uppercase tracking-wider transition-all duration-300 gap-2"
                      >
                        Rejoindre cette filière
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/cta:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FORMATIONS COURTES ── */}
      <section id="formations" className="py-24 bg-marine-profond text-white relative overflow-hidden rounded-t-[2.5rem] sm:rounded-t-[3rem] -mt-6">
        <div className="absolute inset-0 bg-grain-light opacity-50 pointer-events-none" aria-hidden />
        <div className="absolute -top-32 left-1/3 w-[420px] h-[420px] rounded-full bg-orange-logo/[0.08] blur-[120px] pointer-events-none" aria-hidden />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tone="dark"
            kicker="Formations comptables"
            title="Formations Courtes"
            highlight="Professionnelles."
            subtitle="Ces formations s'adressent aux comptables, caissiers, gestionnaires de projets, ou étudiants en gestion. Format court de 3 jours, en présentiel à Parakou et en ligne."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {formations.map((formation, i) => (
              <Reveal key={formation.title} delay={0.08 * i}>
                <div className="glass-panel-dark rounded-3xl p-7 flex flex-col justify-between h-full transition-colors duration-300 hover:border-orange-logo/40">
                  <div>
                    <h3 className="font-playfair text-lg font-bold mb-2.5">
                      {formation.title}
                    </h3>
                    <p className="text-orange-logo text-xs font-semibold mb-5 italic leading-relaxed">
                      {formation.hook}
                    </p>
                    <div className="h-px bg-white/10 mb-5" />
                    <p className="text-[11px] uppercase tracking-[0.12em] font-bold text-slate-400 mb-3">
                      Compétences acquises
                    </p>
                    <ul className="space-y-2.5 text-xs text-slate-300">
                      {formation.skills.map((skill) => (
                        <li key={skill} className="flex items-start gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-orange-logo shrink-0 mt-0.5" />
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href="/academy/inscription"
                    className="group/cta w-full inline-flex items-center justify-center gap-2 mt-8 py-3.5 rounded-full border border-white/15 hover:bg-orange-logo hover:border-orange-logo hover:shadow-[0_8px_26px_rgba(224,127,10,0.35)] text-xs font-bold uppercase tracking-wider transition-all duration-300"
                  >
                    S&apos;inscrire à ce module
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/cta:translate-x-1" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── EST-CE FAIT POUR TOI ? ── */}
      <section id="profils" className="py-24 bg-white relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="Public cible"
            title="Est-ce fait"
            highlight="pour toi ?"
            subtitle="Si tu te reconnais dans l'un de ces profils — oui, la réponse est oui."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {profils.map((p, i) => (
              <Reveal key={p.title} delay={0.06 * i} className={i === 4 ? "md:col-span-2 lg:col-span-1" : ""}>
                <div className="h-full bg-gris-bleute/70 border border-marine-profond/[0.08] rounded-3xl p-6 text-left hover:border-orange-logo/40 hover:-translate-y-1 transition-all duration-300">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-orange-logo/10 text-orange-contrast font-inter font-black text-xs mb-4">
                    0{i + 1}
                  </span>
                  <h4 className="font-playfair font-bold text-base text-marine-profond mb-2">
                    {p.title}
                  </h4>
                  <p className="text-gris-texte/85 text-xs sm:text-sm leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ACADEMY ── */}
      <section id="temoignages" className="py-24 bg-gris-bleute relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="Résultats de nos élèves"
            title="Ils ont démarré"
            highlight="comme toi."
          />

          <TestimonialsCarousel
            items={temoignagesAcademy.map((t, i) => (
              <Reveal key={`temoignage-academy-${i}`} delay={0.12 * i}>
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

      {/* ── CTA BANNER ── */}
      <section className="relative py-20 bg-orange-logo overflow-hidden">
        <div className="absolute inset-0 bg-grain-light opacity-30 pointer-events-none" aria-hidden />
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/15 blur-[80px] pointer-events-none" aria-hidden />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
            Prêt à changer de niveau ?
          </h2>
          <p className="text-white/90 text-base sm:text-lg max-w-xl mx-auto font-medium">
            Sélection sur dossier, cohorte limitée à 10 participants. Réserve ta
            place dès aujourd&apos;hui en remplissant le formulaire
            d&apos;inscription.
          </p>
          <div className="pt-3">
            <Link
              href="/academy/inscription"
              className="group inline-flex items-center justify-center px-9 py-4.5 py-4 rounded-full bg-marine-profond hover:bg-marine-moyen text-white font-bold text-base transition-all duration-200 shadow-[0_16px_44px_rgba(12,25,61,0.4)] gap-2.5"
            >
              Remplir le formulaire d&apos;inscription
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <p className="text-white/85 text-xs font-semibold uppercase tracking-wider">
            Frais d&apos;inscription : 2 000 FCFA · Formation 100% offerte par
            le Hub
          </p>
        </div>
      </section>

      {/* ── CONTACT ACADEMY ── */}
      <section id="contact" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-vert-tech/[0.06] blur-[100px] pointer-events-none" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="Des questions ?"
            title="Contacte l&apos;Academy"
            highlight="SERMA HUB."
            subtitle="Une hésitation sur les filières ou sur l'organisation des cours ? Nous répondons sous 24h."
          />

          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
            <WhatsAppLink
              href={buildWhatsAppUrl(WHATSAPP_MESSAGES.academy)}
              source="academy"
              ariaLabel="Contacter l'Academy SERMA HUB sur WhatsApp"
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
                  Appeler l&apos;administration
                </p>
              </div>
            </a>

            <div className="bg-white rounded-3xl border border-marine-profond/10 p-7 flex items-start gap-4">
              <div className="w-12 h-12 bg-marine-profond/[0.07] text-marine-profond rounded-2xl flex items-center justify-center shrink-0">
                <MapPin className="w-[22px] h-[22px]" strokeWidth={1.7} />
              </div>
              <div>
                <p className="text-[10px] text-gris-texte uppercase font-bold tracking-[0.12em] mb-1.5">
                  Lieu des cours
                </p>
                <p className="text-marine-profond text-sm font-bold leading-snug">
                  Zongo 2, axe BENI CHIC – PRESIDO
                </p>
                <p className="text-gris-texte/70 text-xs mt-1.5">
                  100m après EPP La Source, étage à droite
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
