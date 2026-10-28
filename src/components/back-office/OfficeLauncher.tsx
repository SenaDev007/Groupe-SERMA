"use client";

/**
 * OUVERTURE DES VRAIS FICHIERS MICROSOFT — Cabinet SERMA.
 *
 * Intégration du VRAI Microsoft Office, exactement comme OneDrive /
 * SharePoint avec « Ouvrir dans l'application » :
 *
 *   1. « Ouvrir dans Microsoft Excel / Word » : lance l'application Office
 *      DE BUREAU via les schémas d'URI officiels de Microsoft
 *      (ms-excel:ofe|u|…, ms-word:ofe|u|…) avec une URL signée — Excel /
 *      Word s'ouvre avec le fichier réel et l'intégralité de ses
 *      fonctionnalités (formules, tableaux croisés, styles, VBA…).
 *   2. « Télécharger » : le vrai fichier .xlsx / .docx, ouvrable dans
 *      Microsoft Office sur n'importe quel appareil.
 *   3. « Mettre à jour la version » : après modification et enregistrement
 *      dans Microsoft Excel / Word, la nouvelle version du fichier est
 *      renvoyée ici (version N+1) — aller-retour complet, comme OneDrive.
 */

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { boEngine } from "@/lib/offline/engine";
import { blobPut } from "@/lib/offline/idb";
import { Button } from "@/components/ui/button";
import { formatDateFr, formatBytes } from "@/lib/back-office/constants";
import {
  ExternalLink,
  Download,
  RefreshCw,
  Loader2,
  FileCheck2,
  Info,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Icônes officielles Microsoft Office (reconnaissance immédiate)
// ─────────────────────────────────────────────────────────────

function ExcelIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#21A366"
        d="M26 4H8a2 2 0 0 0-2 2v36a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V12L26 4z"
      />
      <path fill="#107C41" d="M26 4l8 8h-6a2 2 0 0 1-2-2V4z" />
      <path
        fill="#FFFFFF"
        d="M11.5 16.5h11.2l-.9 3.1h-3.4l-1.2 4.3h3.1l-.9 3.1h-3.2l-1.5 5.4h-3.6l1.5-5.4h-2.6l.9-3.1h2.6l1.2-4.3h-2.8l.9-3.1h-.3z"
      />
      <path
        fill="#FFFFFF"
        d="M22.7 19.6h3.8l1 4.4 1.6-2.9 1.5 2.9 1-4.4h3.6l-2.7 12h-2.9l-1.6-3.6-1.5 3.6h-3l-2.8-12z"
      />
      <rect x="2" y="22" width="14" height="16" rx="1.5" fill="#107C41" />
      <path
        fill="#FFFFFF"
        d="M4.9 25.3h8.4v2.3h-2.9v6.9H7.8v-6.9H4.9v-2.3z"
      />
    </svg>
  );
}

function WordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#2B579A"
        d="M26 4H8a2 2 0 0 0-2 2v36a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V12L26 4z"
      />
      <path fill="#1F4E8C" d="M26 4l8 8h-6a2 2 0 0 1-2-2V4z" />
      <path
        fill="#FFFFFF"
        d="M12 16.5h3.2l1.2 8.6 1.4-5.5h2.9l1.4 5.5 1.2-8.6h3.2l-2.5 12h-3.3l-1.4-5.3-1.4 5.3h-3.3l-2.6-12z"
      />
      <rect x="2" y="22" width="14" height="16" rx="1.5" fill="#1F4E8C" />
      <path
        fill="#FFFFFF"
        d="M4.9 25.3h8.4v2.3h-2.9v6.9H7.8v-6.9H4.9v-2.3z"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Lanceur Office
// ─────────────────────────────────────────────────────────────

export interface OfficeLauncherProps {
  documentId: string;
  name: string;
  /** "excel" | "word" */
  app: "excel" | "word";
  /** Chemin signé (jeton) servant le vrai fichier sans cookie. */
  fileUrl: string;
  /** Contenu actuel (préservé lors des mises à jour de version). */
  content: string | null;
  size: number | null;
  version: number;
  updatedAt: string;
}

export function OfficeLauncher(props: OfficeLauncherProps) {
  const { documentId, name, app, fileUrl, content, size, version, updatedAt } =
    props;
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [launchState, setLaunchState] = useState<
    "idle" | "launched" | "fallback"
  >("idle");
  const [uploading, setUploading] = useState(false);

  const isExcel = app === "excel";
  const ext = isExcel ? ".xlsx" : ".docx";
  const appName = isExcel ? "Microsoft Excel" : "Microsoft Word";
  const fileKind = isExcel ? "Classeur Microsoft Excel" : "Document Microsoft Word";
  const protocol = isExcel ? "ms-excel" : "ms-word";

  /** Lance l'application Office de bureau avec le vrai fichier (URI Microsoft). */
  function openInOffice() {
    try {
      const absoluteUrl = `${window.location.origin}${fileUrl}`;

      // Schéma d'URI officiel Microsoft [MS-OFFURI] :
      //   ms-excel:ofe|u|https://contoso.com/classeur.xlsx
      // L'URL du document est passée TELLE QUELLE — un encodeURIComponent
      // complet (https%3A%2F%2F…) casse l'analyse de la commande par Office
      // et déclenche « Office ne reconnaît pas la commande ». Seuls les
      // espaces doivent être échappés (%20) ; or l'URL construite par le
      // serveur (origine + chemin d'ids alphanumériques + jeton JWT
      // base64url) ne contient que des caractères sûrs.
      const officeUri = `${protocol}:ofe|u|${absoluteUrl.replace(/ /g, "%20")}`;

      // iframe masqué : lance le protocole sans naviguer la page courante
      // (même mécanisme que « Ouvrir dans l'application » de OneDrive).
      const frame = document.createElement("iframe");
      frame.style.display = "none";
      frame.setAttribute("aria-hidden", "true");
      frame.src = officeUri;
      document.body.appendChild(frame);
      window.setTimeout(() => frame.remove(), 60000);

      setLaunchState("launched");
      toast.success(`${appName} s'ouvre avec « ${name} »`, {
        description:
          "Si la fenêtre apparaît en mode protégé, cliquez sur « Activer la modification ».",
        duration: 6000,
      });

      // Si Office n'est pas installé sur cet appareil, aucune application
      // ne répond au protocole → on propose le téléchargement.
      window.setTimeout(() => {
        setLaunchState((s) => (s === "launched" ? "fallback" : s));
      }, 3500);
    } catch {
      setLaunchState("fallback");
    }
  }

  /** Enregistre la nouvelle version du fichier modifié dans Microsoft Office. */
  async function handleVersionUpload(file: File) {
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(ext)) {
      toast.error(`Sélectionnez un fichier ${ext} (modifié dans ${appName}).`);
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (20 Mo maximum).");
      return;
    }
    setUploading(true);
    try {
      // Le fichier est conservé localement (IndexedDB) puis synchronisé :
      // la mise à jour de version fonctionne même hors-ligne.
      const blobKey = boEngine.newId("blob");
      await blobPut(blobKey, file);
      await boEngine.mutate({
        id: boEngine.newId("mut"),
        type: "document.saveContent",
        createdAt: new Date().toISOString(),
        payload: {
          id: documentId,
          name,
          content: content ?? "",
          blobKey,
          size: file.size,
          mimeType: isExcel
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
      });
      toast.success("Nouvelle version enregistrée", {
        description: `« ${file.name} » remplace la version ${version}.`,
      });
      router.refresh();
    } catch {
      toast.error("Enregistrement de la nouvelle version impossible.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <section className="space-y-5">
      {/* ── Carte du vrai fichier Microsoft ── */}
      <div className="rounded-xl border border-marine-profond/[0.07] bg-white shadow-[0_2px_12px_rgba(12,25,61,0.05)] overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div
            className={`flex items-center justify-center p-8 sm:p-10 ${
              isExcel ? "bg-[#107C41]/[0.06]" : "bg-[#2B579A]/[0.06]"
            }`}
          >
            {isExcel ? (
              <ExcelIcon className="w-24 h-24 drop-shadow-sm" />
            ) : (
              <WordIcon className="w-24 h-24 drop-shadow-sm" />
            )}
          </div>

          <div className="flex-1 min-w-0 p-6 sm:p-8">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gris-texte">
              {fileKind}
            </p>
            <h2 className="font-playfair text-2xl font-black text-marine-profond break-words mt-1">
              {name}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-gris-texte">
              <span className="font-semibold">{formatBytes(size)}</span>
              <span className="tabular-nums">Version {version}</span>
              <span className="tabular-nums">Modifié le {formatDateFr(updatedAt)}</span>
              <span className="inline-flex items-center gap-1.5 text-[#107C41] font-semibold">
                <FileCheck2 className="w-3.5 h-3.5" aria-hidden />
                Fichier {ext} réel — format Office
              </span>
            </div>

            {/* ── Actions principales ── */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={openInOffice}
                className={`h-11 px-6 text-white shadow-md ${
                  isExcel
                    ? "bg-[#107C41] hover:bg-[#0C6A38]"
                    : "bg-[#2B579A] hover:bg-[#234A85]"
                }`}
              >
                <ExternalLink className="w-4 h-4 mr-2" aria-hidden />
                Ouvrir dans {appName}
              </Button>
              <Button asChild variant="outline" className="h-11 px-5">
                <a href={fileUrl} download={name}>
                  <Download className="w-4 h-4 mr-2" aria-hidden />
                  Télécharger {ext}
                </a>
              </Button>
            </div>

            {launchState === "launched" && (
              <p className="mt-4 text-[13px] text-[#107C41] font-medium flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
                Ouverture de {appName}…
              </p>
            )}
            {launchState === "fallback" && (
              <p className="mt-4 text-[13px] text-gris-texte flex items-start gap-1.5 max-w-xl">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-orange-contrast" aria-hidden />
                {appName} ne s&apos;est pas ouvert ? L&apos;application n&apos;est
                sans doute pas installée sur cet appareil. Téléchargez le
                fichier ci-dessus : il s&apos;ouvre dans {appName} sur tout
                appareil où Office est installé (Windows, macOS, web).
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Aller-retour complet (comme OneDrive) ── */}
      <div className="rounded-xl border border-marine-profond/[0.07] bg-gris-bleute/40 p-6">
        <h3 className="font-bold text-marine-profond text-[15px] flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-orange-contrast" aria-hidden />
          Travaillez dans {appName}, la version du cockpit suit
        </h3>
        <ol className="mt-4 space-y-2.5 text-[13.5px] text-gris-texte list-decimal list-inside">
          <li>
            <strong className="text-marine-profond">Ouvrez</strong> le fichier
            dans {appName} (bouton ci-dessus ou téléchargement).
          </li>
          <li>
            <strong className="text-marine-profond">Modifiez</strong> avec
            l&apos;intégralité des fonctionnalités d&apos;{appName} — formules,
            tableaux croisés, graphiques, styles, mise en page — puis
            enregistrez sur votre appareil (Ctrl + S).
          </li>
          <li>
            <strong className="text-marine-profond">Mettez à jour</strong> la
            version du cockpit ci-dessous : le dossier client garde toujours
            la dernière version du vrai fichier.
          </li>
        </ol>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={ext}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleVersionUpload(f);
            }}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="h-10 bg-orange-logo hover:bg-orange-sature text-white shadow-orange"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" aria-hidden />
            )}
            {uploading
              ? "Enregistrement…"
              : `Mettre à jour la version (fichier ${ext})`}
          </Button>
          <span className="text-xs text-gris-texte">
            Renvoyez le fichier enregistré depuis {appName} — 20 Mo max.
          </span>
        </div>
      </div>
    </section>
  );
}
