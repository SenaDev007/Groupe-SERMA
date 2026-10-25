/**
 * Différenciation des données comptables et documents par client.
 * Chaque client reçoit des données SYSCOHADA réalistes propres à son
 * secteur (santé, éducation, eau, microcrédit, agro, fintech, BTP,
 * pharmacie) — plus un contenu Word spécifique (réf. mission, contextes).
 *
 * Ensuite : suppression des anciens fichiers + filePath vidé, puis
 * `bun scripts/generate-styled-workbooks.ts` régénère les .xlsx/.docx
 * avec la mise en forme complète du cabinet.
 *
 * Usage : BO_FALLBACK_URL=file:…/db/custom.db bun scripts/differentiate-client-data.ts
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "upload", "bo-files");

async function getPrisma(): Promise<any> {
  const url = process.env.BO_FALLBACK_URL ?? process.env.DATABASE_URL;
  if (url && !url.startsWith("file:")) {
    const mod = await import("@prisma/client");
    return new mod.PrismaClient();
  }
  const mod = await import("../src/generated/prisma-sqlite");
  return new mod.PrismaClient();
}

// ── Données comptables réalistes par client (SYSCOHADA) ──────
interface BalanceData {
  banques: number; caisse: number; clients: number; achats: number;
  ventes: number; personnel: number; cnss: number; tva: number;
  libelleAchats: string;
}
interface CaisseData { rows: [string, string, string, string, string][] }

const BALANCES: Record<string, BalanceData> = {
  "ONG Santé Aloma": {
    banques: 18450000, caisse: 380000, clients: 1250000, achats: 9600000,
    ventes: 24300000, personnel: 5400000, cnss: 780000, tva: 320000,
    libelleAchats: "601 Achats médicaments",
  },
  "ONG Éducation Pour Tous Nord-Borgou": {
    banques: 9850000, caisse: 290000, clients: 860000, achats: 6200000,
    ventes: 13750000, personnel: 3100000, cnss: 420000, tva: 180000,
    libelleAchats: "601 Achats manuels scolaires",
  },
  "ONG Eau & Assainissement Alibori": {
    banques: 14200000, caisse: 350000, clients: 940000, achats: 11300000,
    ventes: 18600000, personnel: 4200000, cnss: 560000, tva: 240000,
    libelleAchats: "601 Achats matériel de forage",
  },
  "ONG Femmes Actives de Parakou": {
    banques: 4650000, caisse: 180000, clients: 520000, achats: 3400000,
    ventes: 5900000, personnel: 1450000, cnss: 190000, tva: 90000,
    libelleAchats: "601 Achats intrants agricoles",
  },
  "SARL Agro-Distribution Koubiri": {
    banques: 22700000, caisse: 620000, clients: 4800000, achats: 18600000,
    ventes: 27900000, personnel: 6800000, cnss: 980000, tva: 1150000,
    libelleAchats: "601 Achats engrais et semences",
  },
  "DigitalPay Bénin SARL": {
    banques: 31400000, caisse: 260000, clients: 2900000, achats: 8100000,
    ventes: 41200000, personnel: 12300000, cnss: 1600000, tva: 2400000,
    libelleAchats: "601 Achats équipements et licences",
  },
  "BTP Alibori Construction SARL": {
    banques: 15900000, caisse: 540000, clients: 8700000, achats: 24300000,
    ventes: 32600000, personnel: 9100000, cnss: 1240000, tva: 1480000,
    libelleAchats: "601 Achats matériaux de construction",
  },
  "Pharmacie de l'Unité": {
    banques: 6320000, caisse: 240000, clients: 680000, achats: 12400000,
    ventes: 16850000, personnel: 2750000, cnss: 380000, tva: 510000,
    libelleAchats: "601 Achats médicaments",
  },
};

const JOURNAUX: Record<string, CaisseData> = {
  "ONG Santé Aloma": { rows: [
    ["02/10/2025", "RC001", "Report à nouveau", "220000", ""],
    ["07/10/2025", "RC002", "Dotation caisse banque", "650000", ""],
    ["09/10/2025", "DV014", "Achat consommables médicaux", "", "143000"],
    ["14/10/2025", "DV015", "Transport équipe mobile Kandi", "", "98000"],
    ["21/10/2025", "DV016", "Carburant ambulance", "", "86000"],
  ]},
  "ONG Éducation Pour Tous Nord-Borgou": { rows: [
    ["02/10/2025", "RC001", "Report à nouveau", "150000", ""],
    ["07/10/2025", "RC002", "Dotation caisse banque", "400000", ""],
    ["09/10/2025", "DV014", "Achat fournitures pédagogiques", "", "62000"],
    ["14/10/2025", "DV015", "Transport enseignants Bembèrèkè", "", "75000"],
    ["21/10/2025", "DV016", "Réparation photocopieur", "", "45000"],
  ]},
  "ONG Eau & Assainissement Alibori": { rows: [
    ["02/10/2025", "RC001", "Report à nouveau", "260000", ""],
    ["07/10/2025", "RC002", "Dotation caisse banque", "550000", ""],
    ["09/10/2025", "DV014", "Achat pièces pompes villageoises", "", "131000"],
    ["14/10/2025", "DV015", "Sensibilisation villages Banikoara", "", "88000"],
    ["21/10/2025", "DV016", "Carburant véhicule technique", "", "92000"],
  ]},
  "ONG Femmes Actives de Parakou": { rows: [
    ["02/10/2025", "RC001", "Report à nouveau", "90000", ""],
    ["07/10/2025", "RC002", "Dotation caisse banque", "250000", ""],
    ["09/10/2025", "DV014", "Achat intrants maraîchage", "", "38000"],
    ["14/10/2025", "DV015", "Formation transformatrices de karité", "", "55000"],
    ["21/10/2025", "DV016", "Transport produits au marché", "", "27000"],
  ]},
  "SARL Agro-Distribution Koubiri": { rows: [
    ["02/10/2025", "RC001", "Report à nouveau", "480000", ""],
    ["07/10/2025", "RC002", "Dotation caisse banque", "900000", ""],
    ["09/10/2025", "DV014", "Achat sacs d'engres NPK", "", "312000"],
    ["14/10/2025", "DV015", "Transport marchandises Malanville", "", "185000"],
    ["21/10/2025", "DV016", "Location magasin de stockage", "", "120000"],
  ]},
  "DigitalPay Bénin SARL": { rows: [
    ["02/10/2025", "RC001", "Report à nouveau", "310000", ""],
    ["07/10/2025", "RC002", "Dotation caisse banque", "450000", ""],
    ["09/10/2025", "DV014", "Achat licences logicielles", "", "210000"],
    ["14/10/2025", "DV015", "Commissions agents octobre", "", "163000"],
    ["21/10/2025", "DV016", "Carburant véhicules maintenance", "", "58000"],
  ]},
  "BTP Alibori Construction SARL": { rows: [
    ["02/10/2025", "RC001", "Report à nouveau", "520000", ""],
    ["07/10/2025", "RC002", "Dotation caisse banque", "1100000", ""],
    ["09/10/2025", "DV014", "Achat ciment (300 sacs)", "", "435000"],
    ["14/10/2025", "DV015", "Location pelle mécanique", "", "280000"],
    ["21/10/2025", "DV016", "Carburant engins chantier", "", "196000"],
  ]},
  "Pharmacie de l'Unité": { rows: [
    ["02/10/2025", "RC001", "Report à nouveau", "130000", ""],
    ["07/10/2025", "RC002", "Dotation caisse banque", "300000", ""],
    ["09/10/2025", "DV014", "Achat consommables officine", "", "54000"],
    ["14/10/2025", "DV015", "Électricité réfrigérateur vaccins", "", "42000"],
    ["21/10/2025", "DV016", "Livraison commandes quartiers", "", "31000"],
  ]},
};

// ── Notes de cadrage spécifiques par client ──────────────────
function noteCadrage(client: string, ref: string, secteur: string, enjeux: string, effectif: string): string {
  return `<h1>Note de cadrage — Mission de certification</h1>
<p><strong>Exercice :</strong> 2025-2026 · <strong>Réf. :</strong> ${ref} · <strong>Entité :</strong> ${client}</p>
<h2>1. Contexte et objectifs</h2>
<p>La présente mission vise la certification des états financiers annuels de ${client} conformément au référentiel SYSCOHADA révisé. Le cabinet intervient en qualité de commissaire aux comptes léger, avec remise d'une attestation de sincérité et de régularité destinée aux bailleurs et partenaires financiers. ${secteur} Les enjeux identifiés portent principalement sur ${enjeux} L'effectif audité couvre ${effectif}.</p>
<h2>2. Démarche d'intervention</h2>
<ul>
<li>Prise de connaissance de l'entité et de son contrôle interne ;</li>
<li>Examen des procédures d'enregistrement et de centralisation ;</li>
<li>Sondages sur les principaux cycles (achats, ventes, paie, trésorerie) ;</li>
<li>Examen des événements postérieurs à la clôture.</li>
</ul>
<h2>3. Calendrier</h2>
<p>Travaux de terrain entre le 15 avril et le 30 mai, remise du rapport au plus tard le 30 juin de l'année suivante.</p>`;
}

const NOTES: Record<string, string> = {
  "ONG Santé Aloma": noteCadrage(
    "ONG Santé Aloma", "CERT-2026-011",
    "L'entité opère six centres de santé intégrés dans le Borgou et l'Alibori, financés par des subventions internationales et des recettes de consultations.",
    "la justification des charges de médicaments et la séparation des recettes propres par centre de santé.",
    "quatorze points de service et un personnel de 62 agents"
  ),
  "ONG Éducation Pour Tous Nord-Borgou": noteCadrage(
    "ONG Éducation Pour Tous Nord-Borgou", "CERT-2026-014",
    "L'entité anime des programmes d'alphabétisation et d'appui scolaire dans les communes de Parakou, Tchaourou et N'Dali.",
    "le suivi des manuels scolaires distribués et la comptabilisation des contributions des parents d'élèves.",
    "dix-huit écoles partenaires et une équipe pédagogique de 35 personnes"
  ),
  "ONG Eau & Assainissement Alibori": noteCadrage(
    "ONG Eau & Assainissement Alibori", "CERT-2026-017",
    "L'entité construit et maintient des points d'eau potable dans les villages de l'Alibori, avec un programme d'assainissement financé par deux bailleurs européens.",
    "l'activation des immobilisations de forage et le contrôle des coûts de maintenance des pompes.",
    "trente-deux villages couverts et un budget annuel de 186 millions FCFA"
  ),
  "ONG Femmes Actives de Parakou": noteCadrage(
    "ONG Femmes Actives de Parakou", "CERT-2026-019",
    "L'entité fédère des coopératives de transformation de produits agricoles locales et gère un fonds de microcrédit rotatif entre les membres.",
    "la gouvernance du fonds rotatif et la valorisation des stocks de produits transformés.",
    "neuf coopératives membres représentant environ 420 bénéficiaires"
  ),
};

async function main() {
  const prisma = await getPrisma();

  const sheets = await prisma.document.findMany({
    where: { kind: "SHEET" },
    include: { folder: { include: { client: true } } },
  });
  console.log(`Classeurs à différencier : ${sheets.length}`);

  let balance = 0, journal = 0, cleared = 0;
  for (const doc of sheets) {
    const clientName: string = doc.folder?.client?.name ?? "";
    const b = BALANCES[clientName];
    const j = JOURNAUX[clientName];
    const isBalance = /balance/i.test(doc.name);
    const isJournal = /caisse/i.test(doc.name);

    let content: string | null = null;
    if (isBalance && b) {
      content = JSON.stringify({
        cols: ["RUBRIQUE", "SOLDE DÉBIT", "SOLDE CRÉDIT"],
        rows: [
          ["521 Banques", String(b.banques), ""],
          ["571 Caisse", String(b.caisse), ""],
          ["411 Clients", String(b.clients), ""],
          [b.libelleAchats, String(b.achats), ""],
          ["701 Ventes", "", String(b.ventes)],
          ["661 Charges de personnel", String(b.personnel), ""],
          ["431 CNSS à payer", "", String(b.cnss)],
          ["441 État, TVA à payer", "", String(b.tva)],
        ],
      });
      balance++;
    } else if (isJournal && j) {
      content = JSON.stringify({
        cols: ["DATE", "PIÈCE", "LIBELLÉ", "ENTRÉES", "SORTIES"],
        rows: j.rows,
      });
      journal++;
    }
    if (!content) continue;

    // Ancien fichier supprimé + filePath vidé → régénération propre
    if (doc.filePath) {
      await fs.promises.unlink(path.join(UPLOAD_DIR, path.basename(doc.filePath))).catch(() => {});
      cleared++;
    }
    await prisma.document.update({
      where: { id: doc.id },
      data: { content, filePath: null, mimeType: null, size: null },
    });
    console.log(`  ✔ [${clientName}] ${doc.name}`);
  }

  const docs = await prisma.document.findMany({
    where: { kind: "DOC" },
    include: { folder: { include: { client: true } } },
  });
  console.log(`\nDocuments Word à différencier : ${docs.length}`);

  let notes = 0;
  for (const doc of docs) {
    const clientName: string = doc.folder?.client?.name ?? "";
    const html = NOTES[clientName];
    if (!html) continue;
    if (doc.filePath) {
      await fs.promises.unlink(path.join(UPLOAD_DIR, path.basename(doc.filePath))).catch(() => {});
    }
    await prisma.document.update({
      where: { id: doc.id },
      data: { content: html, filePath: null, mimeType: null, size: null },
    });
    notes++;
    console.log(`  ✔ [${clientName}] ${doc.name}`);
  }

  console.log(
    `\nBilan : ${balance} balances + ${journal} journaux + ${notes} notes différenciés, ${cleared} anciens fichiers supprimés.`
  );
  console.log("→ Lancer : bun scripts/generate-styled-workbooks.ts");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
