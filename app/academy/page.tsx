import { Header } from "@/components/ui/header-2";
import Footer4Col from "@/components/ui/footer-column";
import StatsCounter from "@/components/shared/StatsCounter";
import TestimonialCard from "@/components/shared/TestimonialCard";
import WhatsAppFAB from "@/components/shared/WhatsAppFAB";
import { ArrowRight, CheckCircle2, XCircle, Play, Sparkles, BookOpen, Coins, Phone, MapPin, MessageSquare, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SERMA HUB Impact Academy — Formation Professionnelle Pratique à Parakou",
  description:
    "Centre de formation professionnelle à Parakou. 5 filières métiers, formations comptables certifiantes. Tu repars avec une activité réelle.",
  openGraph: {
    title: "SERMA HUB Impact Academy — Forme-toi. Lance-toi. Parakou, Bénin.",
    description: "Formations pratiques en commerce, agro-business, digital, services techniques, entrepreneuriat féminin.",
    type: "website",
  },
};

export default function AcademyPage() {
  return (
    <>
      <Header />

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-28 pb-20 bg-marine-profond text-white">
        {/* Background Image Texture */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
          <img
            src="/images/hero_background.png"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-marine-profond via-transparent to-transparent" />
        </div>

        {/* Animated backdrop decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-orange-logo/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-vert-tech/10 blur-3xl" />
        </div>

        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-vert-tech/15 border border-vert-tech/35 mb-6">
            <span className="w-2 h-2 rounded-full bg-vert-tech animate-pulse" />
            <span className="text-vert-tech text-xs font-semibold uppercase tracking-wider">
              Inscriptions ouvertes — Places limitées à 10
            </span>
          </div>
          
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6">
            Tu travailles beaucoup. Mais l&apos;argent ne reste pas.<br />
            <span className="text-orange-logo">On t&apos;apprend pourquoi — et comment changer ça.</span>
          </h1>
          <p className="max-w-3xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed mb-10 font-medium">
            SERMA HUB ne forme pas pour accumuler des certificats théoriques. On forme pour créer des activités réelles qui génèrent vraiment des revenus durables. Tu repars avec un projet concret — pas une attestation de plus.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/academy/inscription"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-orange-logo hover:bg-orange-sature text-white font-bold text-base transition-all duration-200 hover:shadow-lg hover:shadow-orange-logo/20 active:scale-95 gap-2"
            >
              M&apos;inscrire à la prochaine cohorte
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#filieres"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/20 hover:border-orange-logo text-white font-bold text-base transition-all duration-200 active:scale-95"
            >
              Voir les filières & formations
            </a>
          </div>
        </div>
      </section>

      {/* ── NOTRE CONCEPT (DIFFERENCES) ── */}
      <section className="py-24 bg-white text-marine-profond relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-orange-contrast font-mono text-xs uppercase tracking-widest font-extrabold block mb-3">
              NOTRE CONCEPT
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
              La différence SERMA HUB Impact Academy.
            </h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto">
              La différence entre une formation théorique qui vous occupe et une formation pratique qui change votre vie.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-xl max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {/* Other academies */}
              <div className="p-8 sm:p-10 text-left bg-slate-100/50">
                <h3 className="font-playfair text-lg font-bold text-slate-500 flex items-center gap-2 mb-6">
                  <XCircle className="w-5 h-5 text-red-500" />
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
                    <li key={i} className="text-slate-500 text-sm leading-relaxed flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-red-50 text-red-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">✕</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* SERMA HUB */}
              <div className="p-8 sm:p-10 text-left bg-white relative">
                <div className="absolute top-4 right-4 bg-orange-logo/10 border border-orange-logo/20 rounded-full px-3 py-1 text-[10px] font-bold text-orange-contrast flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-orange-logo" />
                  Recommandé
                </div>
                <h3 className="font-playfair text-lg font-bold text-marine-profond flex items-center gap-2 mb-6">
                  <CheckCircle2 className="w-5 h-5 text-vert-tech" />
                  L&apos;ACADEMY SERMA HUB
                </h3>
                <ul className="space-y-4">
                  {[
                    "Pratique sur le terrain dès le premier jour d'apprentissage.",
                    "Activité réelle lancée et validée pendant la formation.",
                    "Accompagnement post-formation et coaching personnalisé.",
                    "Contenu 100% adapté au marché béninois et ouest-africain.",
                    "Possibilité d'accès aux microcrédits partenaires pour démarrer.",
                  ].map((text, i) => (
                    <li key={i} className="text-marine-profond font-semibold text-sm leading-relaxed flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-green-50 text-vert-tech text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CHIFFRES ACADEMY ── */}
      <section className="py-20 bg-marine-moyen text-white relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatsCounter value="200+" label="Apprenants formés" dark />
            <StatsCounter value="5" label="Filières métiers" dark />
            <StatsCounter value="100%" label="Formations pratiques" dark />
            <StatsCounter value="10" label="Participants maximum / cohorte" dark />
          </div>
        </div>
      </section>

      {/* ── LES 5 FILIÈRES ── */}
      <section id="filieres" className="py-24 bg-white text-marine-profond">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-orange-contrast font-mono text-xs uppercase tracking-widest font-extrabold block mb-3">
              NOS FILIÈRES
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
              Quelle activité veux-tu lancer ?
            </h2>
            <div className="h-1 w-16 bg-orange-logo mx-auto rounded-full" />
          </div>

          <div className="space-y-12">
            {[
              {
                num: "01",
                title: "Commerce & Distribution",
                hook: "Tu fais le commerce. Mais l'argent ne reste pas. On t'apprend à gérer, pas juste à vendre.",
                desc: "Le problème de la plupart des commerçants béninois n'est pas le manque de clients. C&apos;est la gestion. Les prix mal fixés. Le stock mal suivi. WhatsApp utilisé sans méthode.",
                learns: ["Fixer tes prix avec une marge bénéficiaire réelle", "Gérer ton stock sans pertes ni surstock", "Vendre efficacement : sur le terrain et via WhatsApp Business"],
                outcome: "Un commerce fonctionnel avec clients réguliers + accès facilité aux microcrédits.",
              },
              {
                num: "02",
                title: "Agro-Business & Transformation",
                hook: "Transforme ce que tu produis. Et multiplie ta valeur par 3.",
                desc: "Un kilogramme de manioc brut se vend à un prix très bas. Un kilogramme de gari bien transformé ou conditionné se vend bien plus cher. La différence, c&apos;est la transformation.",
                learns: ["Transformer les produits agricoles locaux (manioc, soja, fruits)", "Conditionner esthétiquement pour la vente de détail et gros", "Vendre avec une stratégie de prix adaptée au marché"],
                outcome: "Un produit fini prêt à la vente + accès facilité aux microcrédits.",
              },
              {
                num: "03",
                title: "Services Techniques",
                hook: "Tu sais travailler de tes mains. Apprenons-toi à en vivre vraiment.",
                desc: "Électricité. Plomberie. Solaire. Maintenance. Des compétences qui manquent partout au Bénin. Le problème n&apos;est pas le savoir-faire technique — c&apos;est de trouver des clients, faire des devis et facturer correctement.",
                learns: ["Trouver des clients et se constituer un réseau professionnel", "Établir des devis et des contrats clairs et pros", "Gérer ses revenus et structurer son activité d'artisan"],
                outcome: "Un service opérationnel avec tes premiers contrats + accès facilité aux microcrédits.",
              },
              {
                num: "04",
                title: "Digital Local",
                hook: "Ton téléphone va te faire gagner de l'argent. On t'apprend comment.",
                desc: "Facebook, WhatsApp, Instagram. Des outils que tout le monde utilise pour s&apos;amuser. Mais très peu savent en faire des sources de revenus réelles : vente, marketing local, services digitaux de proximité.",
                learns: ["Utiliser Facebook Ads et WhatsApp Business de manière professionnelle", "Créer des visuels et des textes qui attirent l'acheteur", "Lancer des prestations de services digitaux adaptés au commerce local"],
                outcome: "Tes premiers contrats clients digitaux signés + accès aux microcrédits.",
              },
              {
                num: "05",
                title: "Entrepreneuriat Féminin",
                hook: "Femme, tu as plus de ressources que tu ne le crois. On t'aide à les activer.",
                desc: "Cette filière est spécialement conçue pour les femmes, groupements et associations qui veulent créer ou développer une activité génératrice de revenus stable. Pas de jargon, que du concret adapté à ta réalité sociale.",
                learns: ["Identifier et valider une idée d'activité à fort potentiel local", "Gérer séparément ses finances personnelles et professionnelles", "Développer sa confiance, son leadership et son réseau de vente"],
                outcome: "Une activité viable maîtrisée + accès aux microcrédits + réseau de femmes entrepreneures.",
              },
            ].map((filiere) => (
              <div
                key={filiere.num}
                className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-10 text-left hover:border-orange-logo/30 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-4">
                    <span className="font-playfair text-3xl font-black text-orange-logo">
                      {filiere.num}. {filiere.title}
                    </span>
                    <p className="text-orange-contrast font-bold text-base italic leading-relaxed">
                      &ldquo;{filiere.hook}&rdquo;
                    </p>
                    <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
                      {filiere.desc}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-xs uppercase tracking-wider font-bold text-slate-800 mb-2">
                          Ce que tu vas apprendre :
                        </p>
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {filiere.learns.map((l, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-logo" />
                              <span>{l}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col justify-center">
                        <p className="text-[10px] uppercase font-bold text-vert-tech mb-1">
                          À la sortie de la formation :
                        </p>
                        <p className="text-slate-700 text-xs font-semibold leading-relaxed">
                          {filiere.outcome}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 self-end md:self-start">
                    <Link
                      href="/academy/inscription"
                      className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-marine-profond text-white hover:bg-orange-logo text-xs font-bold uppercase tracking-wider transition-colors gap-2"
                    >
                      Rejoindre cette filière
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORMATIONS COURTES COMPTABLES ── */}
      <section id="formations" className="py-24 bg-marine-profond text-white relative border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-orange-logo font-mono text-xs uppercase tracking-widest font-bold block mb-3">
              FORMATIONS COMPTABLES
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
              Formations Courtes Professionnelles
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              Ces formations s&apos;adressent aux comptables, caissiers, gestionnaires de projets, ou étudiants en gestion. Format court de 3 jours, en présentiel à Parakou et en ligne.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Formation 1 */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:border-orange-logo/30 transition-all flex flex-col justify-between">
              <div>
                <h3 className="font-playfair text-lg font-bold text-white mb-2">
                  PERFECTO & SYSCOHADA Révisé
                </h3>
                <p className="text-orange-logo text-xs font-semibold mb-4 italic">
                  Le logiciel standard utilisé par les cabinets et ONG au Bénin.
                </p>
                <div className="h-px bg-white/[0.05] my-4" />
                <p className="text-xs text-slate-400 mb-2">Compétences acquises :</p>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-orange-logo flex-shrink-0" />
                    <span>Tenir une comptabilité complète sur PERFECTO</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-orange-logo flex-shrink-0" />
                    <span>Appliquer les règles du SYSCOHADA révisé</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-orange-logo flex-shrink-0" />
                    <span>Produire et analyser les états financiers finaux</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/academy/inscription"
                className="w-full inline-flex items-center justify-center mt-8 py-3 rounded-lg border border-white/10 hover:border-orange-logo hover:text-orange-logo text-xs font-bold uppercase transition-colors"
              >
                S&apos;inscrire à ce module
              </Link>
            </div>

            {/* Formation 2 */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:border-orange-logo/30 transition-all flex flex-col justify-between">
              <div>
                <h3 className="font-playfair text-lg font-bold text-white mb-2">
                  Gestion Efficace de la Caisse
                </h3>
                <p className="text-orange-logo text-xs font-semibold mb-4 italic">
                  Caissier ou responsable de caisse — ne laissez plus passer d&apos;erreur.
                </p>
                <div className="h-px bg-white/[0.05] my-4" />
                <p className="text-xs text-slate-400 mb-2">Compétences acquises :</p>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-orange-logo flex-shrink-0" />
                    <span>Maîtriser les encaissements & décaissements</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-orange-logo flex-shrink-0" />
                    <span>Tenir le brouillard et journal quotidien</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-orange-logo flex-shrink-0" />
                    <span>Réaliser les arrêtés de caisse et gérer les écarts</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/academy/inscription"
                className="w-full inline-flex items-center justify-center mt-8 py-3 rounded-lg border border-white/10 hover:border-orange-logo hover:text-orange-logo text-xs font-bold uppercase transition-colors"
              >
                S&apos;inscrire à ce module
              </Link>
            </div>

            {/* Formation 3 */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:border-orange-logo/30 transition-all flex flex-col justify-between">
              <div>
                <h3 className="font-playfair text-lg font-bold text-white mb-2">
                  Gestion Financière de Projet (OHADA)
                </h3>
                <p className="text-orange-logo text-xs font-semibold mb-4 italic">
                  Gérez les fonds comme les bailleurs internationaux l&apos;exigent.
                </p>
                <div className="h-px bg-white/[0.05] my-4" />
                <p className="text-xs text-slate-400 mb-2">Compétences acquises :</p>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-orange-logo flex-shrink-0" />
                    <span>Tenir la comptabilité d&apos;un projet (PERFECTO)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-orange-logo flex-shrink-0" />
                    <span>Élaborer et suivre un budget projet</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-orange-logo flex-shrink-0" />
                    <span>Produire les rapports financiers bailleurs</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/academy/inscription"
                className="w-full inline-flex items-center justify-center mt-8 py-3 rounded-lg border border-white/10 hover:border-orange-logo hover:text-orange-logo text-xs font-bold uppercase transition-colors"
              >
                S&apos;inscrire à ce module
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── EST-CE FAIT POUR MOI ? ── */}
      <section id="profils" className="py-24 bg-white text-marine-profond">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-orange-contrast font-mono text-xs uppercase tracking-widest font-extrabold block mb-3">
              PUBLIC CIBLE
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Est-ce fait pour toi ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: "L&apos;étudiant",
                desc: "Tu sors de l&apos;université ou lycée sans expérience pratique du terrain. Nous te donnons une compétence réelle et une activité lancée pendant ta formation.",
              },
              {
                title: "Le chercheur d&apos;emploi",
                desc: "Le marché ne répond pas ou tu stagnes. Nous t&apos;apprenons à lancer ton propre service ou commerce autonome et rentable.",
              },
              {
                title: "La femme entrepreneure",
                desc: "Tu as déjà une petite activité mais tu n&apos;arrives pas à la faire décoller. Nous t&apos;apportons les clés de la gestion de stock et financière.",
              },
              {
                title: "Le professionnel",
                desc: "Tu es déjà en poste mais tu manques de maîtrise sur PERFECTO ou SYSCOHADA. Forme-toi en 3 jours intensifs pour monter en grade.",
              },
              {
                title: "Le porteur de projet",
                desc: "Tu as une idée mais tu ne sais pas comment la structurer ou démarrer. Nos coachs t&apos;accompagnent pour bâtir ton plan de démarrage.",
              },
            ].map((p, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left">
                <h4 className="font-playfair font-bold text-base text-marine-profond mb-2" dangerouslySetInnerHTML={{ __html: p.title }} />
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: p.desc }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ACADEMY ── */}
      <section id="temoignages" className="py-20 bg-slate-50 text-marine-profond border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-orange-contrast font-mono text-xs uppercase tracking-widest font-extrabold block mb-3">
              RÉSULTATS DE NOS ÉLÈVES
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-black tracking-tight">
              Ils ont démarré comme toi.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <TestimonialCard
              result="Vente de soja multipliée par 2"
              quote="Avant de venir chez SERMA HUB, j'avais une idée de transformation mais pas de méthode de prix. La formation m'a appris à gérer ma marge et stock. Mon activité est maintenant structurée et rentable."
              author="Amina"
              roleOrSub="Apprenante Filière Agro-Business (Parakou)"
            />
            <TestimonialCard
              result="Comptable junior embauché en ONG"
              quote="Grâce au module PERFECTO de 3 jours, j'ai pu démontrer en entretien ma maîtrise pratique du logiciel face à d'autres candidats. C'est ça qui a fait la différence."
              author="Serge"
              roleOrSub="Diplômé de la formation courte PERFECTO"
            />
          </div>
        </div>
      </section>

      {/* ── INCRIPTION CTA BANNER ── */}
      <section className="py-20 bg-orange-logo text-white relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Prêt à changer de niveau ?
          </h2>
          <p className="text-white/90 text-base sm:text-lg max-w-xl mx-auto">
            Sélection sur dossier, cohorte limitée à 10 participants. Réservez votre place dès aujourd&apos;hui en remplissant notre formulaire d&apos;inscription.
          </p>
          <div className="pt-4">
            <Link
              href="/academy/inscription"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-marine-profond text-white hover:bg-marine-moyen font-bold text-base transition-all duration-200 shadow-xl active:scale-95 gap-2"
            >
              Remplir le formulaire d&apos;inscription
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-white/80 text-xs">
            Frais d&apos;inscription : 2 000 FCFA (formation 100% offerte par le Hub).
          </p>
        </div>
      </section>

      {/* ── CONTACT ACADEMY ── */}
      <section id="contact" className="py-20 bg-marine-moyen text-white relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-orange-logo font-mono text-xs uppercase tracking-widest font-bold block mb-3">
            DES QUESTIONS ?
          </span>
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
            Contacte l&apos;Academy SERMA HUB.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto mb-12">
            Une hésitation sur les filières ou sur l&apos;organisation des cours ? Nous répondons sous 24h.
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
                <p className="text-slate-400 text-xs mt-1">Appeler l&apos;administration</p>
              </div>
            </a>

            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Lieu des cours</p>
                <p className="text-white text-xs font-bold leading-snug">Zongo 2, axe BENI CHIC – PRESIDO</p>
                <p className="text-slate-400 text-xs mt-1">100m après EPP La Source, étage à droite</p>
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
