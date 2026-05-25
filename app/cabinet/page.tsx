import { Header } from "@/components/ui/header-2";
import Footer4Col from "@/components/ui/footer-column";
import TestimonialCard from "@/components/shared/TestimonialCard";
import ContactCabinet from "@/components/cabinet/ContactCabinet";
import WhatsAppFAB from "@/components/shared/WhatsAppFAB";
import { ArrowRight, BookOpen, FileCheck, ShieldAlert, Sparkles, Check, Building2, Landmark, Rocket, UserCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cabinet SERMA SARL — Expertise Comptable & Conseil Fiscal Parakou | Bénin",
  description:
    "Cabinet d'expertise comptable à Parakou. Tenue comptable, certification états financiers OHADA, conseil fiscal et social. Entreprises, ONG, startups.",
  openGraph: {
    title: "Cabinet SERMA SARL — Experts Comptables à Parakou, Bénin",
    description: "Expertise comptable OHADA, certification des états financiers, conseil fiscal et social.",
    type: "website",
  },
};

export default function CabinetPage() {
  return (
    <>
      <Header />

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-28 pb-20 bg-marine-profond">
        {/* Background Image Texture */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-15">
          <img
            src="/images/hero_background.png"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-marine-profond via-transparent to-transparent" />
        </div>

        {/* Background Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-marine-moyen via-marine-profond to-marine-profond opacity-90 z-10" />
        <div className="absolute inset-0 pointer-events-none bg-grid-pattern opacity-5 z-10" />
        
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-orange-logo font-mono text-xs uppercase tracking-widest font-bold px-3 py-1.5 rounded-full bg-orange-logo/10 border border-orange-logo/25 mb-6">
            CABINET SERMA SARL — Expertise & Conseil
          </span>
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Votre comptabilité est en règle.<br />
            <span className="text-orange-logo">Votre business peut avancer.</span>
          </h1>
          <p className="max-w-3xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed mb-10 font-medium">
            Expertise comptable OHADA, certification des états financiers, conseil fiscal et social. Cabinet SERMA SARL prend en charge la conformité de votre structure — pour que vous puissiez diriger sans la peur du contrôle.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#contact"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-orange-logo hover:bg-orange-sature text-white font-bold text-base transition-all duration-200 active:scale-95 gap-2"
            >
              Prendre rendez-vous
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#services"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/20 hover:border-orange-logo text-white font-bold text-base transition-all duration-200 active:scale-95"
            >
              Découvrir nos services
            </a>
          </div>
        </div>
      </section>

      {/* ── SERVICES SECTION ── */}
      <section id="services" className="py-24 bg-white text-marine-profond relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-orange-contrast font-mono text-xs uppercase tracking-widest font-extrabold block mb-3">
              NOS SERVICES
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
              Ce que nous faisons pour votre structure.
            </h2>
            <div className="h-1 w-16 bg-orange-logo mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Service 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 hover:shadow-xl hover:border-orange-logo/25 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-marine-profond text-white rounded-xl flex items-center justify-center mb-6">
                  <BookOpen className="w-6 h-6 text-orange-logo" />
                </div>
                <h3 className="font-playfair text-xl sm:text-2xl font-bold text-marine-profond mb-3">
                  Tenue & Organisation Comptable
                </h3>
                <p className="text-orange-contrast italic text-sm font-semibold mb-4 leading-relaxed">
                  &ldquo;Vos livres de comptes sont à jour. Votre trésorerie est lisible. Vous pouvez prendre des décisions.&rdquo;
                </p>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Beaucoup d&apos;entreprises béninoises gèrent leur comptabilité à l&apos;intuition — jusqu&apos;au jour du contrôle ou du blocage bancaire. Nous intervenons en amont pour assainir vos finances.
                </p>
                <ul className="space-y-2 text-slate-600 text-sm mb-8">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-serma flex-shrink-0 mt-1" />
                    <span>Mise en place d&apos;un système comptable conforme OHADA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-serma flex-shrink-0 mt-1" />
                    <span>Tenue régulière de vos journaux comptables</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-serma flex-shrink-0 mt-1" />
                    <span>Suivi rigoureux de la trésorerie et rapports périodiques</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-serma flex-shrink-0 mt-1" />
                    <span>Archivage numérique et physique sécurisé de vos pièces</span>
                  </li>
                </ul>
              </div>
              <a
                href="#contact"
                className="inline-flex items-center text-sm font-bold text-marine-profond hover:text-orange-logo uppercase tracking-wider group"
              >
                Discuter de ma comptabilité →
              </a>
            </div>

            {/* Service 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 hover:shadow-xl hover:border-orange-logo/25 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-marine-profond text-white rounded-xl flex items-center justify-center mb-6">
                  <FileCheck className="w-6 h-6 text-orange-logo" />
                </div>
                <h3 className="font-playfair text-xl sm:text-2xl font-bold text-marine-profond mb-3">
                  Certification des États Financiers
                </h3>
                <p className="text-orange-contrast italic text-sm font-semibold mb-4 leading-relaxed">
                  &ldquo;Vos états financiers parlent à vos banquiers, bailleurs et investisseurs. Ils doivent être irréprochables.&rdquo;
                </p>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Un état financier non certifié ou mal structuré peut bloquer un crédit, faire échouer un appel d&apos;offres, ou attirer un redressement fiscal immédiat. On vous évite cela.
                </p>
                <ul className="space-y-2 text-slate-600 text-sm mb-8">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-serma flex-shrink-0 mt-1" />
                    <span>Établissement du bilan, compte de résultat et annexes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-serma flex-shrink-0 mt-1" />
                    <span>Vérification de conformité SYSCOHADA révisé</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-serma flex-shrink-0 mt-1" />
                    <span>Certification officielle de vos états financiers de fin d&apos;année</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-serma flex-shrink-0 mt-1" />
                    <span>Accompagnement lors d&apos;audits externes par vos partenaires</span>
                  </li>
                </ul>
              </div>
              <a
                href="#contact"
                className="inline-flex items-center text-sm font-bold text-marine-profond hover:text-orange-logo uppercase tracking-wider"
              >
                Certifier mes états financiers →
              </a>
            </div>

            {/* Service 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 hover:shadow-xl hover:border-orange-logo/25 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-marine-profond text-white rounded-xl flex items-center justify-center mb-6">
                  <Sparkles className="w-6 h-6 text-orange-logo" />
                </div>
                <h3 className="font-playfair text-xl sm:text-2xl font-bold text-marine-profond mb-3">
                  Conseil Fiscal & Social
                </h3>
                <p className="text-orange-contrast italic text-sm font-semibold mb-4 leading-relaxed">
                  &ldquo;Les impôts et la CNSS ne sont pas vos ennemis. Ce sont des règles. On vous apprend à les naviguer.&rdquo;
                </p>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Payer trop, payer mal, payer en retard. Trois erreurs que l&apos;on observe régulièrement chez les dirigeants d&apos;entreprises qui ne disposent pas d&apos;un conseiller fiscal dédié.
                </p>
                <ul className="space-y-2 text-slate-600 text-sm mb-8">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-serma flex-shrink-0 mt-1" />
                    <span>Déclarations fiscales dans les délais légaux (DFU, TVA, IS, IRF)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-serma flex-shrink-0 mt-1" />
                    <span>Optimisation légale de la charge fiscale de votre structure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-serma flex-shrink-0 mt-1" />
                    <span>Gestion des obligations sociales (CNSS, déclarations d&apos;embauche)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-serma flex-shrink-0 mt-1" />
                    <span>Conseil lors du choix de restructuration juridique ou fiscale</span>
                  </li>
                </ul>
              </div>
              <a
                href="#contact"
                className="inline-flex items-center text-sm font-bold text-marine-profond hover:text-orange-logo uppercase tracking-wider"
              >
                Optimiser ma fiscalité →
              </a>
            </div>

            {/* Service 4 */}
            <div className="bg-orange/5 border border-orange-logo/25 rounded-3xl p-8 hover:shadow-xl hover:border-orange-logo/50 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-orange-logo text-marine-profond rounded-xl flex items-center justify-center mb-6">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="font-playfair text-xl sm:text-2xl font-bold text-marine-profond mb-3">
                  Assistance & Déblocage Urgents
                </h3>
                <p className="text-orange-contrast italic text-sm font-semibold mb-4 leading-relaxed">
                  &ldquo;Un blocage CNSS. Un contrôle fiscal imprévu. Un différend avec les impôts. Nous intervenons rapidement.&rdquo;
                </p>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Certaines situations ne peuvent pas attendre. Si votre compte est bloqué, si un agent fiscal est dans vos locaux, ou si vous avez reçu une mise en demeure : vous avez besoin d&apos;un expert réactif.
                </p>
                <ul className="space-y-2 text-slate-600 text-sm mb-8">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-logo flex-shrink-0 mt-1" />
                    <span>Diagnostic et audit de crise immédiats de la situation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-logo flex-shrink-0 mt-1" />
                    <span>Interface professionnelle avec l&apos;administration fiscale et la CNSS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-logo flex-shrink-0 mt-1" />
                    <span>Régularisation comptable accélérée pour lever les blocages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-logo flex-shrink-0 mt-1" />
                    <span>Plan d&apos;action préventif pour éviter toute récidive fiscale</span>
                  </li>
                </ul>
              </div>
              <a
                href="#contact"
                className="inline-flex items-center text-sm font-bold text-orange-contrast hover:text-orange-logo uppercase tracking-wider"
              >
                Traiter une urgence →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── NOTRE MÉTHODE SECTION ── */}
      <section id="approche" className="py-20 bg-marine-profond text-white relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 text-left">
              <span className="text-orange-logo font-mono text-xs uppercase tracking-widest font-bold block mb-3">
                NOTRE MÉTHODE
              </span>
              <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Nous ne tenons pas seulement vos livres. Nous vous guidons.
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed mt-6">
                La comptabilité n&apos;est pas une fin en soi. C&apos;est un tableau de bord. Chez Cabinet SERMA SARL, chaque mission commence par la compréhension approfondie de votre activité, de vos contraintes et de vos objectifs.
              </p>
            </div>

            <div className="lg:col-span-7 space-y-6 text-left">
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
              ].map((principle) => (
                <div key={principle.num} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex gap-4">
                  <span className="font-playfair text-2xl font-black text-orange-logo">{principle.num}</span>
                  <div>
                    <h3 className="font-bold text-white mb-1.5">{principle.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{principle.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TYPE DE CLIENTS SECTION ── */}
      <section id="clients" className="py-24 bg-white text-marine-profond">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-orange-contrast font-mono text-xs uppercase tracking-widest font-extrabold block mb-3">
              NOS CLIENTS
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Du commerçant local à la multinationale.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                icon: <Building2 className="w-6 h-6 text-orange-logo" />,
                title: "PME & Commerçants",
                desc: "Besoin d'externaliser pour structurer la croissance sans recruter à plein temps.",
              },
              {
                icon: <Landmark className="w-6 h-6 text-orange-logo" />,
                title: "ONG & Associations",
                desc: "Obligations de rapports précis pour les bailleurs de fonds sous normes OHADA.",
              },
              {
                icon: <Rocket className="w-6 h-6 text-orange-logo" />,
                title: "Startups",
                desc: "Structuration juridique, prévisionnels financiers et comptabilité de démarrage.",
              },
              {
                icon: <UserCheck className="w-6 h-6 text-orange-logo" />,
                title: "Professions libérales",
                desc: "Médecins, avocats, consultants. Optimisation des déclarations personnelles.",
              },
              {
                icon: <AlertTriangle className="w-6 h-6 text-orange-logo" />,
                title: "Structures en crise",
                desc: "Arriérés, redressements ou litiges. Audit et régularisation d'urgence.",
              },
            ].map((client, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left hover:border-orange-logo/30 transition-colors flex flex-col justify-between">
                <div>
                  <div className="mb-4">{client.icon}</div>
                  <h4 className="font-bold text-sm text-marine-profond mb-2">{client.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{client.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES CABINET ── */}
      <section id="temoignages" className="py-20 bg-slate-50 text-marine-profond border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-orange-contrast font-mono text-xs uppercase tracking-widest font-extrabold block mb-3">
              RÉSULTATS CLIENTS
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-black tracking-tight">
              Ce que nos clients disent de nous.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <TestimonialCard
              result="Zéro pénalité fiscale"
              quote="Avant Cabinet SERMA, nous avions beaucoup d'arriérés comptables accumulés et de la confusion. Ils ont tout régularisé avec l'administration en un temps record. Un poids en moins."
              author="Directeur Administratif"
              roleOrSub="ONG de Santé Publique (Bénin)"
            />
            <TestimonialCard
              result="États certifiés, Financement validé"
              quote="Grâce à la certification rapide et rigoureuse de nos bilans par le Cabinet, nous avons pu décrocher notre prêt bancaire pour notre projet d'usine de transformation."
              author="Fondateur & CEO"
              roleOrSub="Startup Agro-alimentaire (Parakou)"
            />
          </div>
        </div>
      </section>

      {/* ── CONTACT FORM SECTION ── */}
      <section id="contact" className="py-24 bg-white text-marine-profond border-t border-slate-100 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 text-left">
              <span className="text-orange-contrast font-mono text-xs uppercase tracking-widest font-extrabold block mb-3">
                PRENDRE CONTACT
              </span>
              <h2 className="font-playfair text-3xl sm:text-4xl font-extrabold tracking-tight text-marine-profond mb-6 leading-tight">
                Parlons de votre comptabilité et de votre fiscalité.
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                Remplissez ce formulaire de demande d&apos;analyse. L&apos;un de nos comptables qualifiés étudiera votre dossier et prendra contact avec vous sous 24h ouvrées.
              </p>
              <div className="space-y-3 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                <p>📍 Bureau : Zongo 2, Parakou</p>
                <p>📞 Téléphone : +229 01 40 37 71 99</p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <ContactCabinet />
            </div>
          </div>
        </div>
      </section>

      <WhatsAppFAB />
      <Footer4Col />
    </>
  );
}
