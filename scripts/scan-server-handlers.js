#!/usr/bin/env node
/**
 * Scan des Server Components (page/layout) contenant des handlers d'événement
 * inline (onClick, onChange, onSubmit…) — cause d'échec de build Next.js
 * (« Event handlers cannot be passed to Client Component props »).
 */
const fs = require("fs");
const path = require("path");

const ROOT = "/home/z/my-project/src/app";
const HANDLERS = /\bon[A-Z][A-Za-z]+\s*=/;
const CLIENT = /^\s*["']use client["']/;

let issues = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!/^(page|layout|not-found|error|loading|template)\.(tsx|jsx|ts|js)$/.test(entry.name)) continue;
    const src = fs.readFileSync(full, "utf8");
    const isClient = CLIENT.test(src.split("\n")[0] || "") || CLIENT.test(src.slice(0, 400));
    if (!isClient && HANDLERS.test(src)) {
      const line = src.split("\n").findIndex((l) => HANDLERS.test(l)) + 1;
      const handler = src.match(HANDLERS)[0].replace("=", "").trim();
      console.log(`✘ ${path.relative(ROOT, full)}:${line} — Server Component avec ${handler} inline`);
      issues++;
    }
  }
}

walk(ROOT);
if (!issues) console.log("✔ Aucun Server Component avec handler inline dans src/app");
process.exit(issues ? 1 : 0);
