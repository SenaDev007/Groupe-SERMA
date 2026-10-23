"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/back-office/actions";
import { boEngine } from "@/lib/offline/engine";
import { BoLogo } from "./BoLogo";
import { PwaControls } from "./pwa/PwaControls";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Inbox,
  Briefcase,
  GraduationCap,
  BookOpen,
  Star,
  ClipboardList,
  ArrowLeftRight,
  ExternalLink,
  LogOut,
  HeartHandshake,
  Building2,
  Menu,
  X,
} from "lucide-react";

export type BoEntity = "cabinet" | "academy";

const NAV: Record<
  BoEntity,
  { group: string; items: { href: string; label: string; icon: React.ElementType }[] }[]
> = {
  cabinet: [
    {
      group: "Pilotage",
      items: [
        { href: "/back-office/cabinet", label: "Tableau de bord", icon: LayoutDashboard },
      ],
    },
    {
      group: "Dossiers",
      items: [
        { href: "/back-office/cabinet/clients?tab=ONG", label: "Dossiers ONG", icon: HeartHandshake },
        { href: "/back-office/cabinet/clients?tab=ENTREPRISE", label: "Autres clients", icon: Building2 },
        { href: "/back-office/cabinet/documents", label: "Documents & fichiers", icon: FileSpreadsheet },
      ],
    },
    {
      group: "Entrées du site",
      items: [
        { href: "/back-office/cabinet/demandes", label: "Demandes reçues", icon: Inbox },
      ],
    },
  ],
  academy: [
    {
      group: "Pilotage",
      items: [
        { href: "/back-office/academy", label: "Tableau de bord", icon: LayoutDashboard },
      ],
    },
    {
      group: "Contenus du site",
      items: [
        { href: "/back-office/academy/formations", label: "Formations & filières", icon: GraduationCap },
        { href: "/back-office/academy/articles", label: "Articles du blog", icon: BookOpen },
        { href: "/back-office/academy/temoignages", label: "Témoignages", icon: Star },
      ],
    },
    {
      group: "Entrées du site",
      items: [
        { href: "/back-office/academy/inscriptions", label: "Inscriptions reçues", icon: ClipboardList },
      ],
    },
  ],
};

const ENTITY_META: Record<
  BoEntity,
  { name: string; tagline: string; icon: React.ElementType; publicHref: string }
> = {
  cabinet: {
    name: "Cabinet SERMA",
    tagline: "Expertise comptable · Fiscalité · Social",
    icon: Briefcase,
    publicHref: "/cabinet",
  },
  academy: {
    name: "SERMA HUB Academy",
    tagline: "Centre de formation professionnelle",
    icon: GraduationCap,
    publicHref: "/academy",
  },
};

export function BoShell({
  entity,
  user,
  children,
}: {
  entity: BoEntity;
  user: { name: string; email: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const meta = ENTITY_META[entity];
  const groups = NAV[entity];

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sidebar = (
    <div className="flex h-full flex-col bg-marine-profond text-white">
      {/* Logo — statique, aucune animation */}
      <div className="px-5 pt-6 pb-5 border-b border-white/[0.08]">
        <BoLogo variant="light" sub="BACK-OFFICE" />
      </div>

      {/* Badge entité */}
      <div className="px-5 py-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.05] border border-white/10 px-3.5 py-3">
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-logo/15 border border-orange-logo/30 shrink-0">
            <meta.icon className="w-4.5 h-4.5 w-[18px] h-[18px] text-orange-sature" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold leading-tight truncate">{meta.name}</p>
            <p className="text-[10.5px] text-white/50 truncate mt-0.5">{meta.tagline}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 bo-scrollbar" aria-label="Navigation back-office">
        {groups.map((group) => (
          <div key={group.group}>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
              {group.group}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const base = item.href.split("?")[0];
                const active = pathname === base;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                        active
                          ? "bg-orange-logo text-white shadow-orange-sm"
                          : "text-white/70 hover:text-white hover:bg-white/[0.06]"
                      )}
                    >
                      <Icon className="w-[17px] h-[17px] shrink-0" aria-hidden />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Pied — statut synchro + utilisateur + actions */}
      <div className="border-t border-white/[0.08] px-4 py-4 space-y-1.5">
        <PwaControls />
        <div className="flex items-center gap-3 px-1 mb-2 pt-2">
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/15 font-inter text-xs font-bold text-orange-sature shrink-0">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-tight truncate">{user.name}</p>
            <p className="text-[11px] text-white/45 truncate">{user.email}</p>
          </div>
        </div>
        <Link
          href="/back-office/selection"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <ArrowLeftRight className="w-4 h-4" aria-hidden />
          Changer d&apos;espace
        </Link>
        <a
          href={meta.publicHref}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <ExternalLink className="w-4 h-4" aria-hidden />
          Voir le site public
        </a>
        <form
          action={logoutAction}
          onSubmit={() => {
            // Sécurité : purge de la copie locale (IndexedDB) à la déconnexion
            void boEngine.reset();
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] text-red-300/80 hover:text-red-200 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" aria-hidden />
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gris-bleute/60">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden lg:block w-[264px]" aria-label="Barre latérale">
        {sidebar}
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-marine-profond/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 text-white/60 hover:text-white"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Contenu */}
      <div className="lg:pl-[264px] flex flex-col min-h-screen">
        {/* Barre supérieure mobile */}
        <header className="sticky top-0 z-30 lg:hidden bg-marine-profond text-white border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <BoLogo variant="light" sub="BO" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="text-white hover:bg-white/10"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </header>
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">{children}</main>
        <footer className="mt-auto border-t border-marine-profond/[0.06] px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-[11px] text-gris-texte/70">
            Back-Office {meta.name} &middot; Groupe SERMA &middot; Cockpit digital interne
          </p>
        </footer>
      </div>
    </div>
  );
}
