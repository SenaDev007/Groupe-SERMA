#!/usr/bin/env node
/**
 * Vérification finale de l'intégrité des fichiers Microsoft générés.
 * - .xlsx : formules réelles, résultats en cache, styles, volets figés, multi-feuilles
 * - .docx : OOXML valide, styles Word, contenu complet
 */
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = '/home/z/my-project/upload/bo-files';

function unzipInspect(filePath) {
  // Use Node's built-in decompression via child_process unzip -l
  const { execSync } = require('child_process');
  const listing = execSync(`unzip -l "${filePath}"`).toString();
  return listing;
}

async function main() {
  const files = fs.readdirSync(UPLOAD_DIR).filter(f => f.endsWith('.xlsx') || f.endsWith('.docx'));
  console.log(`=== ${files.length} fichiers à vérifier ===\n`);

  const ExcelJS = require('exceljs');
  let okCount = 0, issueCount = 0;

  for (const f of files) {
    const full = path.join(UPLOAD_DIR, f);
    const isXlsx = f.endsWith('.xlsx');
    try {
      if (isXlsx) {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.readFile(full);
        const sheets = wb.worksheets;
        let formulaCount = 0;
        let styledCells = 0;
        let mergedCount = 0;
        const formulasFound = [];
        for (const ws of sheets) {
          mergedCount += ws.model.merges ? ws.model.merges.length : 0;
          ws.eachRow({ includeEmpty: true }, (row) => {
            row.eachCell({ includeEmpty: true }, (cell) => {
              if (cell.formula) { formulaCount++; if (formulasFound.length < 5) formulasFound.push(`${ws.name}!${cell.address}: ${cell.formula} => ${cell.result ?? cell.value}`); }
              if (cell.style && cell.style.font && (cell.style.font.bold || cell.style.font.color || (cell.style.fill && cell.style.fill.fgColor && cell.style.fill.fgColor.argb && cell.style.fill.fgColor.argb !== 'FFFFFFFF'))) styledCells++;
            });
          });
        }
        const frozen = sheets.some(ws => ws.views && ws.views.some(v => v.state === 'frozen'));
        const numFmts = new Set();
        for (const ws of sheets) ws.eachRow((row) => row.eachCell((cell) => { if (cell.numFmt) numFmts.add(cell.numFmt); }));
        const valid = formulaCount > 0 && styledCells > 50 && sheets.length >= 1;
        if (valid) okCount++; else issueCount++;
        console.log(`[${valid ? 'OK' : 'ISSUE'}] ${f.slice(0, 80)}`);
        console.log(`   feuilles=${sheets.length} | formules=${formulaCount} | cellules stylées=${styledCells} | fusions=${mergedCount} | voletsFigés=${frozen} | formatsNombre=[${[...numFmts].slice(0,4).join(', ')}]`);
        if (formulasFound.length) console.log(`   ex: ${formulasFound.slice(0, 3).join(' | ')}`);
      } else {
        // .docx — check OOXML structure
        const listing = unzipInspect(full);
        const hasDocument = listing.includes('word/document.xml');
        const hasStyles = listing.includes('word/styles.xml');
        const content = execSyncToString(`unzip -p "${full}" word/document.xml`).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const wordCount = content.split(' ').length;
        const valid = hasDocument && hasStyles && wordCount > 100;
        if (valid) okCount++; else issueCount++;
        console.log(`[${valid ? 'OK' : 'ISSUE'}] ${f.slice(0, 80)}`);
        console.log(`   document.xml=${hasDocument} styles.xml=${hasStyles} | ~${wordCount} mots | début: "${content.slice(0, 120)}"`);
      }
    } catch (e) {
      issueCount++;
      console.log(`[ERREUR] ${f}: ${e.message.slice(0, 150)}`);
    }
    console.log('');
  }

  console.log(`=== BILAN: ${okCount} OK / ${issueCount} problèmes ===`);
}

function execSyncToString(cmd) {
  const { execSync } = require('child_process');
  try { return execSync(cmd, { maxBuffer: 50 * 1024 * 1024 }).toString('utf-8'); }
  catch { return ''; }
}

main().catch(console.error);
