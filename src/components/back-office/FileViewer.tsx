"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/back-office/constants";
import {
  Download,
  FileSpreadsheet,
  FileText,
  File as FileIcon,
  FileImage,
  FileArchive,
  Presentation,
} from "lucide-react";

const FILE_ICON_MAP: Array<{ test: (mime: string | null, ext: string) => boolean; Icon: React.ElementType }> = [
  { test: (mime, ext) => !!mime?.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext), Icon: FileImage },
  { test: (mime) => !!mime?.startsWith("video/"), Icon: Presentation },
  { test: (_, ext) => ["zip", "rar", "7z", "gz"].includes(ext), Icon: FileArchive },
  { test: (_, ext) => ["xlsx", "xls", "csv"].includes(ext), Icon: FileSpreadsheet },
  { test: (_, ext) => ["doc", "docx", "odt", "rtf"].includes(ext), Icon: FileText },
  { test: (_, ext) => ["ppt", "pptx"].includes(ext), Icon: Presentation },
];

function pickFileIcon(mime: string | null, name: string): React.ElementType {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return FILE_ICON_MAP.find((entry) => entry.test(mime, ext))?.Icon ?? FileIcon;
}

export function FileViewer({
  documentId,
  name,
  mimeType,
  size,
}: {
  documentId: string;
  name: string;
  mimeType: string | null;
  size: number | null;
}) {
  const iconType = pickFileIcon(mimeType, name);
  const downloadUrl = `/api/back-office/files/${documentId}`;

  return (
    <div className="rounded-xl border border-marine-profond/[0.07] bg-white shadow-[0_2px_12px_rgba(12,25,61,0.05)] p-10">
      <div className="flex flex-col items-center text-center">
        <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-marine-profond/[0.05] text-marine-profond/60 mb-5">
          {React.createElement(iconType, { className: "w-8 h-8", "aria-hidden": true })}
        </span>
        <p className="font-playfair text-xl font-black text-marine-profond break-all">{name}</p>
        <p className="mt-2 text-sm text-gris-texte">
          {mimeType || "Type inconnu"} · {formatBytes(size)}
        </p>

        <div className="mt-7">
          <Button asChild className="h-11 bg-orange-logo hover:bg-orange-sature text-white shadow-orange px-6">
            <a href={downloadUrl} download={name}>
              <Download className="w-4 h-4 mr-2" aria-hidden />
              Télécharger le fichier
            </a>
          </Button>
        </div>

        <p className="mt-8 text-xs text-gris-texte max-w-md leading-relaxed">
          Fichier importé archivé dans le dossier du client : PDF, Word, images,
          archives… Il reste téléchargeable à tout moment depuis n&apos;importe où.
        </p>
      </div>
    </div>
  );
}
