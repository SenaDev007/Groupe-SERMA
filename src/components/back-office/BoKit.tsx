import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function BoPageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-contrast mb-1.5">
            {eyebrow}
          </p>
        )}
        <h1 className="font-playfair text-2xl sm:text-3xl font-black tracking-tight text-marine-profond leading-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-gris-texte leading-relaxed max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}

const BADGE_TONES: Record<string, string> = {
  neutral: "bg-marine-profond/[0.06] text-marine-profond/70 border-marine-profond/10",
  orange: "bg-orange-logo/10 text-orange-contrast border-orange-logo/25",
  green: "bg-vert-tech/10 text-[#256b4d] border-vert-tech/25",
  red: "bg-red-500/10 text-red-700 border-red-500/25",
  marine: "bg-marine-profond text-white border-marine-profond",
  outline: "bg-transparent text-gris-texte border-marine-profond/15",
};

export function BoBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof BADGE_TONES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold whitespace-nowrap",
        BADGE_TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Mapping statuts métier → tons visuels (source unique). */
export const STATUS_TONES: Record<string, "neutral" | "orange" | "green" | "red" | "marine"> = {
  A_FAIRE: "neutral",
  EN_COURS: "orange",
  EN_REVISION: "marine",
  TERMINE: "green",
  NOUVEAU: "orange",
  TRAITE: "green",
  ARCHIVE: "neutral",
  OUVERTE: "orange",
  CLOTUREE: "green",
  ACTIF: "green",
  SUSPENDU: "red",
  BROUILLON: "neutral",
  PUBLIE: "green",
};

export function PRIORITY_TONES(priority: string): "neutral" | "orange" | "red" {
  switch (priority) {
    case "URGENTE":
      return "red";
    case "HAUTE":
      return "orange";
    default:
      return "neutral";
  }
}

export function BoStatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "marine",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ElementType;
  tone?: "marine" | "orange" | "green" | "red";
}) {
  const iconTones = {
    marine: "bg-marine-profond/[0.06] text-marine-profond",
    orange: "bg-orange-logo/10 text-orange-contrast",
    green: "bg-vert-tech/10 text-[#256b4d]",
    red: "bg-red-500/10 text-red-600",
  };
  return (
    <div className="rounded-xl border border-marine-profond/[0.07] bg-white p-5 shadow-[0_2px_12px_rgba(12,25,61,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gris-texte/80">{label}</p>
          <p className="mt-2 font-inter text-3xl font-extrabold tracking-tight text-marine-profond tabular-nums">
            {value}
          </p>
          {hint && <p className="mt-1.5 text-xs text-gris-texte/90">{hint}</p>}
        </div>
        {Icon && (
          <span className={cn("flex items-center justify-center w-10 h-10 rounded-lg shrink-0", iconTones[tone])}>
            <Icon className="w-5 h-5" aria-hidden />
          </span>
        )}
      </div>
    </div>
  );
}

export function BoEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-marine-profond/15 bg-white/60 p-10 text-center">
      <span className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-marine-profond/[0.05] text-marine-profond/40 mb-4">
        <Icon className="w-6 h-6" aria-hidden />
      </span>
      <p className="font-semibold text-marine-profond">{title}</p>
      {description && <p className="mt-1.5 text-sm text-gris-texte max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
