const { Client } = require("pg");
(async () => {
  const c = new Client({ connectionString: process.env.SERMAHUB_DIRECT_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
  await c.connect();
  const r = await c.query('SELECT email, name, role, "passwordHash" FROM "User"');
  for (const u of r.rows) console.log(`- ${u.email} | ${u.name} | ${u.role} | hash: ${u.passwordHash.slice(0, 20)}...`);
  const bcrypt = require("bcryptjs");
  for (const u of r.rows) {
    if (u.email === "salumerhel2036@gmail.com") {
      const ok = await bcrypt.compare("Enagnon.fondé2021", u.passwordHash);
      console.log(`Vérification mot de passe « Enagnon.fondé2021 » : ${ok ? "✔ OK" : "✘ ÉCHEC"}`);
    }
  }
  await c.end();
})().catch(e => { console.error("ERREUR:", e.message); process.exit(1); });
