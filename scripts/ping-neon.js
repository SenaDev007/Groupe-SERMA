// Test de connectivité Neon (PostgreSQL) — échec rapide avant migration
const { Client } = require("pg");

const url = process.argv[2];
if (!url) { console.error("URL manquante"); process.exit(1); }

(async () => {
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
  try {
    await client.connect();
    const r = await client.query("SELECT current_database() AS db, version() AS v");
    console.log("✔ Connecté à :", r.rows[0].db);
    console.log("  ", r.rows[0].v.split(",")[0]);
    const t = await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public' LIMIT 5");
    console.log("  Tables existantes :", t.rows.map((x) => x.tablename).join(", ") || "(aucune)");
    await client.end();
  } catch (e) {
    console.error("✘ Échec connexion :", e.message);
    process.exit(1);
  }
})();
