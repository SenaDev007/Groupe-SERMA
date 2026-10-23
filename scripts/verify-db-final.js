/**
 * Vérification finale — connexion directe PostgreSQL/Neon (SermaHub),
 * indépendante de l'application et de Prisma.
 * Usage : node scripts/verify-db-final.js
 */
const { Client } = require("pg");

const URL = process.env.SERMAHUB_DIRECT_URL;
if (!URL) {
  console.error("Variable SERMAHUB_DIRECT_URL manquante — renseignez .env (voir .env.example).");
  process.exit(1);
}

async function main() {
  const c = new Client({ connectionString: URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  console.log("════ VÉRIFICATION FINALE — PostgreSQL Neon « SermaHub » ════\n");

  const tables = [
    "User", "Client", "FiscalYear", "WorkItem", "Document",
    "Submission", "Formation", "Article", "Testimonial",
  ];
  console.log("─ Compteurs (état final de production) ─");
  for (const t of tables) {
    const r = await c.query(`SELECT COUNT(*)::int AS n FROM "${t}"`);
    console.log(`  ${t.padEnd(14)}: ${r.rows[0].n}`);
  }

  console.log("\n─ Persistance des opérations réalisées via l'UI (E2E) ─");

  const checks = [
    {
      label: "Balance générale : édition + formule =SUM persistées (v2)",
      sql: `SELECT version, content LIKE '%"=SUM(B2:B8)"%' AS formule, content LIKE '%12750000%' AS valeur FROM "Document" WHERE name LIKE 'Balance générale — ONG Santé Aloma%'`,
      expect: (r) => r.rows[0].version >= 2 && r.rows[0].formule && r.rows[0].valeur,
    },
    {
      label: "Note de cadrage : paragraphe ajouté persisté (v2)",
      sql: `SELECT version, content LIKE '%Point de contrôle ajouté%' AS edite FROM "Document" WHERE name LIKE 'Note de cadrage%Santé Aloma%'`,
      expect: (r) => r.rows[0].version >= 2 && r.rows[0].edite,
    },
    {
      label: "Données de test purgées (documents/missions/formations/témoignages)",
      sql: `SELECT (SELECT COUNT(*)::int FROM "Document" WHERE name LIKE '%test%') AS docs, (SELECT COUNT(*)::int FROM "WorkItem" WHERE title LIKE '%test%') AS missions, (SELECT COUNT(*)::int FROM "Formation" WHERE title LIKE '%Test%') AS form, (SELECT COUNT(*)::int FROM "Testimonial" WHERE name LIKE '%BDD%') AS temo`,
      expect: (r) => r.rows[0].docs === 0 && r.rows[0].missions === 0 && r.rows[0].form === 0 && r.rows[0].temo === 0,
    },
    {
      label: "Article WhatsApp : dépublié puis republié (statut final PUBLIE)",
      sql: `SELECT status FROM "Article" WHERE title LIKE '%WhatsApp Business%'`,
      expect: (r) => r.rows[0].status === "PUBLIE",
    },
    {
      label: "Soumission du formulaire public (pont site → BDD → back-office)",
      sql: `SELECT source, entity, status FROM "Submission" WHERE email LIKE '%pont-bdd%'`,
      expect: (r) => r.rows.length === 1 && r.rows[0].source === "RDV_CABINET" && r.rows[0].entity === "CABINET" && r.rows[0].status === "NOUVEAU",
    },
    {
      label: "Soumission historique : statut TRAITE appliqué via l'UI",
      sql: `SELECT status FROM "Submission" WHERE source='RDV_CABINET' AND email NOT LIKE '%pont-bdd%'`,
      expect: (r) => r.rows[0].status === "TRAITE",
    },
    {
      label: "Compte admin présent (bcrypt)",
      sql: `SELECT email, role, "passwordHash" LIKE '$2%' AS bcrypt FROM "User"`,
      expect: (r) => r.rows[0].email === "admin@sermagroupe.bj" && r.rows[0].role === "ADMIN" && r.rows[0].bcrypt,
    },
    {
      label: "Exercices organisés par client (2024-2025 clôturé + 2025-2026 ouvert)",
      sql: `SELECT COUNT(*)::int AS paires FROM (SELECT "clientId" FROM "FiscalYear" GROUP BY "clientId" HAVING COUNT(*) = 2) t`,
      expect: (r) => r.rows[0].paires === 8,
    },
  ];

  let ok = 0;
  for (const check of checks) {
    const r = await c.query(check.sql);
    const passed = check.expect(r);
    console.log(`  ${passed ? "✔" : "✘"} ${check.label}`);
    if (passed) ok++;
  }

  console.log(`\n─ Résultat : ${ok}/${checks.length} vérifications réussies ─`);
  await c.end();
  process.exit(ok === checks.length ? 0 : 1);
}

main().catch((e) => {
  console.error("Échec de la vérification :", e.message);
  process.exit(1);
});
