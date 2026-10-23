"use client";

import React from "react";
import { useBoData } from "@/hooks/useBoData";
import { boEngine } from "@/lib/offline/engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";
import {
  Save,
  Printer,
  Download,
  FileText,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo2,
  Redo2,
  ExternalLink,
  FileCode,
} from "lucide-react";
import { cn } from "@/lib/utils";


/** Barre d'outils — données statiques, aucune fermeture sur les refs. */
const TOOLBAR: {
  icon: React.ElementType;
  label: string;
  command?: string;
  block?: "h1" | "h2" | "h3" | "p" | "quote";
}[] = [
  { icon: Undo2, label: "Annuler", command: "undo" },
  { icon: Redo2, label: "Rétablir", command: "redo" },
  { icon: Heading1, label: "Titre 1", block: "h1" },
  { icon: Heading2, label: "Titre 2", block: "h2" },
  { icon: Heading3, label: "Titre 3", block: "h3" },
  { icon: Bold, label: "Gras", command: "bold" },
  { icon: Italic, label: "Italique", command: "italic" },
  { icon: Underline, label: "Souligné", command: "underline" },
  { icon: List, label: "Liste à puces", command: "insertUnorderedList" },
  { icon: ListOrdered, label: "Liste numérotée", command: "insertOrderedList" },
  { icon: Quote, label: "Citation", block: "quote" },
  { icon: AlignLeft, label: "Aligner à gauche", command: "justifyLeft" },
  { icon: AlignCenter, label: "Centrer", command: "justifyCenter" },
  { icon: AlignRight, label: "Aligner à droite", command: "justifyRight" },
];

export function DocumentEditor({
  documentId,
  documentName,
  initialContent,
  initialVersion = 1,
}: {
  documentId: string;
  documentName: string;
  initialContent: string;
  initialVersion?: number;
}) {
  const bo = useBoData();
  const [name, setName] = React.useState(documentName);
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const editorRef = React.useRef<HTMLDivElement>(null);
  const loadedVersion = React.useRef(initialVersion);

  // Contenu initial : version locale (IndexedDB) si plus récente que le rendu
  // serveur en cache (fonctionnement hors-ligne), sinon contenu serveur.
  const storeDoc = bo.snapshot?.documents.find((d) => d.id === documentId);
  const effectiveContent =
    storeDoc && storeDoc.content && (storeDoc.version ?? 0) > loadedVersion.current
      ? storeDoc.content
      : initialContent;

  React.useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = effectiveContent;
      if (storeDoc && (storeDoc.version ?? 0) > loadedVersion.current) {
        loadedVersion.current = storeDoc.version;
        setName(storeDoc.name);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(command: string, value?: string) {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    setDirty(true);
  }

  function applyBlock(block: "h1" | "h2" | "h3" | "p" | "quote") {
    const tag = block === "quote" ? "blockquote" : block === "p" ? "p" : block;
    exec("formatBlock", `<${tag}>`);
  }

  function onTool(tool: (typeof TOOLBAR)[number]) {
    if (tool.block) applyBlock(tool.block);
    else if (tool.command) exec(tool.command);
  }

  // Sauvegarde — locale immédiate (IndexedDB) + synchronisation automatique
  // vers la base distante dès que la connexion est disponible.
  async function save() {
    const content = editorRef.current?.innerHTML ?? "";
    setSaving(true);
    try {
      await boEngine.mutate({
        id: boEngine.newId("mut"),
        type: "document.saveContent",
        createdAt: new Date().toISOString(),
        payload: { id: documentId, name, content },
      });
      loadedVersion.current += 1;
      setDirty(false);
      const heure = new Date().toLocaleTimeString("fr-FR");
      if (navigator.onLine) {
        toast.success(`Enregistré à ${heure}`, { description: name });
      } else {
        toast.success(`Enregistré localement à ${heure}`, {
          description: "Hors-ligne — synchronisation automatique dès le retour de la connexion.",
        });
      }
    } catch {
      toast.error("Échec de l’enregistrement local.");
    } finally {
      setSaving(false);
    }
  }

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [name]);

  function printPdf() {
    const content = editorRef.current?.innerHTML ?? "";
    const win = window.open("", "_blank", "width=1000,height=700");
    if (!win) {
      toast.error("Autorisez les fenêtres pop-up pour générer le PDF.");
      return;
    }
    win.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${escapeHtml(name)}</title>
<style>
  @page { margin: 22mm 18mm; }
  body { font-family: Georgia, 'Times New Roman', serif; color:#1a1a2e; line-height:1.8; padding:0; margin:0; }
  .doc { max-width: 720px; margin: 0 auto; }
  h1 { font-size:24px; color:#0C193D; margin:1.2rem 0 .6rem; }
  h2 { font-size:19px; color:#0C193D; margin:1rem 0 .5rem; }
  h3 { font-size:16px; color:#112046; margin:.9rem 0 .4rem; }
  p { margin:.55rem 0; }
  ul, ol { margin:.6rem 0 .6rem 1.5rem; }
  ul { list-style:disc; } ol { list-style:decimal; }
  li { margin:.3rem 0; }
  blockquote { border-left:3px solid #E07F0A; padding-left:1rem; color:#4A4E69; font-style:italic; margin:1rem 0; }
  header { border-bottom:2px solid #E07F0A; padding-bottom:10px; margin-bottom:24px; }
  header .brand { font-family:Arial, sans-serif; font-size:13px; font-weight:bold; color:#0C193D; }
  header .brand span { color:#E07F0A; }
  header .doc-title { font-family:Georgia, serif; font-size:20px; color:#0C193D; margin-top:6px; }
  footer { margin-top:36px; border-top:1px solid #d8dbe6; padding-top:10px; color:#4A4E69; font-size:10px; font-family:Arial, sans-serif; }
</style></head><body>
<div class="doc">
  <header>
    <div class="brand">CABINET <span>SERMA</span> — Document de travail</div>
    <div class="doc-title">${escapeHtml(name)}</div>
  </header>
  ${content}
  <footer>Cabinet SERMA SARL · Zongo 2, axe BENI CHIC – PRESIDO, Parakou, Bénin — Confidentiel · Généré le ${new Date().toLocaleDateString("fr-FR")}</footer>
</div>
<script>window.onload = () => window.print();</script>
</body></html>`);
    win.document.close();
  }

  function exportWord() {
    const content = editorRef.current?.innerHTML ?? "";
    const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40" lang="fr"><head><meta charset="utf-8">
<title>${escapeHtml(name)}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>
  body { font-family:'Calibri', Georgia, serif; font-size:11.5pt; color:#1a1a2e; line-height:1.6; }
  h1 { color:#0C193D; font-size:18pt; } h2 { color:#0C193D; font-size:15pt; } h3 { color:#112046; font-size:13pt; }
  blockquote { border-left:3pt solid #E07F0A; padding-left:10pt; color:#4A4E69; font-style:italic; }
  .doc-header { border-bottom:2pt solid #E07F0A; padding-bottom:8pt; margin-bottom:16pt; }
  .doc-header .brand { font-weight:bold; color:#0C193D; font-size:12pt; }
  .doc-header .brand span { color:#E07F0A; }
</style></head><body>
<div class="doc-header"><div class="brand">CABINET <span>SERMA</span> — ${escapeHtml(name)}</div></div>
${content}
</body></html>`;
    const blob = new Blob(["\uFEFF" + html], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/[\/\\:*\?"<>|]/g, "_")}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Document Word généré", {
      description: "S'ouvre dans Microsoft Word, Google Docs et LibreOffice.",
    });
  }

  function exportHtml() {
    const content = editorRef.current?.innerHTML ?? "";
    const blob = new Blob([`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${escapeHtml(name)}</title></head><body>${content}</body></html>`], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/[\/\\:*\?"<>|]/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }


  return (
    <div className="flex flex-col gap-4">
      <Toaster richColors position="top-right" />

      {/* Barre d'outils */}
      <div className="bo-no-print rounded-xl border border-marine-profond/[0.07] bg-white shadow-[0_2px_12px_rgba(12,25,61,0.05)] p-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 mr-2">
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-logo/10 text-orange-contrast shrink-0">
            <FileText className="w-[18px] h-[18px]" aria-hidden />
          </span>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setDirty(true);
            }}
            className="h-9 w-56 font-semibold text-marine-profond border-marine-profond/15 focus-visible:ring-orange-logo/50"
            aria-label="Nom du document"
          />
          {dirty && <span className="text-[11px] font-bold text-orange-contrast">•</span>}
        </div>

        <div className="w-px h-6 bg-marine-profond/10 mx-1" aria-hidden />

        <Button onClick={save} disabled={saving} size="sm" className="h-9 bg-orange-logo hover:bg-orange-sature text-white shadow-orange">
          <Save className="w-4 h-4 mr-1.5" aria-hidden />
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button onClick={printPdf} variant="outline" size="sm" className="h-9 border-marine-profond/20 text-marine-profond hover:bg-marine-profond/[0.04]">
          <Printer className="w-4 h-4 mr-1.5" aria-hidden />
          PDF
        </Button>
        <Button onClick={exportWord} variant="outline" size="sm" className="h-9 border-marine-profond/20 text-marine-profond hover:bg-marine-profond/[0.04]">
          <Download className="w-4 h-4 mr-1.5" aria-hidden />
          Word (.doc)
        </Button>
        <Button onClick={exportHtml} variant="outline" size="sm" className="h-9 border-marine-profond/20 text-marine-profond hover:bg-marine-profond/[0.04]">
          <FileCode className="w-4 h-4 mr-1.5" aria-hidden />
          HTML
        </Button>

        <a
          href="https://docs.google.com/document/create"
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-gris-texte hover:text-marine-profond transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" aria-hidden />
          Ouvrir Google Docs
        </a>
      </div>

      {/* Barre de formatage */}
      <div
        className="bo-no-print flex flex-wrap items-center gap-0.5 rounded-xl border border-marine-profond/[0.07] bg-gris-bleute/60 px-2 py-1.5 shadow-[0_2px_12px_rgba(12,25,61,0.05)]"
        role="toolbar"
        aria-label="Mise en forme"
      >
        {TOOLBAR.map((tool, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onTool(tool)}
            title={tool.label}
            aria-label={tool.label}
            onMouseDown={(e) => e.preventDefault()}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg text-marine-profond/70 hover:text-marine-profond hover:bg-white hover:shadow-sm transition-colors",
              (tool.label === "Titre 1" || tool.label === "Titre 2" || tool.label === "Titre 3") && " font-black"
            )}
          >
            {React.createElement(tool.icon, { className: "w-4 h-4", "aria-hidden": true })}
          </button>
        ))}
        <span className="ml-auto pr-2 text-[11px] text-gris-texte hidden sm:block">
          Ctrl+S pour enregistrer · Ctrl+B gras · Ctrl+I italique
        </span>
      </div>

      {/* Zone d'édition — page A4-like */}
      <div className="rounded-xl border border-marine-profond/[0.07] bg-white shadow-[0_2px_12px_rgba(12,25,61,0.05)] p-4 sm:p-8">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={`Contenu du document ${name}`}
          onInput={() => setDirty(true)}
          onBlur={() => setDirty(true)}
          className="bo-doc-content min-h-[58vh] max-w-3xl mx-auto outline-none px-2 sm:px-6 py-4 text-[15px] text-marine-profond/90 leading-[1.75] focus:outline-none"
        />
      </div>

      <p className="bo-no-print text-[11.5px] text-gris-texte">
        Document riche : titres, listes, citations, alignements. Export PDF prêt à
        envoyer, export Word compatible Microsoft Word et Google Docs.
      </p>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
