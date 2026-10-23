// Génération des icônes PWA du back-office Groupe SERMA.
// Design : pastille marine #0C193D, S orange #E07F0A (identique au favicon),
// déclinaison maskable avec zone de sécurité 80%.
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";

const OUT = "/home/z/my-project/public/icons";
mkdirSync(OUT, { recursive: true });

const svg = (pad = 0, fullBleed = false) => {
  const size = 512;
  const inner = size - pad * 2;
  const r = fullBleed ? 0 : 88;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" ${fullBleed ? "" : `rx="${r}"`} fill="#0C193D"/>
  ${fullBleed ? "" : `<rect x="${pad + 32}" y="${pad + 32}" width="${inner - 64}" height="${inner - 64}" rx="70" fill="none" stroke="#E07F0A" stroke-width="16" opacity="0.35"/>`}
  <text x="${size / 2}" y="${size / 2 + 130}" font-family="Georgia, 'Times New Roman', serif" font-size="300" font-weight="700" fill="#E07F0A" text-anchor="middle">S</text>
</svg>`;
};

async function gen(name, buf) {
  await sharp(buf).png().toFile(`${OUT}/${name}`);
  console.log(`✔ ${OUT}/${name}`);
}

const regular = Buffer.from(svg(0, false));
const maskable = Buffer.from(svg(56, true)); // fond plein + zone sûre ~78%

await gen("icon-192.png", await sharp(regular).resize(192, 192).png().toBuffer());
await gen("icon-512.png", await sharp(regular).resize(512, 512).png().toBuffer());
await gen("icon-maskable-192.png", await sharp(maskable).resize(192, 192).png().toBuffer());
await gen("icon-maskable-512.png", await sharp(maskable).resize(512, 512).png().toBuffer());

// favicon.ico compatible (32px) pour l'app installée
writeFileSync(`${OUT}/icon-32.png`, await sharp(regular).resize(32, 32).png().toBuffer());
console.log(`✔ ${OUT}/icon-32.png`);
console.log("Terminé.");
