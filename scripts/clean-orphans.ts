import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
const p = new PrismaClient();
const docs = await p.document.findMany({ where: { filePath: { not: null } }, select: { filePath: true } });
const dbPaths = new Set(docs.map(d => d.filePath!));
const dir = "upload/bo-files";
let removed = 0;
for (const f of fs.readdirSync(dir)) {
  if (!dbPaths.has(f)) {
    fs.unlinkSync(path.join(dir, f));
    removed++;
    console.log("  🗑", f.slice(0, 70));
  }
}
console.log(`${removed} orphelins supprimés — disque = base`);
await p.$disconnect();
