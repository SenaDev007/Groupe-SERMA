/**
 * Seed du back-office Groupe SERMA.
 * Exécution : bun scripts/seed-back-office.ts
 * Idempotent : réinitialise les tables métier, préserve la DB SQLite.
 *
 * ⚠️ À lancer sur la base LOCALE (SQLite de démonstration) — jamais sur
 * la base Neon de production : elle contient les vraies données du cabinet.
 * Variables : BO_FALLBACK_URL (ou DATABASE_URL) → URL file:… de la base.
 */
import prismaDefault from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import articlesMd from "./articles-md.json";

const prisma = prismaDefault as { [k: string]: any };

// ── Compte administrateur ────────────────────────────────────
// Mot de passe lu depuis l'environnement (jamais versionné) :
//   SEED_ADMIN_PASSWORD — voir .env.example
const ADMIN = {
  email: "admin@sermagroupe.bj",
  name: "Sébastien ADJOVI",
  role: "ADMIN",
  password: process.env.SEED_ADMIN_PASSWORD || "ChangerMotDePasse@2026",
};

// ── Clients ONG ──────────────────────────────────────────────
const ONGS = [
  {
    name: "ONG Santé Aloma",
    sector: "Santé publique",
    contactName: "Dr. Fatou BAKARY",
    email: "direction@santealoma.org",
    phone: "+229 01 97 22 14 08",
    address: "Parakou, quartier Aloma",
    taxId: "IFU-1204578A",
    notes: "Projet PALU-NET financé par un bailleur européen. Reporting trimestriel exigé.",
  },
  {
    name: "ONG Éducation Pour Tous Nord-Borgou",
    sector: "Éducation",
    contactName: "Innocent TCHALA",
    email: "comptabilite@ept-nordborgou.org",
    phone: "+229 01 96 55 41 22",
    address: "Parakou, Aïrport road",
    taxId: "IFU-1109832B",
    notes: "Programme DAD 2024-2027 — audits bailleurs annuels.",
  },
  {
    name: "ONG Eau & Assainissement Alibori",
    sector: "WASH",
    contactName: "Clarisse HOUNGBEDJI",
    email: "admin@eau-alibori.org",
    phone: "+229 01 95 12 78 30",
    address: "Kandi, route de Banikoara",
    taxId: "IFU-1302214C",
    notes: "Forages et latrines scolaires. Convention UNICEF locale.",
  },
  {
    name: "ONG Femmes Actives de Parakou",
    sector: "Autonomisation féminine",
    contactName: "Rosine SANNI",
    email: "contact@femmesactives-pta.org",
    phone: "+229 01 94 08 63 15",
    address: "Parakou, quartier Touré",
    taxId: "IFU-1407719D",
    notes: "Microcrédits de groupe. Comptabilité de fonds rotatifs.",
  },
];

// ── Autres clients (entreprises) ─────────────────────────────
const ENTREPRISES = [
  {
    name: "SARL Agro-Distribution Koubiri",
    sector: "Commerce de gros",
    contactName: "Moussa KORA",
    email: "dg@agrokoubiri.bj",
    phone: "+229 01 97 41 05 66",
    address: "Parakou, marché A arena",
    taxId: "IFU-1503310E",
    notes: "Distribution de denrées. Fort volume de factures TVA.",
  },
  {
    name: "DigitalPay Bénin SARL",
    sector: "Startup fintech",
    contactName: "Angèle DOKO",
    email: "finance@digitalpay.bj",
    phone: "+229 01 96 88 27 44",
    address: "Cotonou, Ganhi (antenne Parakou)",
    taxId: "IFU-1604491F",
    notes: "Levée de fonds en cours — états financiers IFRS PME exigés par les investisseurs.",
  },
  {
    name: "BTP Alibori Construction SARL",
    sector: "Bâtiment & travaux publics",
    contactName: "Idrissou BALDÉ",
    email: "comptabilite@btp-alibori.bj",
    phone: "+229 01 95 33 92 71",
    address: "Parakou, zone industrielle",
    taxId: "IFU-1705528G",
    notes: "Marchés publics — retenues de garantie et TVA marchés.",
  },
  {
    name: "Pharmacie de l'Unité",
    sector: "Santé privée",
    contactName: "Pharm. Bernadette AMOUSSOU",
    email: "pharmacie.unite@bj.med",
    phone: "+229 01 94 19 58 03",
    address: "Parakou, quartier Unité",
    taxId: "IFU-1806603H",
    notes: "Stocks périmétriques à suivre — inventaire trimestriel.",
  },
];

// ── Modèle de missions par exercice ──────────────────────────
function missionsForYear(label: string, closed: boolean) {
  const [start] = label.split("-");
  const year = parseInt(start, 10);
  const base = (m: number, d: number) => new Date(year + (m >= 4 ? 0 : 1), m - 1, d);
  const done = closed ? "TERMINE" : "EN_COURS";
  return [
    {
      title: `Tenue comptable mensuelle — journaux, caisse, banque (${label})`,
      category: "TENUE",
      status: closed ? "TERMINE" : "EN_COURS",
      priority: "NORMALE",
      dueDate: base(3, 31),
      notes: "Saisie PERFECTO, rapprochements bancaires mensuels.",
    },
    {
      title: "Déclarations TVA mensuelles",
      category: "FISCALITE",
      status: done,
      priority: "HAUTE",
      dueDate: base(3, 15),
      notes: "Télédéclaration DGI — contrôle apurement crédit TVA.",
    },
    {
      title: "DFU — Déclaration Fiscale Unique",
      category: "FISCALITE",
      status: closed ? "TERMINE" : "EN_COURS",
      priority: "URGENTE",
      dueDate: base(5, 31),
      notes: "États financiers SYSCOHADA + annexes fiscales.",
    },
    {
      title: "Paie & déclarations sociales CNSS",
      category: "SOCIAL",
      status: done,
      priority: "NORMALE",
      dueDate: base(3, 10),
      notes: "Bulletins, DUE, virements salaires.",
    },
    {
      title: `Certification des états financiers ${label}`,
      category: "CERTIFICATION",
      status: closed ? "TERMINE" : "A_FAIRE",
      priority: "HAUTE",
      dueDate: base(6, 30),
      notes: "Commissariat aux comptes léger / attestation de sincérité.",
    },
  ];
}

const ONG_EXTRA_MISSIONS = [
  {
    title: "Rapport financier bailleur (trimestre 1)",
    category: "CONSEIL",
    status: "EN_COURS",
    priority: "NORMALE",
    dueDate: new Date(2026, 0, 31),
    notes: "Format bailleur : dépenses par poste budgétaire + variance analysis.",
  },
];

// ── Documents initiaux (grilles + documents) ──────────────────
const SHEET_BALANCE = JSON.stringify({
  cols: ["RUBRIQUE", "SOLDE DÉBIT", "SOLDE CRÉDIT"],
  rows: [
    ["521 Banques", "12500000", ""],
    ["571 Caisse", "450000", ""],
    ["411 Clients", "2300000", ""],
    ["601 Achats", "8400000", ""],
    ["701 Ventes", "", "15750000"],
    ["661 Charges de personnel", "3200000", ""],
    ["431 CNSS à payer", "", "640000"],
    ["441 État, TVA à payer", "", "910000"],
  ],
});

const SHEET_CAISSE = JSON.stringify({
  cols: ["DATE", "PIÈCE", "LIBELLÉ", "ENTRÉES", "SORTIES"],
  rows: [
    ["02/10/2025", "RC001", "Report à nouveau", "350000", ""],
    ["07/10/2025", "RC002", "Dotation caisse banque", "500000", ""],
    ["09/10/2025", "DV014", "Achat fournitures bureau", "", "78000"],
    ["14/10/2025", "DV015", "Transport mission Kandi", "", "120000"],
    ["21/10/2025", "DV016", "Carburant véhicule", "", "95000"],
  ],
});

const DOC_NOTE = `<h1>Note de cadrage — Mission de certification</h1>
<p><strong>Exercice :</strong> 2025-2026 · <strong>Réf. :</strong> CERT-2026-001</p>
<h2>1. Contexte et objectifs</h2>
<p>La présente mission vise la certification des états financiers annuels conformément au référentiel SYSCOHADA révisé. Le cabinet intervient en qualité de commissaire aux comptes léger, avec remise d'une attestation de sincérité et de régularité destinée aux bailleurs et partenaires financiers.</p>
<h2>2. Démarche d'intervention</h2>
<ul>
<li>Prise de connaissance de l'entité et de son contrôle interne ;</li>
<li>Examen des procédures d'enregistrement et de centralisation ;</li>
<li>Sondages sur les principaux cycles (achats, ventes, paie, trésorerie) ;</li>
<li>Examen des événements postérieurs à la clôture.</li>
</ul>
<h2>3. Calendrier</h2>
<p>Travaux de terrain entre le 15 avril et le 30 mai, remise du rapport au plus tard le 30 juin de l'année suivante.</p>`;

// ── Formations (issues du site public) ───────────────────────
const FILIERES = [
  {
    title: "Commerce & Distribution",
    hook: "Tu fais le commerce. Mais l'argent ne reste pas. On t'apprend à gérer, pas juste à vendre.",
    description:
      "Le problème de la plupart des commerçants béninois n'est pas le manque de clients. C'est la gestion. Les prix mal fixés. Le stock mal suivi. WhatsApp utilisé sans méthode.",
    skills: [
      "Fixer tes prix avec une marge bénéficiaire réelle",
      "Gérer ton stock sans pertes ni surstock",
      "Vendre efficacement : terrain et WhatsApp Business",
    ],
    outcome: "Un commerce fonctionnel avec clients réguliers + accès facilité aux microcrédits.",
    order: 1,
  },
  {
    title: "Agro-Business & Transformation",
    hook: "Transforme ce que tu produis. Et multiplie ta valeur par 3.",
    description:
      "Un kilogramme de manioc brut se vend à un prix très bas. Un kilogramme de gari bien transformé ou conditionné se vend bien plus cher. La différence, c'est la transformation.",
    skills: [
      "Transformer les produits agricoles locaux (manioc, soja, fruits)",
      "Conditionner pour la vente de détail et de gros",
      "Vendre avec une stratégie de prix adaptée au marché",
    ],
    outcome: "Un produit fini prêt à la vente + accès facilité aux microcrédits.",
    order: 2,
  },
  {
    title: "Services Techniques",
    hook: "Tu sais travailler de tes mains. Apprenons à en vivre vraiment.",
    description:
      "Électricité. Plomberie. Solaire. Maintenance. Des compétences qui manquent partout au Bénin. Le problème n'est pas le savoir-faire technique — c'est de trouver des clients, faire des devis et facturer correctement.",
    skills: [
      "Trouver des clients et se constituer un réseau professionnel",
      "Établir des devis et des contrats clairs et pros",
      "Gérer ses revenus et structurer son activité d'artisan",
    ],
    outcome: "Un service opérationnel avec tes premiers contrats + accès aux microcrédits.",
    order: 3,
  },
  {
    title: "Digital Local",
    hook: "Ton téléphone va te faire gagner de l'argent. On t'apprend comment.",
    description:
      "Facebook, WhatsApp, Instagram. Des outils que tout le monde utilise pour s'amuser. Mais très peu savent en faire des sources de revenus réelles : vente, marketing local, services digitaux de proximité.",
    skills: [
      "Utiliser Facebook Ads et WhatsApp Business professionnellement",
      "Créer des visuels et des textes qui attirent l'acheteur",
      "Lancer des services digitaux adaptés au commerce local",
    ],
    outcome: "Tes premiers contrats clients digitaux signés + accès aux microcrédits.",
    order: 4,
  },
  {
    title: "Entrepreneuriat Féminin",
    hook: "Femme, tu as plus de ressources que tu ne le crois. On t'aide à les activer.",
    description:
      "Cette filière est spécialement conçue pour les femmes, groupements et associations qui veulent créer ou développer une activité génératrice de revenus stable. Pas de jargon, que du concret adapté à ta réalité sociale.",
    skills: [
      "Identifier et valider une idée d'activité à fort potentiel local",
      "Gérer séparément ses finances personnelles et professionnelles",
      "Développer sa confiance, son leadership et son réseau de vente",
    ],
    outcome: "Une activité viable maîtrisée + microcrédits + réseau de femmes entrepreneures.",
    order: 5,
  },
];

const COURTES = [
  {
    title: "PERFECTO & SYSCOHADA Révisé",
    hook: "Le logiciel standard utilisé par les cabinets et ONG au Bénin.",
    skills: [
      "Tenir une comptabilité complète sur PERFECTO",
      "Appliquer les règles du SYSCOHADA révisé",
      "Produire et analyser les états financiers finaux",
    ],
    order: 6,
  },
  {
    title: "Gestion Efficace de la Caisse",
    hook: "Caissier ou responsable de caisse — ne laissez plus passer d'erreur.",
    skills: [
      "Maîtriser les encaissements & décaissements",
      "Tenir le brouillard et journal quotidien",
      "Réaliser les arrêtés de caisse et gérer les écarts",
    ],
    order: 7,
  },
  {
    title: "Gestion Financière de Projet (OHADA)",
    hook: "Gérez les fonds comme les bailleurs internationaux l'exigent.",
    skills: [
      "Tenir la comptabilité d'un projet (PERFECTO)",
      "Élaborer et suivre un budget projet",
      "Produire les rapports financiers bailleurs",
    ],
    order: 8,
  },
];

// ── Articles du blog (issus du site public) ──────────────────
const ARTICLES = [
  {
    title: "Comprendre le SYSCOHADA Révisé : ce qui change pour les PME en 2026",
    slug: "syscohada-revise-pme-2026",
    legacyId: 1,
    excerpt:
      "Le système comptable ouest-africain évolue. Découvrez les nouvelles obligations comptables et de présentation des comptes pour rester en règle.",
    category: "Cabinet & Fiscalité",
    readTime: "6 min",
    content: articlesMd.markdown["1"],
  },
  {
    title: "Comment utiliser WhatsApp Business pour doubler ses ventes locales",
    slug: "whatsapp-business-ventes-locales",
    legacyId: 2,
    excerpt:
      "WhatsApp n'est pas qu'un outil de chat. Apprenez à configurer vos catalogues de produits, automatiser vos réponses et attirer des clients à Parakou.",
    category: "Entrepreneuriat",
    readTime: "4 min",
    content: articlesMd.markdown["2"],
  },
  {
    title: "5 compétences à maîtriser pour devenir caissier professionnel",
    slug: "competences-caissier-professionnel",
    legacyId: 3,
    excerpt:
      "Vous postulez en banque ou microfinance ? Voici les compétences pratiques (journaux de caisse, arrêtés, prévention de fraude) qui feront la différence.",
    category: "Formations & Carrière",
    readTime: "5 min",
    content: articlesMd.markdown["3"],
  },
  {
    title: "Le guide pratique de la Déclaration Fiscale Unique (DFU) au Bénin",
    slug: "guide-declaration-fiscale-unique-benin",
    legacyId: 4,
    excerpt:
      "Évitez les redressements et pénalités de retard. Retrouvez le calendrier, les pièces justificatives requises et nos conseils d'optimisation légale.",
    category: "Cabinet & Fiscalité",
    readTime: "8 min",
    content: articlesMd.markdown["4"],
  },
];

// ── Témoignages (issus du site public) ───────────────────────
const TESTIMONIALS = [
  {
    name: "Dossou KPONOU",
    role: "Directeur Général · AgroBenin (Parakou)",
    entity: "CABINET",
    result: "Arriérés fiscaux de 3 ans régularisés sans pénalité",
    content:
      "Avant de travailler avec le Cabinet SERMA, nous avions peur de chaque contrôle fiscal. Aujourd'hui, nos déclarations sont irréprochables et nous pilotons sereinement.",
  },
  {
    name: "Directeur Administratif",
    role: "ONG de Santé Publique (Bénin)",
    entity: "CABINET",
    result: "Zéro pénalité fiscale",
    content:
      "Avant Cabinet SERMA, nous avions beaucoup d'arriérés comptables accumulés et de la confusion. Ils ont tout régularisé avec l'administration en un temps record. Un poids en moins.",
  },
  {
    name: "Fondateur & CEO",
    role: "Startup Agro-alimentaire (Parakou)",
    entity: "CABINET",
    result: "États certifiés, financement validé",
    content:
      "Grâce à la certification rapide et rigoureuse de nos bilans par le Cabinet, nous avons pu décrocher notre prêt bancaire pour notre projet d'usine de transformation.",
  },
  {
    name: "Mariam",
    role: "Diplômée filière Agro-Business",
    entity: "ACADEMY",
    result: "Yaourts rentables lancés en 2 mois à Parakou",
    content:
      "J'ai suivi la filière agro-business. J'ai appris à transformer le soja local en lait et yaourts. Aujourd'hui, je vends dans trois quartiers de Parakou et génère mes propres revenus.",
  },
  {
    name: "Amina",
    role: "Apprenante Filière Agro-Business (Parakou)",
    entity: "ACADEMY",
    result: "Vente de soja multipliée par 2",
    content:
      "Avant de venir chez SERMA HUB, j'avais une idée de transformation mais pas de méthode de prix. La formation m'a appris à gérer ma marge et stock. Mon activité est maintenant structurée et rentable.",
  },
  {
    name: "Serge",
    role: "Diplômé de la formation courte PERFECTO",
    entity: "ACADEMY",
    result: "Comptable junior embauché en ONG",
    content:
      "Grâce au module PERFECTO de 3 jours, j'ai pu démontrer en entretien ma maîtrise pratique du logiciel face à d'autres candidats. C'est ça qui a fait la différence.",
  },
];

async function main() {
  console.log("→ Nettoyage des tables métier…");
  await prisma.document.deleteMany();
  await prisma.workItem.deleteMany();
  await prisma.folder.deleteMany();
  await prisma.client.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.formation.deleteMany();
  await prisma.article.deleteMany();
  await prisma.testimonial.deleteMany();

  // ── Admin ──
  console.log("→ Compte administrateur…");
  const passwordHash = await bcrypt.hash(ADMIN.password, 10);
  await prisma.user.upsert({
    where: { email: ADMIN.email },
    update: { name: ADMIN.name, passwordHash, role: ADMIN.role },
    create: { email: ADMIN.email, name: ADMIN.name, passwordHash, role: ADMIN.role },
  });

  // ── Clients + arborescence de dossiers + missions + documents ──
  console.log("→ Dossiers ONG…");
  for (const ong of ONGS) {
    const client = await prisma.client.create({
      data: { ...ong, type: "ONG", status: "ACTIF" },
    });

    // Arborescence libre : racine + sous-dossiers (noms libres)
    const root = await prisma.folder.create({
      data: { id: `root_${client.id}`, clientId: client.id, parentId: null, name: client.name },
    });
    const folderClosed = await prisma.folder.create({
      data: { clientId: client.id, parentId: root.id, name: "2024-2025" },
    });
    const folderOpen = await prisma.folder.create({
      data: { clientId: client.id, parentId: root.id, name: "2025-2026" },
    });

    await prisma.workItem.createMany({
      data: missionsForYear("2024-2025", true).map((m) => ({
        ...m,
        clientId: client.id,
      })),
    });
    await prisma.workItem.createMany({
      data: [
        ...missionsForYear("2025-2026", false),
        ...ONG_EXTRA_MISSIONS,
      ].map((m) => ({ ...m, clientId: client.id })),
    });

    await prisma.document.create({
      data: {
        name: `Balance générale — ${client.name} (2025-2026)`,
        kind: "SHEET",
        entity: "CABINET",
        content: SHEET_BALANCE,
        folderId: folderOpen.id,
      },
    });
    await prisma.document.create({
      data: {
        name: `Journal de caisse — Octobre 2025 (${client.name})`,
        kind: "SHEET",
        entity: "CABINET",
        content: SHEET_CAISSE,
        folderId: folderOpen.id,
      },
    });
    await prisma.document.create({
      data: {
        name: `Note de cadrage — certification 2025-2026 (${client.name})`,
        kind: "DOC",
        entity: "CABINET",
        content: DOC_NOTE,
        folderId: folderOpen.id,
      },
    });
  }

  console.log("→ Autres clients…");
  for (const ent of ENTREPRISES) {
    const client = await prisma.client.create({
      data: { ...ent, type: "ENTREPRISE", status: "ACTIF" },
    });

    const root = await prisma.folder.create({
      data: { id: `root_${client.id}`, clientId: client.id, parentId: null, name: client.name },
    });
    const folderClosed = await prisma.folder.create({
      data: { clientId: client.id, parentId: root.id, name: "2024-2025" },
    });
    const folderOpen = await prisma.folder.create({
      data: { clientId: client.id, parentId: root.id, name: "2025-2026" },
    });

    await prisma.workItem.createMany({
      data: missionsForYear("2024-2025", true).map((m) => ({
        ...m,
        clientId: client.id,
      })),
    });
    await prisma.workItem.createMany({
      data: missionsForYear("2025-2026", false).map((m) => ({
        ...m,
        clientId: client.id,
      })),
    });

    await prisma.document.create({
      data: {
        name: `Balance générale — ${client.name} (2025-2026)`,
        kind: "SHEET",
        entity: "CABINET",
        content: SHEET_BALANCE,
        folderId: folderOpen.id,
      },
    });
    void folderClosed;
  }

  // ── Formations ──
  console.log("→ Formations Academy…");
  for (const f of FILIERES) {
    await prisma.formation.create({
      data: {
        title: f.title,
        hook: f.hook,
        description: f.description,
        skills: JSON.stringify(f.skills),
        outcome: f.outcome,
        category: "FILIERE",
        status: "PUBLIE",
        order: f.order,
        level: "Débutant à confirmé",
        duration: "6 mois",
      },
    });
  }
  for (const f of COURTES) {
    await prisma.formation.create({
      data: {
        title: f.title,
        hook: f.hook,
        skills: JSON.stringify(f.skills),
        category: "FORMATION_COURTE",
        status: "PUBLIE",
        order: f.order,
        duration: "3 jours",
      },
    });
  }

  // ── Articles ──
  console.log("→ Articles du blog…");
  for (const a of ARTICLES) {
    await prisma.article.create({
      data: {
        title: a.title,
        slug: a.slug,
        legacyId: a.legacyId,
        excerpt: a.excerpt,
        category: a.category,
        readTime: a.readTime,
        content: a.content,
        status: "PUBLIE",
        publishedAt: new Date(2026, 3, 15),
      },
    });
  }

  // ── Témoignages ──
  console.log("→ Témoignages…");
  for (const t of TESTIMONIALS) {
    await prisma.testimonial.create({
      data: {
        name: t.name,
        role: t.role,
        entity: t.entity,
        content: t.content,
        result: t.result,
        rating: 5,
        status: "PUBLIE",
      },
    });
  }

  // ── Import des soumissions existantes (site public) ──
  console.log("→ Soumissions existantes…");
  const submissionsFile = path.join(process.cwd(), "data", "submissions.json");
  if (fs.existsSync(submissionsFile)) {
    try {
      const submissions = JSON.parse(fs.readFileSync(submissionsFile, "utf-8"));
      for (const s of submissions) {
        const data = s.data || {};
        await prisma.submission.create({
          data: {
            source:
              s.entity === "academy"
                ? "INSCRIPTION_ACADEMY"
                : String(s.formTitle || "").toLowerCase().includes("rendez")
                  ? "RDV_CABINET"
                  : "CONTACT_CABINET",
            entity: s.entity === "academy" ? "ACADEMY" : "CABINET",
            name: data["Nom complet"] || data.nom || data.name || null,
            email:
              data["Adresse e-mail"] || data.email || data["Email"] || null,
            phone: data["Téléphone"] || data.telephone || data.phone || null,
            payload: JSON.stringify(s),
            status: "NOUVEAU",
          },
        });
      }
      console.log(`   ${submissions.length} soumission(s) importée(s).`);
    } catch (err) {
      console.warn("   Lecture submissions.json impossible :", err);
    }
  }

  const counts = {
    users: await prisma.user.count(),
    clients: await prisma.client.count(),
    folders: await prisma.folder.count(),
    workItems: await prisma.workItem.count(),
    documents: await prisma.document.count(),
    formations: await prisma.formation.count(),
    articles: await prisma.article.count(),
    testimonials: await prisma.testimonial.count(),
    submissions: await prisma.submission.count(),
  };
  console.log("✔ Seed terminé :", counts);
}

main()
  .catch((e) => {
    console.error("✘ Échec du seed :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
