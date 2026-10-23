"use client";

import { useMemo, useState } from "react";
import { useBoData } from "@/hooks/useBoData";
import { boEngine } from "@/lib/offline/engine";
import { BoBadge, STATUS_TONES } from "@/components/back-office/BoKit";
import { formatDateFr, SUBMISSION_SOURCES } from "@/lib/back-office/constants";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  Check,
  Archive,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SubmissionRow {
  id: string;
  source: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
  payload: Record<string, unknown>;
}

export function SubmissionsInbox({
  submissions,
  scope,
}: {
  submissions: SubmissionRow[];
  scope: "cabinet" | "academy";
  /** Conservé pour compatibilité — les statuts passent par le moteur offline. */
  updateAction?: unknown;
}) {
  const bo = useBoData();
  const [expanded, setExpanded] = useState<string | null>(submissions[0]?.id ?? null);
  const [filter, setFilter] = useState<"TOUS" | "NOUVEAU" | "TRAITE" | "ARCHIVE">("TOUS");

  // Store offline-first : soumissions depuis IndexedDB dès que prêt,
  // sinon props du rendu serveur.
  const rows = useMemo(() => {
    if (bo.ready && bo.snapshot) {
      return bo.snapshot.submissions
        .filter((s) => (scope === "cabinet" ? s.entity === "CABINET" : s.entity === "ACADEMY"))
        .map((s) => {
          let payload: Record<string, unknown> = {};
          try {
            payload = JSON.parse(s.payload);
          } catch {
            payload = {};
          }
          return {
            id: s.id,
            source: SUBMISSION_SOURCES[s.source] ?? s.source,
            name: s.name,
            email: s.email,
            phone: s.phone,
            status: s.status,
            createdAt: s.createdAt,
            payload,
          };
        });
    }
    return submissions;
  }, [bo.ready, bo.snapshot, scope, submissions]);

  const filtered = rows.filter((s) => filter === "TOUS" || s.status === filter);
  const newCount = rows.filter((s) => s.status === "NOUVEAU").length;
  const doneCount = rows.filter((s) => s.status === "TRAITE").length;

  function setStatus(id: string, status: string) {
    void boEngine.mutate({
      id: boEngine.newId("mut"),
      type: "submission.setStatus",
      createdAt: new Date().toISOString(),
      payload: { id, status },
    });
  }

  return (
    <div>
      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {(
          [
            { value: "TOUS", label: `Toutes (${submissions.length})` },
            { value: "NOUVEAU", label: `Nouvelles (${newCount})` },
            { value: "TRAITE", label: `Traitées (${doneCount})` },
            { value: "ARCHIVE", label: "Archivées" },
          ] as const
        ).map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-[12px] font-bold border transition-colors",
              filter === f.value
                ? "bg-marine-profond text-white border-marine-profond"
                : "bg-white text-gris-texte border-marine-profond/15 hover:border-marine-profond/30"
            )}
          >
            {f.value === "TOUS" ? `Toutes (${rows.length})` : f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      <ul className="space-y-3">
        {filtered.length === 0 && (
          <li className="rounded-xl border border-dashed border-marine-profond/15 bg-white/60 p-8 text-center text-sm text-gris-texte">
            Aucune soumission dans cette catégorie.
          </li>
        )}
        {filtered.map((s) => {
          const open = expanded === s.id;
          const entries = Object.entries(s.payload?.data ?? s.payload).filter(
            ([key]) => !["id", "formId", "formTitle", "entity", "submittedAt", "createdAt"].includes(key)
          );
          return (
            <li
              key={s.id}
              className={cn(
                "rounded-xl border bg-white shadow-[0_2px_12px_rgba(12,25,61,0.05)] overflow-hidden transition-colors",
                s.status === "NOUVEAU" ? "border-orange-logo/40" : "border-marine-profond/[0.07]"
              )}
            >
              <button
                type="button"
                onClick={() => setExpanded(open ? null : s.id)}
                aria-expanded={open}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gris-bleute/40 transition-colors"
              >
                {open ? (
                  <ChevronDown className="w-4 h-4 text-gris-texte shrink-0" aria-hidden />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gris-texte shrink-0" aria-hidden />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-marine-profond text-[14.5px] truncate">
                      {s.name || s.source}
                    </p>
                    <BoBadge tone="outline">{s.source}</BoBadge>
                    {s.status === "NOUVEAU" && <BoBadge tone="orange">Nouveau</BoBadge>}
                  </div>
                  <p className="text-xs text-gris-texte mt-1">
                    Reçu le {formatDateFr(s.createdAt)}
                    {s.email ? ` · ${s.email}` : ""}
                    {s.phone && !s.email ? ` · ${s.phone}` : ""}
                  </p>
                </div>
                <BoBadge tone={STATUS_TONES[s.status] ?? "neutral"}>
                  {s.status === "NOUVEAU" ? "À traiter" : s.status === "TRAITE" ? "Traité" : "Archivé"}
                </BoBadge>
              </button>

              {open && (
                <div className="border-t border-marine-profond/[0.06] bg-gris-bleute/30 px-5 py-4">
                  {/* Coordonnées */}
                  {(s.email || s.phone) && (
                    <div className="flex flex-wrap gap-3 mb-4">
                      {s.email && (
                        <a
                          href={`mailto:${s.email}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-white border border-marine-profond/10 px-3 py-1.5 text-[12.5px] font-semibold text-marine-profond hover:border-orange-logo/40 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5 text-orange-contrast" aria-hidden />
                          {s.email}
                        </a>
                      )}
                      {s.phone && (
                        <a
                          href={`tel:${s.phone.replace(/\s/g, "")}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-white border border-marine-profond/10 px-3 py-1.5 text-[12.5px] font-semibold text-marine-profond hover:border-orange-logo/40 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-orange-contrast" aria-hidden />
                          {s.phone}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Données du formulaire */}
                  <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                    {entries.map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <dt className="text-[10.5px] font-bold uppercase tracking-wider text-gris-texte/70">
                          {humanize(key)}
                        </dt>
                        <dd className="text-[13px] text-marine-profond mt-0.5 break-words">
                          {formatValue(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 mt-5">
                    {s.status !== "TRAITE" && (
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 bg-vert-tech hover:bg-[#2c6e50] text-white"
                        onClick={() => setStatus(s.id, "TRAITE")}
                      >
                        <Check className="w-3.5 h-3.5 mr-1.5" aria-hidden />
                        Marquer comme traité
                      </Button>
                    )}
                    {s.status === "NOUVEAU" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 border-marine-profond/20 text-gris-texte"
                        onClick={() => setStatus(s.id, "ARCHIVE")}
                      >
                        <Archive className="w-3.5 h-3.5 mr-1.5" aria-hidden />
                        Archiver
                      </Button>
                    )}
                    {s.status !== "NOUVEAU" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 border-marine-profond/20 text-gris-texte"
                        onClick={() => setStatus(s.id, "NOUVEAU")}
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" aria-hidden />
                        Remettre à traiter
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function humanize(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (Array.isArray(value)) return value.map((v) => String(v)).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
