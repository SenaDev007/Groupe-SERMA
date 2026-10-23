import prisma from "@/lib/prisma";

/**
 * Contenus publics alimentés par le back-office.
 * Chaque getter retombe sur un jeu statique de secours si la base est
 * indisponible ou vide — le site public ne doit jamais casser.
 */

export interface PublicFiliere {
  num: string;
  title: string;
  hook: string;
  desc: string;
  learns: string[];
  outcome: string;
}

export interface PublicFormationCourte {
  title: string;
  hook: string;
  skills: string[];
}

export interface PublicBlogPost {
  id: string;
  title: string;
  desc: string;
  category: string;
  date: string;
  readTime: string;
  slug: string;
  content?: string | null;
}

export interface PublicTestimonial {
  result: string;
  quote: string;
  author: string;
  roleOrSub: string;
  entity: "CABINET" | "ACADEMY";
}

// ── Jeux de secours (identiques au contenu actuel du site) ──

const FALLBACK_FILIERES: PublicFiliere[] = [
  {
    num: "01",
    title: "Commerce & Distribution",
    hook: "Tu fais le commerce. Mais l'argent ne reste pas. On t'apprend à gérer, pas juste à vendre.",
    desc: "Le problème de la plupart des commerçants béninois n'est pas le manque de clients. C'est la gestion. Les prix mal fixés. Le stock mal suivi. WhatsApp utilisé sans méthode.",
    learns: [
      "Fixer tes prix avec une marge bénéficiaire réelle",
      "Gérer ton stock sans pertes ni surstock",
      "Vendre efficacement : terrain et WhatsApp Business",
    ],
    outcome: "Un commerce fonctionnel avec clients réguliers + accès facilité aux microcrédits.",
  },
  {
    num: "02",
    title: "Agro-Business & Transformation",
    hook: "Transforme ce que tu produis. Et multiplie ta valeur par 3.",
    desc: "Un kilogramme de manioc brut se vend à un prix très bas. Un kilogramme de gari bien transformé ou conditionné se vend bien plus cher. La différence, c'est la transformation.",
    learns: [
      "Transformer les produits agricoles locaux (manioc, soja, fruits)",
      "Conditionner pour la vente de détail et de gros",
      "Vendre avec une stratégie de prix adaptée au marché",
    ],
    outcome: "Un produit fini prêt à la vente + accès facilité aux microcrédits.",
  },
  {
    num: "03",
    title: "Services Techniques",
    hook: "Tu sais travailler de tes mains. Apprenons à en vivre vraiment.",
    desc: "Électricité. Plomberie. Solaire. Maintenance. Des compétences qui manquent partout au Bénin. Le problème n'est pas le savoir-faire technique — c'est de trouver des clients, faire des devis et facturer correctement.",
    learns: [
      "Trouver des clients et se constituer un réseau professionnel",
      "Établir des devis et des contrats clairs et pros",
      "Gérer ses revenus et structurer son activité d'artisan",
    ],
    outcome: "Un service opérationnel avec tes premiers contrats + accès aux microcrédits.",
  },
  {
    num: "04",
    title: "Digital Local",
    hook: "Ton téléphone va te faire gagner de l'argent. On t'apprend comment.",
    desc: "Facebook, WhatsApp, Instagram. Des outils que tout le monde utilise pour s'amuser. Mais très peu savent en faire des sources de revenus réelles : vente, marketing local, services digitaux de proximité.",
    learns: [
      "Utiliser Facebook Ads et WhatsApp Business professionnellement",
      "Créer des visuels et des textes qui attirent l'acheteur",
      "Lancer des services digitaux adaptés au commerce local",
    ],
    outcome: "Tes premiers contrats clients digitaux signés + accès aux microcrédits.",
  },
  {
    num: "05",
    title: "Entrepreneuriat Féminin",
    hook: "Femme, tu as plus de ressources que tu ne le crois. On t'aide à les activer.",
    desc: "Cette filière est spécialement conçue pour les femmes, groupements et associations qui veulent créer ou développer une activité génératrice de revenus stable. Pas de jargon, que du concret adapté à ta réalité sociale.",
    learns: [
      "Identifier et valider une idée d'activité à fort potentiel local",
      "Gérer séparément ses finances personnelles et professionnelles",
      "Développer sa confiance, son leadership et son réseau de vente",
    ],
    outcome: "Une activité viable maîtrisée + microcrédits + réseau de femmes entrepreneures.",
  },
];

const FALLBACK_COURTES: PublicFormationCourte[] = [
  {
    title: "PERFECTO & SYSCOHADA Révisé",
    hook: "Le logiciel standard utilisé par les cabinets et ONG au Bénin.",
    skills: [
      "Tenir une comptabilité complète sur PERFECTO",
      "Appliquer les règles du SYSCOHADA révisé",
      "Produire et analyser les états financiers finaux",
    ],
  },
  {
    title: "Gestion Efficace de la Caisse",
    hook: "Caissier ou responsable de caisse — ne laissez plus passer d'erreur.",
    skills: [
      "Maîtriser les encaissements & décaissements",
      "Tenir le brouillard et journal quotidien",
      "Réaliser les arrêtés de caisse et gérer les écarts",
    ],
  },
  {
    title: "Gestion Financière de Projet (OHADA)",
    hook: "Gérez les fonds comme les bailleurs internationaux l'exigent.",
    skills: [
      "Tenir la comptabilité d'un projet (PERFECTO)",
      "Élaborer et suivre un budget projet",
      "Produire les rapports financiers bailleurs",
    ],
  },
];

const FALLBACK_POSTS: PublicBlogPost[] = [
  {
    id: "1",
    slug: "syscohada-revise-pme-2026",
    title: "Comprendre le SYSCOHADA Révisé : ce qui change pour les PME en 2026",
    desc: "Le système comptable ouest-africain évolue. Découvrez les nouvelles obligations comptables et de présentation des comptes pour rester en règle.",
    category: "Cabinet & Fiscalité",
    date: "14 Mai 2026",
    readTime: "6 min",
  },
  {
    id: "2",
    slug: "whatsapp-business-ventes-locales",
    title: "Comment utiliser WhatsApp Business pour doubler ses ventes locales",
    desc: "WhatsApp n'est pas qu'un outil de chat. Apprenez à configurer vos catalogues de produits, automatiser vos réponses et attirer des clients à Parakou.",
    category: "Entrepreneuriat",
    date: "08 Mai 2026",
    readTime: "4 min",
  },
  {
    id: "3",
    slug: "competences-caissier-professionnel",
    title: "5 compétences à maîtriser pour devenir caissier professionnel",
    desc: "Vous postulez en banque ou microfinance ? Voici les compétences pratiques (journaux de caisse, arrêtés, prévention de fraude) qui feront la différence.",
    category: "Formations & Carrière",
    date: "29 Avril 2026",
    readTime: "5 min",
  },
  {
    id: "4",
    slug: "guide-declaration-fiscale-unique-benin",
    title: "Le guide pratique de la Déclaration Fiscale Unique (DFU) au Bénin",
    desc: "Évitez les redressements et pénalités de retard. Retrouvez le calendrier, les pièces justificatives requises et nos conseils d'optimisation légale.",
    category: "Cabinet & Fiscalité",
    date: "12 Avril 2026",
    readTime: "8 min",
  },
];

const FALLBACK_TESTIMONIALS: Record<"CABINET" | "ACADEMY", PublicTestimonial[]> = {
  CABINET: [
    {
      result: "Arriérés fiscaux de 3 ans régularisés sans pénalité",
      quote: "Avant de travailler avec le Cabinet SERMA, nous avions peur de chaque contrôle fiscal. Aujourd'hui, nos déclarations sont irréprochables et nous pilotons sereinement.",
      author: "Dossou KPONOU",
      roleOrSub: "Directeur Général · AgroBenin (Parakou)",
      entity: "CABINET",
    },
    {
      result: "Zéro pénalité fiscale",
      quote: "Avant Cabinet SERMA, nous avions beaucoup d'arriérés comptables accumulés et de la confusion. Ils ont tout régularisé avec l'administration en un temps record. Un poids en moins.",
      author: "Directeur Administratif",
      roleOrSub: "ONG de Santé Publique (Bénin)",
      entity: "CABINET",
    },
    {
      result: "États certifiés, financement validé",
      quote: "Grâce à la certification rapide et rigoureuse de nos bilans par le Cabinet, nous avons pu décrocher notre prêt bancaire pour notre projet d'usine de transformation.",
      author: "Fondateur & CEO",
      roleOrSub: "Startup Agro-alimentaire (Parakou)",
      entity: "CABINET",
    },
  ],
  ACADEMY: [
    {
      result: "Yaourts rentables lancés en 2 mois à Parakou",
      quote: "J'ai suivi la filière agro-business. J'ai appris à transformer le soja local en lait et yaourts. Aujourd'hui, je vends dans trois quartiers de Parakou et génère mes propres revenus.",
      author: "Mariam",
      roleOrSub: "Diplômée filière Agro-Business",
      entity: "ACADEMY",
    },
  ],
};

// ── Getters publics ──────────────────────────────────────────

export async function getPublicFilieres(): Promise<PublicFiliere[]> {
  try {
    const rows = await prisma.formation.findMany({
      where: { category: "FILIERE", status: "PUBLIE" },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    if (rows.length === 0) return FALLBACK_FILIERES;
    return rows.map((f, i) => ({
      num: String(i + 1).padStart(2, "0"),
      title: f.title,
      hook: f.hook ?? "",
      desc: f.description ?? "",
      learns: parseList(f.skills),
      outcome: f.outcome ?? "",
    }));
  } catch {
    return FALLBACK_FILIERES;
  }
}

export async function getPublicFormationsCourtes(): Promise<PublicFormationCourte[]> {
  try {
    const rows = await prisma.formation.findMany({
      where: { category: "FORMATION_COURTE", status: "PUBLIE" },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    if (rows.length === 0) return FALLBACK_COURTES;
    return rows.map((f) => ({
      title: f.title,
      hook: f.hook ?? "",
      skills: parseList(f.skills),
    }));
  } catch {
    return FALLBACK_COURTES;
  }
}

export async function getPublicPosts(): Promise<PublicBlogPost[]> {
  try {
    const rows = await prisma.article.findMany({
      where: { status: "PUBLIE" },
      orderBy: { publishedAt: "desc" },
    });
    if (rows.length === 0) return FALLBACK_POSTS;
    return rows.map((a) => ({
      id: a.legacyId !== null ? String(a.legacyId) : a.slug,
      slug: a.slug,
      title: a.title,
      desc: a.excerpt ?? "",
      category: a.category ?? "Cabinet & Fiscalité",
      date: a.publishedAt
        ? a.publishedAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
        : "",
      readTime: a.readTime ?? "5 min",
      content: a.content,
    }));
  } catch {
    return FALLBACK_POSTS;
  }
}

export async function getPublicArticle(idOrSlug: string): Promise<PublicBlogPost | null> {
  try {
    const numeric = /^\d+$/.test(idOrSlug) ? Number(idOrSlug) : null;
    const article = await prisma.article.findFirst({
      where: numeric !== null ? { legacyId: numeric } : { slug: idOrSlug },
    });
    if (!article) return null;
    return {
      id: article.legacyId !== null ? String(article.legacyId) : article.slug,
      slug: article.slug,
      title: article.title,
      desc: article.excerpt ?? "",
      category: article.category ?? "Cabinet & Fiscalité",
      date: article.publishedAt
        ? article.publishedAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
        : "",
      readTime: article.readTime ?? "5 min",
      content: article.content,
    };
  } catch {
    return null;
  }
}

export async function getPublicTestimonials(
  entity: "CABINET" | "ACADEMY"
): Promise<PublicTestimonial[]> {
  try {
    const rows = await prisma.testimonial.findMany({
      where: { entity, status: "PUBLIE" },
      orderBy: { createdAt: "asc" },
    });
    if (rows.length === 0) return FALLBACK_TESTIMONIALS[entity];
    return rows.map((t) => ({
      result: t.result ?? "",
      quote: t.content,
      author: t.name,
      roleOrSub: t.role ?? "",
      entity,
    }));
  } catch {
    return FALLBACK_TESTIMONIALS[entity];
  }
}

function parseList(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((s) => String(s)).filter(Boolean);
  } catch {
    // ignore
  }
  return [];
}
