/**
 * VRAIS DOCUMENTS WORD (.docx — format OOXML Microsoft).
 *
 * Deux sens, pour un round-trip complet comme dans Microsoft Word :
 *   • htmlToDocxBytes() : contenu HTML de l'éditeur → fichier .docx réel
 *     (paragraphes, titres avec styles, gras/italique/souligné/barré,
 *     listes à puces et numérotées, citations, tableaux, liens, images
 *     encodées en base64). La conversion .docx → HTML se fait côté serveur
 *     (src/lib/docx/server.ts — mammoth).
 *
 * Le fichier produit s'ouvre exactement comme un document créé dans
 * Microsoft Word (marges, styles de titres, numérotation des listes,
 * tableaux avec en-têtes).
 *
 * La bibliothèque « docx » (compatible navigateur) est chargée
 * paresseusement : elle n'entre dans le bundle client qu'au premier
 * export ou enregistrement — les pages restent légères.
 */

/** Bibliothèque docx — chargée à la demande (bundle client allégé). */
type DocxLib = typeof import("docx");
let D: DocxLib | null = null;
async function ensureDocx(): Promise<DocxLib> {
  if (!D) D = await import("docx");
  return D;
}
function dx(): DocxLib {
  if (!D) throw new Error("docx non chargé (ensureDocx manquant)");
  return D;
}

// Valeurs d'enum docx (constantes de chaînes officielles — vérifiées)
type AlignValue = DocxLib["AlignmentType"][keyof DocxLib["AlignmentType"]];
type HeadingValue = DocxLib["HeadingLevel"][keyof DocxLib["HeadingLevel"]];

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// ─────────────────────────────────────────────────────────────
// HTML → .docx
// ─────────────────────────────────────────────────────────────

interface RunStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
}

/** Convertit du HTML (contenu de l'éditeur) en octets .docx réels. */
export async function htmlToDocxBytes(html: string, title: string): Promise<Uint8Array> {
  await ensureDocx();
  const doc = new (dx().Document)({
    creator: "Cabinet SERMA — Back-office",
    title,
    description: "Document de travail Cabinet SERMA",
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 23 }, // 11,5 pt
          paragraph: { spacing: { line: 300, after: 120 } },
        },
        heading1: {
          run: { font: "Calibri", size: 36, bold: true, color: "0C193D" },
          paragraph: { spacing: { before: 320, after: 160 } },
        },
        heading2: {
          run: { font: "Calibri", size: 30, bold: true, color: "0C193D" },
          paragraph: { spacing: { before: 280, after: 140 } },
        },
        heading3: {
          run: { font: "Calibri", size: 26, bold: true, color: "112046" },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
        heading4: {
          run: { font: "Calibri", size: 24, bold: true, color: "112046" },
          paragraph: { spacing: { before: 220, after: 110 } },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: "serma-bullets",
          levels: [
            {
              level: 0,
              format: "bullet" as DocxLib["LevelFormat"]["BULLET"],
              text: "•",
              alignment: "start" as AlignValue,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
            {
              level: 1,
              format: "bullet" as DocxLib["LevelFormat"]["BULLET"],
              text: "◦",
              alignment: "start" as AlignValue,
              style: { paragraph: { indent: { left: 1440, hanging: 360 } } },
            },
            {
              level: 2,
              format: "bullet" as DocxLib["LevelFormat"]["BULLET"],
              text: "▪",
              alignment: "start" as AlignValue,
              style: { paragraph: { indent: { left: 2160, hanging: 360 } } },
            },
          ],
        },
        {
          reference: "serma-numbers",
          levels: [
            {
              level: 0,
              format: "decimal" as DocxLib["LevelFormat"]["DECIMAL"],
              text: "%1.",
              alignment: "start" as AlignValue,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
            {
              level: 1,
              format: "lowerLetter" as DocxLib["LevelFormat"]["LOWER_LETTER"],
              text: "%2)",
              alignment: "start" as AlignValue,
              style: { paragraph: { indent: { left: 1440, hanging: 360 } } },
            },
            {
              level: 2,
              format: "lowerRoman" as DocxLib["LevelFormat"]["LOWER_ROMAN"],
              text: "%3.",
              alignment: "start" as AlignValue,
              style: { paragraph: { indent: { left: 2160, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 900, right: 900 },
          },
        },
        children: htmlToParagraphs(html),
      },
    ],
  });

  const blob = await dx().Packer.toBlob(doc);
  return new Uint8Array(await blob.arrayBuffer());
}

/** Convertit du HTML en blob .docx (téléchargement direct). */
export async function htmlToDocxBlob(html: string, title: string): Promise<Blob> {
  const bytes = await htmlToDocxBytes(html, title);
  return new Blob([bytes as BlobPart], { type: DOCX_MIME });
}

// ── Analyse du HTML (DOMParser navigateur, injectable pour Node) ──

let domParserFactory: (() => DOMParser) | null = null;

/** Injecte un DOMParser alternatif (Node : @xmldom/xmldom). */
export function setDocxDomParser(factory: () => DOMParser): void {
  domParserFactory = factory;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseHtml(html: string): any {
  const full = `<!DOCTYPE html><html><body>${html}</body></html>`;
  const parser = domParserFactory ? domParserFactory() : new DOMParser();
  const dom = parser.parseFromString(full, "text/html");
  return dom.documentElement.getElementsByTagName("body")[0] ?? dom.body;
}

/** Texte = nodeType 3, élément = nodeType 1 (constantes DOM universelles). */
const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

/** Descendants par tag (remplace querySelectorAll, marche aussi sous xmldom). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function descendantsByTag(el: any, tag: string): any[] {
  const out: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visit = (node: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kids = node.children ?? Array.from(node.childNodes ?? []).filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (n: any) => n.nodeType === ELEMENT_NODE
    );
    for (const child of kids) {
      const name = String(child.tagName ?? "").toLowerCase();
      if (name === tag) out.push(child);
      visit(child);
    }
  };
  visit(el);
  return out;
}

const BLOCK_TAGS = new Set([
  "p", "div", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "table", "pre", "hr", "br",
]);

const ALIGN_MAP: Record<string, AlignValue> = {
  left: "left",
  start: "left",
  center: "center",
  right: "right",
  end: "right",
  justify: "both",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function alignOf(el: any): AlignValue | undefined {
  const style = el.style;
  const inline = typeof style?.textAlign === "string" ? style.textAlign : undefined;
  if (inline && ALIGN_MAP[inline]) return ALIGN_MAP[inline];
  const cls = el.getAttribute?.("data-align");
  if (cls && ALIGN_MAP[cls]) return ALIGN_MAP[cls];
  return undefined;
}

/** Convertit les nœuds de bloc HTML en paragraphes/tableaux .docx. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function htmlToParagraphs(html: string): any[] {
  const body = parseHtml(html);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: any[] = [];
  walkBlocks(body, out, { bulletsDepth: -1, numbersDepth: -1 });
  if (out.length === 0) out.push(new (dx().Paragraph)({ children: [new (dx().TextRun)("")] }));
  return out;
}

interface ListCtx {
  bulletsDepth: number;
  numbersDepth: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function walkBlocks(parent: any, out: any[], list: ListCtx): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const node of Array.from(parent.childNodes ?? []) as any[]) {
    if (node.nodeType === TEXT_NODE) {
      const text = (node.textContent ?? "").replace(/\s+/g, " ");
      if (text.trim()) out.push(new (dx().Paragraph)({ children: [new (dx().TextRun)(text)] }));
      continue;
    }
    if (node.nodeType !== ELEMENT_NODE) continue;
    const el = node;
    const tag = String(el.tagName ?? "").toLowerCase();

    switch (tag) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6": {
        const HEADING_BY_TAG: Record<string, HeadingValue> = {
          h1: "Heading1",
          h2: "Heading2",
          h3: "Heading3",
          h4: "Heading4",
          h5: "Heading5",
          h6: "Heading6",
        };
        const heading = HEADING_BY_TAG[tag];
        out.push(
          new (dx().Paragraph)({
            heading,
            alignment: alignOf(el),
            children: collectRuns(el, {}),
          })
        );
        break;
      }
      case "p": {
        if (descendantsByTag(el, "img").length > 0) {
          pushImages(el, out, alignOf(el));
          break;
        }
        out.push(
          new (dx().Paragraph)({
            alignment: alignOf(el),
            children: collectRuns(el, {}),
          })
        );
        break;
      }
      case "blockquote": {
        out.push(...splitBlockquote(el));
        break;
      }
      case "ul": {
        list.bulletsDepth += 1;
        walkBlocks(el, out, list);
        list.bulletsDepth -= 1;
        break;
      }
      case "ol": {
        list.numbersDepth += 1;
        walkBlocks(el, out, list);
        list.numbersDepth -= 1;
        break;
      }
      case "li": {
        // contenu inline direct du <li> (hors sous-listes)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const runs: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const sub of Array.from(el.childNodes ?? []) as any[]) {
          const subTag = String(sub.tagName ?? "").toLowerCase();
          if (subTag === "ul" || subTag === "ol") continue;
          if (sub.nodeType === TEXT_NODE) {
            const text = (sub.textContent ?? "").replace(/\u00A0/g, " ");
            if (text.trim()) runs.push(new (dx().TextRun)({ text }));
          } else if (sub.nodeType === ELEMENT_NODE) {
            walkInline(sub, {}, runs);
          }
        }
        const numbering =
          list.numbersDepth >= 0 && list.bulletsDepth < 0
            ? { reference: "serma-numbers", level: Math.min(list.numbersDepth, 2) }
            : { reference: "serma-bullets", level: Math.max(0, Math.min(list.bulletsDepth, 2)) };
        out.push(
          new (dx().Paragraph)({
            numbering,
            alignment: alignOf(el),
            children: runs.length > 0 ? runs : [new (dx().TextRun)("")],
          })
        );
        // sous-listes imbriquées
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const sub of Array.from(el.children ?? []) as any[]) {
          const subTag = String(sub.tagName ?? "").toLowerCase();
          if (subTag === "ul") {
            list.bulletsDepth += 1;
            walkBlocks(sub, out, list);
            list.bulletsDepth -= 1;
          } else if (subTag === "ol") {
            list.numbersDepth += 1;
            walkBlocks(sub, out, list);
            list.numbersDepth -= 1;
          }
        }
        break;
      }
      case "table": {
        const table = htmlTableToDocx(el);
        if (table) out.push(table);
        out.push(new (dx().Paragraph)({ children: [new (dx().TextRun)("")] }));
        break;
      }
      case "pre": {
        const text = el.textContent ?? "";
        for (const line of text.split("\n")) {
          out.push(
            new (dx().Paragraph)({
              children: [new (dx().TextRun)({ text: line, font: "Consolas", size: 19 })],
            })
          );
        }
        break;
      }
      case "hr": {
        out.push(
          new (dx().Paragraph)({
            border: { bottom: { style: "single", size: 6, color: "D8DBE6" } },
            children: [new (dx().TextRun)("")],
          })
        );
        break;
      }
      case "br": {
        out.push(new (dx().Paragraph)({ children: [new (dx().TextRun)("")] }));
        break;
      }
      default: {
        if (BLOCK_TAGS.has(tag)) {
          walkBlocks(el, out, list);
        } else {
          const runs = collectRuns(el, {});
          if (runs.length > 0) out.push(new (dx().Paragraph)({ children: runs }));
        }
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function splitBlockquote(el: any): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pushQuote = (runs: any[]) => {
    out.push(
      new (dx().Paragraph)({
        indent: { left: 567 }, // 1 cm
        border: { left: { style: "single", size: 18, color: "E07F0A" } },
        children: runs.length > 0 ? runs : [new (dx().TextRun)("")],
      })
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const node of Array.from(el.childNodes ?? []) as any[]) {
    if (node.nodeType === TEXT_NODE) {
      const text = (node.textContent ?? "").trim();
      if (text) pushQuote([new (dx().TextRun)({ text, italics: true, color: "4A4E69" })]);
      continue;
    }
    if (node.nodeType !== ELEMENT_NODE) continue;
    const child = node;
    if (String(child.tagName ?? "").toLowerCase() === "p") {
      pushQuote(collectRuns(child, { italic: true, color: "4A4E69" }));
    } else if (BLOCK_TAGS.has(String(child.tagName ?? "").toLowerCase())) {
      walkBlocks(child, out, { bulletsDepth: -1, numbersDepth: -1 });
    } else {
      const text = child.textContent?.trim() ?? "";
      if (text) pushQuote([new (dx().TextRun)({ text, italics: true, color: "4A4E69" })]);
    }
  }
  if (out.length === 0) {
    const text = el.textContent?.trim() ?? "";
    pushQuote([new (dx().TextRun)({ text, italics: true, color: "4A4E69" })]);
  }
  return out;
}

// ── Runs inline ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectRuns(el: any, inherited: RunStyle & { color?: string }): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runs: any[] = [];
  walkInline(el, inherited, runs);
  return runs;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function walkInline(el: any, style: RunStyle & { color?: string }, out: any[]): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const node of Array.from(el.childNodes ?? []) as any[]) {
    if (node.nodeType === TEXT_NODE) {
      const text = (node.textContent ?? "").replace(/\u00A0/g, " ");
      if (text.length === 0) continue;
      out.push(
        new (dx().TextRun)({
          text,
          bold: style.bold,
          italics: style.italic,
          underline: style.underline ? {} : undefined,
          strike: style.strike,
          color: style.color,
        })
      );
      continue;
    }
    if (node.nodeType !== ELEMENT_NODE) continue;
    const child = node;
    const tag = String(child.tagName ?? "").toLowerCase();

    if (tag === "br") {
      out.push(new (dx().TextRun)({ break: 1 }));
      continue;
    }
    if (tag === "img") {
      const image = imageRunOf(child);
      if (image) out.push(image);
      continue;
    }
    if (tag === "a") {
      const href = child.getAttribute?.("href") ?? "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const runs: any[] = [];
      walkInline(child, { ...style, underline: true, color: "0563C1" }, runs);
      if (href && runs.length > 0) {
        out.push(new (dx().ExternalHyperlink)({ children: runs, link: href }));
      } else {
        out.push(...runs);
      }
      continue;
    }

    const next: RunStyle & { color?: string } = { ...style };
    if (tag === "b" || tag === "strong") next.bold = true;
    if (tag === "i" || tag === "em") next.italic = true;
    if (tag === "u") next.underline = true;
    if (tag === "s" || tag === "strike" || tag === "del") next.strike = true;
    if (tag === "span" || tag === "font") {
      const c = cssColorOf(child);
      if (c) next.color = c;
    }
    walkInline(child, next, out);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cssColorOf(el: any): string | undefined {
  const inline = typeof el.style?.color === "string" ? el.style.color : undefined;
  if (inline) return cssColorToHex(inline);
  return undefined;
}

function cssColorToHex(css: string): string | undefined {
  const m = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(css.trim());
  if (m) {
    const hex = m[1].length === 3
      ? m[1].split("").map((ch) => ch + ch).join("")
      : m[1];
    return hex.toUpperCase();
  }
  const mRgb = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/.exec(css);
  if (mRgb) {
    return [mRgb[1], mRgb[2], mRgb[3]]
      .map((n) => Math.max(0, Math.min(255, Number(n))).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  }
  return undefined;
}

// ── Images ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function imageRunOf(img: any): any | null {
  const src = img.getAttribute?.("src") ?? "";
  const m = /^data:image\/(png|jpe?g|gif|bmp|svg|webp);base64,(.+)$/i.exec(src);
  if (!m) return null;
  const rawType = m[1].toLowerCase();
  // webp n'est pas supporté nativement par Word → PNG de repli
  const type = rawType === "jpg" ? "jpg" : rawType === "webp" ? "png" : rawType;
  const data = m[2];
  const w = Number(img.getAttribute?.("width") || 0) || 480;
  const h = Number(img.getAttribute?.("height") || 0) || 320;
  const maxW = 600;
  const scale = w > maxW ? maxW / w : 1;
  try {
    const bytes = Uint8Array.from(atob(data), (ch) => ch.charCodeAt(0));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageOptions: any = {
      type,
      data: bytes,
      transformation: {
        width: Math.round(w * scale * 0.75),
        height: Math.round(h * scale * 0.75),
      },
    };
    return new (dx().ImageRun)(imageOptions);
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pushImages(el: any, out: any[], alignment?: AlignValue): void {
  for (const img of descendantsByTag(el, "img")) {
    const run = imageRunOf(img);
    if (run) out.push(new (dx().Paragraph)({ alignment, children: [run] }));
  }
}

// ── Tableaux ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function htmlTableToDocx(tableEl: any): any | null {
  const rows = descendantsByTag(tableEl, "tr");
  if (rows.length === 0) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docxRows: any[] = rows.map((tr: any, rIdx: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cells = Array.from(tr.children ?? []).filter((c: any) =>
      ["td", "th"].includes(String(c.tagName ?? "").toLowerCase())
    );
    const isHeader =
      rIdx === 0 &&
      (cells.some((c: any) => String(c.tagName ?? "").toLowerCase() === "th") ||
        descendantsByTag(tableEl, "th").length > 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docxCells = cells.map((cell: any) => {
      const runs = collectRuns(cell, {});
      const th = String(cell.tagName ?? "").toLowerCase() === "th";
      const shade = th || isHeader ? "0C193D" : rIdx % 2 === 0 ? undefined : "F4F6FB";
      return new (dx().TableCell)({
        shading: shade
          ? { type: "clear" as DocxLib["ShadingType"]["CLEAR"], color: "auto", fill: shade }
          : undefined,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [
          new (dx().Paragraph)({
            children: runs.length > 0 ? runs : [new (dx().TextRun)("")],
          }),
        ],
      });
    });

    return new (dx().TableRow)({
      tableHeader: isHeader,
      children:
        docxCells.length > 0
          ? docxCells
          : [new (dx().TableCell)({ children: [new (dx().Paragraph)("")] })],
    });
  });

  return new (dx().Table)({
    width: { size: 100, type: "pct" as DocxLib["WidthType"]["PERCENTAGE"] },
    rows: docxRows,
  });
}

export { DOCX_MIME };
