import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/shared/WhatsAppFAB";
import CTAButton from "@/components/shared/CTAButton";
import Reveal from "@/components/shared/Reveal";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Calendar, ArrowLeft, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { getPublicArticle, type PublicBlogPost } from "@/lib/back-office/public-content";

interface ArticleSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

interface Article {
  title: string;
  desc: string;
  category: string;
  date: string;
  readTime: string;
  intro: string;
  sections: ArticleSection[];
  conclusion: string;
  cta: { text: string; href: string };
}

const ARTICLES: Record<string, Article> = {
  "1": {
    title: "Comprendre le SYSCOHADA Révisé : ce qui change pour les PME en 2026",
    desc: "Le système comptable ouest-africain évolue. Découvrez les nouvelles obligations comptables et de présentation des comptes pour rester en règle.",
    category: "Cabinet & Fiscalité",
    date: "14 Mai 2026",
    readTime: "6 min",
    intro:
      "Le SYSCOHADA révisé s'applique depuis le 1er janvier 2018 aux états financiers des exercices ouverts à compter de cette date, mais son appropriation par les PME béninoises reste inégale. Entre les nouvelles présentations d'états financiers, le tableau des flux de trésorerie obligatoire et la réorganisation du plan de comptes, beaucoup de dirigeants découvrent encore les implications concrètes lors de leurs obligations annuelles. Cet article fait le point sur ce qui change réellement pour votre entreprise, et comment vous sécuriser.",
    sections: [
      {
        heading: "Un nouveau référentiel pensé pour l'harmonisation",
        paragraphs: [
          "Le SYSCOHADA révisé remplace l'acte uniforme relatif au droit comptable et à l'information financière (AUDCIF). Son objectif : harmoniser les pratiques comptables des 17 pays de l'OHADA et rapprocher les états financiers des normes internationales (IFRS). Pour une PME de Parakou, cela signifie des états financiers plus lisibles pour les banques, les bailleurs et les partenaires étrangers — un avantage réel lorsqu'il s'agit de décrocher un financement.",
          "Concrètement, le modèle d'états financiers du SYSCOHADA révisé (système normal) compte cinq documents liés entre eux : le bilan, le compte de résultat, le tableau des flux de trésorerie, les notes annexes et le tableau de variation des capitaux propres. C'est ce cinquième document, souvent négligé, qui attire l'attention des vérificateurs.",
        ],
      },
      {
        heading: "Les changements qui concernent directement votre PME",
        paragraphs: [
          "Trois évolutions majeures touchent le quotidien des petites et moyennes structures. Elles demandent une anticipation, car elles modifient vos outils et vos habitudes de clôture.",
        ],
        bullets: [
          "Le tableau des flux de trésorerie devient obligatoire : il explique les variations de trésorerie selon trois flux (exploitation, investissement, financement) et remplace l'ancienne analyse statique du fonds de roulement.",
          "La suppression du résultat hors activités ordinaires (HAO) partiellement réintégrée dans le résultat opérationnel : les éléments non courants restent séparés, mais la présentation change.",
          "Un plan de comptes restructuré en classes et sous-comptes avec de nouvelles règles de comptabilisation des immobilisations, des provisions et des subventions.",
        ],
      },
      {
        heading: "Comment vous mettre en conformité sans y perdre votre saison",
        paragraphs: [
          "La mise en conformité n'est pas qu'une question de logiciel. Elle passe d'abord par une cartographie de vos écarts actuels : charte comptable, traitement des immobilisations, suivi de trésorerie. Un diagnostic rapide permet d'identifier les chantiers prioritaires avant la prochaine clôture.",
          "Les outils comme PERFECTO, utilisés par la plupart des cabinets et ONG au Bénin, intègrent déjà les gabarits du SYSCOHADA révisé. Encore faut-il savoir les paramétrer correctement et éviter les erreurs de saisie qui polluent les états de synthèse. C'est précisément l'objet de notre formation de trois jours sur PERFECTO et le SYSCOHADA révisé.",
        ],
      },
    ],
    conclusion:
      "Le SYSCOHADA révisé n'est pas une contrainte de plus : c'est un langage commun qui rend votre entreprise lisible et finançable. Les PME qui l'ont adopté sérieusement constatent des dossiers bancaires montés plus vite et des contrôles fiscaux mieux préparés. Commencez par un diagnostic, formez votre personnel clé, et sécurisez chaque clôture.",
    cta: {
      text: "Parler à un expert-comptable",
      href: "/cabinet#contact",
    },
  },
  "2": {
    title: "Comment utiliser WhatsApp Business pour doubler ses ventes locales",
    desc: "WhatsApp n'est pas qu'un outil de chat. Apprenez à configurer vos catalogues de produits, automatiser vos réponses et attirer des clients à Parakou.",
    category: "Entrepreneuriat",
    date: "08 Mai 2026",
    readTime: "4 min",
    intro:
      "Au Bénin, WhatsApp est devenu le canal commercial par défaut : c'est là que vos clients demandent les prix, négocient, passent commande et partagent votre réputation. Pourtant, la majorité des commerçants et prestataires l'utilisent comme une simple messagerie personnelle — sans catalogue, sans automatisation, sans suivi. La différence entre les deux approches se mesure en chiffre d'affaires. Voici comment transformer votre WhatsApp en véritable canal de vente.",
    sections: [
      {
        heading: "WhatsApp Business : l'application que la plupart ignorent",
        paragraphs: [
          "WhatsApp Business est une application distincte, gratuite, conçue pour les commerçants. Elle ajoute quatre fonctions décisives : un profil professionnel visible (horaires, adresse, site web), des réponses rapides paramétrables, des messages d'absence automatiques, et surtout un catalogue de produits intégré.",
          "Le catalogue est votre vitrine permanente. Chaque produit y apparaît avec sa photo, son prix et sa description. Vos clients n'ont plus besoin de demander « c'est combien ? » — ils voient, ils choisissent, ils commandent. Pour un commerçant de Parakou, cela réduit drastiquement le temps passé à répondre aux mêmes questions, tout en donnant une image professionnelle qui justifie vos prix.",
        ],
      },
      {
        heading: "Trois automatismes qui changent tout",
        paragraphs: [
          "L'objectif n'est pas d'être devant son téléphone toute la journée, mais de construire des réponses une fois pour toutes. Voici les trois automatismes que nous enseignons en formation à l'Academy.",
        ],
        bullets: [
          "Le message d'accueil : la première réponse que reçoit un nouveau client, même à 2h du matin. Il rassure, informe sur les délais et oriente vers le catalogue.",
          "Les réponses rapides : tapez « /prix » et envoyez instantanément votre grille tarifaire complète. Gain de temps énorme sur les demandes récurrentes.",
          "Les étiquettes clients : classez vos contacts (nouveau client, commande en cours, livraison à faire) pour ne plus jamais oublier une commande en attente.",
        ],
      },
      {
        heading: "Vendre sans harceler : la discipline du statut",
        paragraphs: [
          "Le statut WhatsApp est votre canal de promotion gratuit, mais il exige une discipline : publier régulièrement (2 à 3 statuts par jour maximum), varier les formats (produit, témoignage client, coulisses), et toujours indiquer clairement comment commander. Un statut flou ne vend rien ; un statut avec prix, photo nette et appel à l'action précis déclenche des commandes directes.",
          "Enfin, mesurez : combien de conversations ce mois ? Combien transformées en ventes ? Cette simple habillage comptable de votre activité WhatsApp — même sur un cahier — vous dira si vos efforts paient. C'est exactement le genre de réflexe de gestion que la filière Commerce & Distribution de SERMA HUB transmet à ses apprenants.",
        ],
      },
    ],
    conclusion:
      "WhatsApp Business ne demande aucun investissement financier — seulement une après-midi de configuration et quelques habitudes nouvelles. Les commerçants qui l'ont adopté systématiquement constatent plus de commandes, moins de questions répétitives et des clients qui reviennent. Votre téléphone est déjà dans votre poche : il ne reste qu'à le transformer en vendeur.",
    cta: {
      text: "Rejoindre la filière Commerce",
      href: "/academy#filieres",
    },
  },
  "3": {
    title: "5 compétences à maîtriser pour devenir caissier professionnel",
    desc: "Vous postulez en banque ou microfinance ? Voici les compétences pratiques (journaux de caisse, arrêtés, prévention de fraude) qui feront la différence.",
    category: "Formations & Carrière",
    date: "29 Avril 2026",
    readTime: "5 min",
    intro:
      "Le poste de caissier est l'un des plus demandés dans le secteur bancaire, la microfinance et le commerce au Bénin. Il est aussi l'un des plus exigeants : manipuler des espèces toute la journée, sans erreur et sans faille de sécurité, suppose des compétences précises que les diplômes scolaires ne couvrent pas toujours. Voici les cinq compétences que les recruteurs vérifient réellement — et comment les acquérir.",
    sections: [
      {
        heading: "1. La maîtrise parfaite des procédures d'encaissement et de décaissement",
        paragraphs: [
          "Encaisser, c'est recevoir des fonds contre pièce justificative ; décaisser, c'est sortir des fonds sur autorisation. Derrière cette simplicité apparente se cache un protocole strict : vérification du payeur, comptage public des billets, établissement du reçu, mise à jour immédiate de la caisse. Un caissier qui improvise ces procédures crée des écarts — et les écarts de caisse sont le premier motif de rupture de confiance avec un employeur.",
        ],
      },
      {
        heading: "2. Le brouillard et le journal de caisse quotidiens",
        paragraphs: [
          "Le brouillard de caisse enregistre chaque mouvement au fil de la journée, ligne par ligne. Le journal de caisse en est la synthèse régulière, chiffrée et vérifiable. Tenir ces deux documents sans faille, c'est pouvoir justifier à tout instant le solde théorique de sa caisse — la seule défense valable d'un caissier lors d'un contrôle interne ou d'un arrêté inopiné.",
        ],
      },
      {
        heading: "3. L'arrêté de caisse et la détection des écarts",
        paragraphs: [
          "L'arrêté de caisse confronte le solde physique (ce qu'on compte) au solde théorique (ce que disent les écritures). Savoir réaliser un arrêté propre, identifier un écart, le tracer et l'expliquer (erreur de rendu de monnaie, billet collé, omission de pièce) est la compétence technique qui distingue un caissier confirmé d'un débutant. Les écarts non expliqués s'accumulent et deviennent des soupçons.",
        ],
      },
      {
        heading: "4. La prévention de la fraude et du détournement",
        paragraphs: [
          "La caisse est le point de vulnérabilité numéro un de toute structure : faux billets, reçus falsifiés, complicités externes, pressions internes. Un caissier professionnel connaît les schémas classiques de fraude et les parades : séparation des tâches, comptage croisé, traçabilité des pièces, procédure d'escalade en cas de pression. Cette compétence protège l'employeur — et protège surtout le caissier lui-même des accusations infondées.",
        ],
      },
      {
        heading: "5. La rigueur relationnelle sous pression",
        paragraphs: [
          "File d'attente longue, client mécontent, erreur de rendu de monnaie réclamée à voix haute : la caisse est un poste de tension. Le professionnel garde une procédure pour chaque situation conflictuelle — recomptage public, appel du superviseur, enregistrement de l'incident. La calme application des règles vaut mieux que toutes les excuses improvisées.",
        ],
      },
    ],
    conclusion:
      "Ces cinq compétences s'acquièrent en trois jours de formation intensive — c'est exactement le programme du module « Gestion Efficace de la Caisse » de SERMA HUB, en présentiel à Parakou et en ligne. À la sortie, vous manipulez brouillard, journal et arrêté avec assurance, et vous pouvez le démontrer en entretien : c'est souvent ça qui fait la différence entre deux candidats.",
    cta: {
      text: "S'inscrire au module Caisse",
      href: "/academy/inscription",
    },
  },
  "4": {
    title: "Le guide pratique de la Déclaration Fiscale Unique (DFU) au Bénin",
    desc: "Évitez les redressements et pénalités de retard. Retrouvez le calendrier, les pièces justificatives requises et nos conseils d'optimisation légale.",
    category: "Cabinet & Fiscalité",
    date: "12 Avril 2026",
    readTime: "8 min",
    intro:
      "La Déclaration Fiscale Unique (DFU) est le rendez-vous annuel incontournable de toutes les entreprises soumises à l'impôt au Bénin. Chaque année, des structures se voient infliger des pénalités de retard, des majorations ou des mises en demeure — non pas parce qu'elles voulaient frauder, mais parce qu'elles ont mal anticipé le calendrier, mal rempli le formulaire ou mal organisé leurs pièces justificatives. Ce guide synthétise ce que nos experts vérifient en premier chez chaque client.",
    sections: [
      {
        heading: "Ce qu'est réellement la DFU",
        paragraphs: [
          "La DFU regroupe en un seul document la déclaration annuelle des résultats de votre exercice et l'ensemble de vos obligations déclaratives associées : impôt sur les bénéfices (IS, IRF selon votre forme juridique), taxe sur la valeur ajoutée le cas échéant, et les renseignements statistiques exigés par l'administration. Elle est déposée auprès du Centre des Impôts dont dépend votre entreprise, dans les trois mois suivant la clôture de l'exercice — le 31 mars pour les entreprises alignées sur l'année civile.",
          "Son importance dépasse la simple formalité : les chiffres déclarés servent de base au calcul de vos impôts, mais aussi de référence pour les contrôles futurs, les attestations fiscales demandées par les banques et les marchés publics. Une DFU bâclée vous suit longtemps.",
        ],
      },
      {
        heading: "Les pièces justificatives à préparer avant de commencer",
        paragraphs: [
          "La erreur la plus fréquente est de commencer la déclaration sans avoir réuni le dossier complet. Résultat : déclarations incohérentes, chiffres révisés à la hâte, pièces manquantes découvertes après le dépôt. Voici le socle documentaire à réunir.",
        ],
        bullets: [
          "Les états financiers de l'exercice (bilan, compte de résultat, notes annexes) établis selon le SYSCOHADA révisé et signés.",
          "La balance générale des comptes et le grand livre, édités depuis votre logiciel comptable.",
          "Les justificatifs des paiements d'impôts déjà effectués (acomptes, retenues à la source, patente le cas échéant).",
          "Les relevés bancaires de clôture et le détail des immobilisations acquises ou cédées durant l'exercice.",
        ],
      },
      {
        heading: "Le calendrier et les pièges du calcul",
        paragraphs: [
          "Déposer dans les délais ne suffit pas : il faut payer dans les mêmes délais. Au Bénin, l'impôt sur les bénéfices est exigible au plus tard le 30 avril pour les entreprises à l'année civile, avec possibilité d'acquittlement en deux fractions. Les pénalités de retard courent rapidement, et l'administration peut assortir le tout d'intérêts de retard et de majorations. Le calendrier exact de vos échéances dépend de votre régime fiscal et de la date de clôture : ne le devinez pas, vérifiez-le auprès de votre centre des impôts ou de votre comptable.",
          "Autre point de vigilance : la cohérence entre votre chiffre d'affaires déclaré et les informations croisées de l'administration (délivrance de factières normalisées, déclarations de vos clients, relevs de domiciliation bancaire). Les écarts significatifs déclenchent quasi systématiquement un contrôle. La règle d'or : chaque chiffre déclaré doit pouvoir être justifié par une pièce.",
        ],
      },
      {
        heading: "Optimiser légalement : ce qu'un conseiller fiscal vous fait gagner",
        paragraphs: [
          "Optimiser n'est pas frauder. La loi fiscale béninoise comporte des dispositifs que les entreprises éligibles ignorent souvent : amortissements accélérés pour certains investissements, régimes particuliers selon les zones ou les secteurs, déductibilité conditionnelle de certaines charges si elles sont correctement documentées. Encore faut-il les connaître et les appliquer avant la clôture, pas après le dépôt.",
          "C'est tout l'intérêt d'un accompagnement continu : chez Cabinet SERMA SARL, chaque mission commence par la compréhension de votre activité, puis se traduit par un calendrier fiscal tenu à jour, des provisions calculées au bon moment et une DFU déposée sans stress, sans pénalité, et à son juste niveau d'imposition.",
        ],
      },
    ],
    conclusion:
      "La DFU bien préparée n'est pas une corvée annuelle : c'est la démonstration que votre entreprise est pilotée. Réunissez vos pièces en amont, respectez le calendrier, faites vérifier vos calculs — et si votre structure ne dispose pas encore d'un comptable dédié, c'est le moment de prendre rendez-vous avant la prochaine clôture.",
    cta: {
      text: "Prendre rendez-vous",
      href: "/cabinet#contact",
    },
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const dbArticle = await getPublicArticle(id);
  if (dbArticle) {
    return {
      title: dbArticle.title,
      description: dbArticle.desc,
      openGraph: { title: dbArticle.title, description: dbArticle.desc },
    };
  }
  const article = ARTICLES[id];
  if (!article) return { title: "Article introuvable" };
  return {
    title: article.title,
    description: article.desc,
    openGraph: { title: article.title, description: article.desc },
  };
}

export const dynamic = "force-dynamic";

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Article piloté par le back-office (Markdown), repli sur les articles riches statiques
  const dbArticle = await getPublicArticle(id);
  if (dbArticle && dbArticle.content) {
    return <MarkdownArticleView article={dbArticle} />;
  }

  const article = ARTICLES[id];
  if (!article) notFound();

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white text-marine-profond relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-logo/[0.05] blur-[120px] pointer-events-none" aria-hidden />

        {/* En-tête article */}
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-12">
          <Reveal>
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-gris-texte hover:text-orange-contrast transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Tous les articles
            </Link>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="px-4 py-1.5 rounded-full text-[11px] font-bold bg-marine-profond/[0.07] text-marine-profond border border-marine-profond/15">
                {article.category}
              </span>
              <span className="text-gris-texte/60 text-xs font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {article.date}
              </span>
              <span className="text-gris-texte/60 text-xs font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime} de lecture
              </span>
            </div>

            <h1 className="font-playfair text-3xl sm:text-4xl md:text-[2.7rem] font-black tracking-tight leading-[1.15] mb-6">
              {article.title}
            </h1>
            <div className="h-1 w-16 bg-orange-logo rounded-full" />
          </Reveal>
        </div>

        {/* Corps de l'article */}
        <article className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <Reveal delay={0.1}>
            <p className="text-base sm:text-lg leading-[1.8] text-gris-texte font-medium border-l-[3px] border-orange-logo pl-5 sm:pl-6 mb-10 italic">
              {article.intro}
            </p>
          </Reveal>

          {article.sections.map((section, i) => (
            <Reveal key={section.heading} delay={0.05 * i}>
              <section className="mb-9">
                <h2 className="font-playfair text-xl sm:text-2xl font-bold text-marine-profond mb-4 flex items-baseline gap-3">
                  <span className="text-orange-logo font-inter text-sm font-black">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {section.heading}
                </h2>
                {section.paragraphs.map((p, j) => (
                  <p
                    key={j}
                    className="text-[15px] leading-[1.85] text-gris-texte mb-4"
                  >
                    {p}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="space-y-3 my-6 bg-gris-bleute/70 border border-marine-profond/[0.07] rounded-2xl p-6">
                    {section.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-3 text-[14px] leading-relaxed text-gris-texte"
                      >
                        <CheckCircle2 className="w-4.5 h-4.5 w-[18px] h-[18px] text-vert-tech shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </Reveal>
          ))}

          <Reveal>
            <div className="edge-glow rounded-3xl bg-marine-profond text-white p-8 sm:p-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-grain-light opacity-40 pointer-events-none" aria-hidden />
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-orange-logo/15 blur-[70px] pointer-events-none" aria-hidden />
              <div className="relative">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-logo mb-3">
                  En résumé
                </p>
                <p className="text-slate-300 text-[15px] leading-[1.8] mb-7">
                  {article.conclusion}
                </p>
                <CTAButton href={article.cta.href} variant="primary">
                  {article.cta.text}
                </CTAButton>
              </div>
            </div>
          </Reveal>
        </article>
      </main>

      <WhatsAppFAB />
      <Footer />
    </>
  );
}

/* ═════════════════════════════════════════════════════════════
   Rendu des articles pilotés par le back-office (Markdown).
   Structure : introduction, sections ##, listes -, « ## En résumé »
   transformé en bloc conclusion. Mise en page identique aux articles
   historiques du site.
   ═════════════════════════════════════════════════════════════ */

interface MdSection {
  heading: string;
  paragraphs: string[];
  bullets: string[];
}

function parseMarkdown(content: string): {
  intro: string;
  sections: MdSection[];
  conclusion: string | null;
} {
  const normalized = content.replace(/\r\n/g, "\n").trim();
  const parts = normalized.split(/\n(?=## )/);

  const intro = (parts.shift() || "").trim();
  let conclusion: string | null = null;
  const sections: MdSection[] = [];

  for (const part of parts) {
    const lines = part.split("\n");
    const heading = lines.shift()?.replace(/^##\\s*/, "").trim() || "";
    let paragraphs: string[] = [];
    let bullets: string[] = [];
    let buffer: string[] = [];

    const flush = () => {
      if (buffer.length) {
        paragraphs.push(buffer.join(" ").trim());
        buffer = [];
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        flush();
      } else if (/^[-*]\\s+/.test(trimmed)) {
        flush();
        bullets.push(trimmed.replace(/^[-*]\\s+/, ""));
      } else {
        buffer.push(trimmed);
      }
    }
    flush();

    if (heading.toLowerCase() === "en résumé") {
      conclusion = paragraphs.join(" ").trim() || bullets.join(" ");
    } else {
      sections.push({ heading, paragraphs, bullets });
    }
  }

  return { intro, sections, conclusion };
}

/** Transforme le **gras** Markdown en <strong>. */
function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/\\*\\*(.+?)\\*\\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={`${keyPrefix}-${i}`} className="font-bold text-marine-profond">
        {part}
      </strong>
    ) : (
      <span key={`${keyPrefix}-${i}`}>{part}</span>
    )
  );
}

function MarkdownArticleView({ article }: { article: PublicBlogPost }) {
  const { intro, sections, conclusion } = parseMarkdown(article.content ?? "");

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white text-marine-profond relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-logo/[0.05] blur-[120px] pointer-events-none" aria-hidden />

        {/* En-tête article */}
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-12">
          <Reveal>
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-gris-texte hover:text-orange-contrast transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Tous les articles
            </Link>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="px-4 py-1.5 rounded-full text-[11px] font-bold bg-marine-profond/[0.07] text-marine-profond border border-marine-profond/15">
                {article.category}
              </span>
              <span className="text-gris-texte/60 text-xs font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {article.date}
              </span>
              <span className="text-gris-texte/60 text-xs font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime} de lecture
              </span>
            </div>

            <h1 className="font-playfair text-3xl sm:text-4xl md:text-[2.7rem] font-black tracking-tight leading-[1.15] mb-6">
              {article.title}
            </h1>
            <div className="h-1 w-16 bg-orange-logo rounded-full" />
          </Reveal>
        </div>

        {/* Corps de l'article */}
        <article className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {intro && (
            <Reveal delay={0.1}>
              <p className="text-base sm:text-lg leading-[1.8] text-gris-texte font-medium border-l-[3px] border-orange-logo pl-5 sm:pl-6 mb-10 italic">
                {renderInline(intro, "intro")}
              </p>
            </Reveal>
          )}

          {sections.map((section, i) => (
            <Reveal key={section.heading} delay={0.05 * i}>
              <section className="mb-9">
                <h2 className="font-playfair text-xl sm:text-2xl font-bold text-marine-profond mb-4 flex items-baseline gap-3">
                  <span className="text-orange-logo font-inter text-sm font-black">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {section.heading}
                </h2>
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="text-[15px] leading-[1.85] text-gris-texte mb-4">
                    {renderInline(p, `s${i}-p${j}`)}
                  </p>
                ))}
                {section.bullets.length > 0 && (
                  <ul className="space-y-3 my-6 bg-gris-bleute/70 border border-marine-profond/[0.07] rounded-2xl p-6">
                    {section.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-[14px] leading-relaxed text-gris-texte">
                        <CheckCircle2 className="w-[18px] h-[18px] text-vert-tech shrink-0 mt-0.5" />
                        <span>{renderInline(b, `s${i}-b`)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </Reveal>
          ))}

          {conclusion && (
            <Reveal>
              <div className="edge-glow rounded-3xl bg-marine-profond text-white p-8 sm:p-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-grain-light opacity-40 pointer-events-none" aria-hidden />
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-orange-logo/15 blur-[70px] pointer-events-none" aria-hidden />
                <div className="relative">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-logo mb-3">
                    En résumé
                  </p>
                  <p className="text-slate-300 text-[15px] leading-[1.8] mb-7">
                    {renderInline(conclusion, "conclusion")}
                  </p>
                  <CTAButton href="/cabinet#contact" variant="primary">
                    Parler à un expert-comptable
                  </CTAButton>
                </div>
              </div>
            </Reveal>
          )}
        </article>
      </main>

      <WhatsAppFAB />
      <Footer />
    </>
  );
}
