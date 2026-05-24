import { Header } from "@/components/ui/header-2";
import Footer4Col from "@/components/ui/footer-column";
import { LandingAccordionItem } from "@/components/ui/interactive-image-accordion";
import StatsCounter from "@/components/shared/StatsCounter";
import TestimonialCard from "@/components/shared/TestimonialCard";
import WhatsAppFAB from "@/components/shared/WhatsAppFAB";
import Link from "next/link";
import { ArrowRight, Scale, GraduationCap, ShieldCheck, MapPin, Phone, MessageSquare } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Header />
      
      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden bg-marine-profond">
        {/* Ambient background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-orange-logo/10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-vert-tech/5 blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-orange-logo font-mono text-xs uppercase tracking-widest font-bold px-3 py-1.5 rounded-full bg-orange-logo/10 border border-orange-logo/25 mb-6">
            GROUPE SERMA — Parakou, Bénin
          </span>
          <h1 className="font-playfair text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-none mb-8">
            Former. Structurer.<br className="hidden sm:inline" />
            <span className="text-orange-logo"> Performer.</span>
            <span className="sr-only"> Le Groupe SERMA à Parakou.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg md:text-xl leading-relaxed mb-12 font-medium">
            Une alliance unique : l'expertise comptable du <strong className="text-white">Cabinet SERMA SARL</strong> et la puissance pédagogique de <strong className="text-white">SERMA HUB Impact Academy</strong>. Pour les entreprises qui veulent grandir. Pour les individus qui veulent changer leur vie.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-md sm:max-w-none mx-auto">
            <Link
              href="/cabinet"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-orange-logo hover:bg-orange-sature text-white font-bold text-base transition-all duration-200 hover:shadow-lg hover:shadow-orange-logo/20 active:scale-95 gap-2"
            >
              Je cherche un expert-comptable
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/academy"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/20 hover:border-orange-logo hover:text-orange-logo text-white font-bold text-base transition-all duration-200 active:scale-95"
            >
              Je veux me former
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRESENTATION SECTION ── */}
      <section id="presentation" className="py-20 bg-white text-marine-profond relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-center">
            <div className="md:col-span-5 text-left">
              <span className="text-orange-contrast font-mono text-xs uppercase tracking-widest font-extrabold block mb-3">
                QUI SOMMES-NOUS
              </span>
              <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-marine-profond leading-tight">
                Deux expertises. Un seul engagement : des résultats.
              </h2>
              <div className="mt-6 h-1 w-16 bg-orange-logo rounded-full" />
            </div>
            
            <div className="md:col-span-7 text-left">
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-6 font-medium">
                Le Groupe SERMA est né d&apos;un constat simple : les entreprises béninoises ont besoin de deux choses pour prospérer. Des comptes en ordre. Et des équipes compétentes.
              </p>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                Le <strong className="text-marine-profond">Cabinet SERMA SARL</strong> s&apos;occupe de la première. <strong className="text-marine-profond">SERMA HUB Impact Academy</strong> s&apos;occupe de la seconde. Ensemble, ils forment le partenaire le plus complet du développement économique à Parakou.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CHIFFRES CLÉS SECTION ── */}
      <section className="py-20 bg-marine-moyen text-white relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatsCounter value="50+" label="Entreprises & ONG accompagnées" dark />
            <StatsCounter value="200+" label="Apprenants formés" dark />
            <StatsCounter value="5" label="Filières métiers" dark />
            <StatsCounter value="100%" label="Pratique & concret" suffix="" dark />
          </div>
        </div>
      </section>

      {/* ── CARDS DES DEUX ESPACES ── */}
      <section className="py-24 bg-white text-marine-profond">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-orange-contrast font-mono text-xs uppercase tracking-widest font-extrabold block mb-3">
            NOTRE ÉCOSYSTÈME
          </span>
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-black mb-16 tracking-tight">
            Choisissez votre espace.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Card Cabinet */}
            <div className="flex flex-col justify-between text-left p-8 sm:p-10 rounded-3xl border border-slate-200 hover:border-orange-logo/40 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
              <div>
                <div className="w-14 h-14 bg-marine-profond text-white rounded-2xl flex items-center justify-center mb-6">
                  <Scale className="w-7 h-7 text-orange-logo" />
                </div>
                <h3 className="font-playfair text-2xl sm:text-3xl font-bold text-marine-profond mb-2">
                  Cabinet SERMA SARL
                </h3>
                <p className="text-orange-contrast font-mono text-xs uppercase tracking-wider font-semibold mb-6">
                  Expertise Comptable & Conseil Fiscal
                </p>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
                  Votre comptabilité OHADA, vos états financiers certifiés, votre conformité fiscale et sociale. On s&apos;occupe de tout — pour que vous puissiez vous concentrer sur ce qui compte vraiment : développer votre activité.
                </p>
              </div>
              <Link
                href="/cabinet"
                className="inline-flex items-center gap-2 text-marine-profond hover:text-orange-logo text-sm font-bold uppercase tracking-wider transition-colors group"
              >
                Découvrir le Cabinet
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Card Academy */}
            <div className="flex flex-col justify-between text-left p-8 sm:p-10 rounded-3xl border border-slate-200 hover:border-orange-logo/40 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
              <div>
                <div className="w-14 h-14 bg-orange-logo text-white rounded-2xl flex items-center justify-center mb-6">
                  <GraduationCap className="w-7 h-7 text-marine-profond" />
                </div>
                <h3 className="font-playfair text-2xl sm:text-3xl font-bold text-marine-profond mb-2">
                  SERMA HUB Impact Academy
                </h3>
                <p className="text-orange-contrast font-mono text-xs uppercase tracking-wider font-semibold mb-6">
                  Formation Professionnelle & Entrepreneuriat
                </p>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
                  Tu travailles dur. Mais les résultats ne suivent pas. L&apos;Academy te donne les compétences concrètes pour changer ça — en commerce, agro-business, digital, services techniques ou entrepreneuriat féminin.
                </p>
              </div>
              <Link
                href="/academy"
                className="inline-flex items-center gap-2 text-marine-profond hover:text-orange-logo text-sm font-bold uppercase tracking-wider transition-colors group"
              >
                Découvrir l&apos;Academy
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LandingAccordionItem />

      {/* ── POURQUOI SERMA ── */}
      <section id="pourquoi" className="py-20 bg-marine-profond text-white relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-orange-logo font-mono text-xs uppercase tracking-widest font-bold block mb-3">
              NOTRE DIFFÉRENCE
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Pourquoi choisir le Groupe SERMA ?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
            {[
              {
                num: "01",
                title: "Approche 360°",
                desc: "Formation, application et certification au sein d&apos;un seul écosystème. Vous n&apos;avez pas besoin d&apos;aller ailleurs.",
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
            ].map((item) => (
              <div key={item.num} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-4">
                <span className="font-playfair text-3xl font-black text-orange-logo/40 leading-none">
                  {item.num}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section className="py-24 bg-white text-marine-profond">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-orange-contrast font-mono text-xs uppercase tracking-widest font-extrabold block mb-3">
              RÉUSSITES
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Ils ont fait confiance à SERMA.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TestimonialCard
              result="Arriérés fiscaux de 3 ans régularisés sans pénalité"
              quote="Avant de travailler avec le Cabinet SERMA, nous avions peur de chaque contrôle fiscal. Aujourd'hui, nos déclarations sont irréprochables et nous pilotons sereinement."
              author="Dossou KPONOU"
              roleOrSub="Directeur Général · AgroBenin (Parakou)"
            />
            <TestimonialCard
              result="Yaourts rentables lancés en 2 mois à Parakou"
              quote="J'ai suivi la filière agro-business. J'ai appris à transformer le soja local en lait et yaourts. Aujourd'hui, je vends dans trois quartiers de Parakou et génère mes propres revenus."
              author="Mariam"
              roleOrSub="Apprenante Filière Agro-Business (Parakou)"
            />
          </div>
        </div>
      </section>

      {/* ── CONTACT RAPIDE ── */}
      <section id="contact" className="py-20 bg-marine-moyen text-white relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-orange-logo font-mono text-xs uppercase tracking-widest font-bold block mb-3">
            CONTACT
          </span>
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
            Une question ? On répond aujourd&apos;hui.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mb-12">
            Que vous cherchiez un expert-comptable ou une formation adaptée à votre profil — écrivez-nous.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
            <a
              href="https://wa.me/2290140377199"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/[0.02] border border-white/[0.06] hover:border-green-500/40 rounded-2xl p-6 flex items-start gap-4 transition-all"
            >
              <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">WhatsApp</p>
                <p className="text-white text-sm font-bold">+229 01 40 37 71 99</p>
                <p className="text-slate-400 text-xs mt-1">Discuter directement</p>
              </div>
            </a>

            <a
              href="tel:+2290196237343"
              className="bg-white/[0.02] border border-white/[0.06] hover:border-orange-logo/40 rounded-2xl p-6 flex items-start gap-4 transition-all"
            >
              <div className="w-10 h-10 bg-orange-logo/10 text-orange-logo rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Téléphone</p>
                <p className="text-white text-sm font-bold">+229 01 96 23 73 43</p>
                <p className="text-slate-400 text-xs mt-1">Appeler notre bureau</p>
              </div>
            </a>

            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Adresse</p>
                <p className="text-white text-xs font-bold leading-snug">Zongo 2, axe BENI CHIC – PRESIDO</p>
                <p className="text-slate-400 text-xs mt-1">Parakou, Bénin</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WhatsAppFAB />
      <Footer4Col />
    </>
  );
}
