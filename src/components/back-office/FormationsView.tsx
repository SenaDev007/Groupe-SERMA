"use client";

import { useMemo, useState } from "react";
import { useBoData } from "@/hooks/useBoData";
import { boEngine } from "@/lib/offline/engine";
import { BoBadge, STATUS_TONES } from "@/components/back-office/BoKit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  GraduationCap,
  Timer,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormationRow {
  id: string;
  title: string;
  hook: string | null;
  description: string | null;
  category: string;
  duration: string | null;
  price: string | null;
  level: string | null;
  skills: string[];
  outcome: string | null;
  status: string;
  order: number;
}

export function FormationsView({ formations }: { formations: FormationRow[] }) {
  const bo = useBoData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FormationRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FormationRow | null>(null);
  const [category, setCategory] = useState("FORMATION_COURTE");

  // Store offline-first : formations depuis IndexedDB dès que prêt,
  // sinon props du rendu serveur.
  const rows = useMemo<FormationRow[]>(() => {
    if (bo.ready && bo.snapshot) {
      return bo.snapshot.formations.map((f) => {
        let skills: string[] = [];
        try {
          const parsed = JSON.parse(f.skills);
          if (Array.isArray(parsed)) skills = parsed.map((s: unknown) => String(s));
        } catch {
          skills = [];
        }
        return {
          id: f.id,
          title: f.title,
          hook: f.hook,
          description: f.description,
          category: f.category,
          duration: f.duration,
          price: f.price,
          level: f.level,
          skills,
          outcome: f.outcome,
          status: f.status,
          order: f.order,
        };
      });
    }
    return formations;
  }, [bo.ready, bo.snapshot, formations]);

  function toggleStatus(f: FormationRow) {
    void boEngine.mutate({
      id: boEngine.newId("mut"),
      type: "formation.upsert",
      createdAt: new Date().toISOString(),
      payload: {
        id: f.id,
        title: f.title,
        hook: f.hook ?? undefined,
        description: f.description ?? undefined,
        category: f.category,
        duration: f.duration ?? undefined,
        price: f.price ?? undefined,
        level: f.level ?? undefined,
        skills: JSON.stringify(f.skills),
        outcome: f.outcome ?? undefined,
        status: f.status === "PUBLIE" ? "BROUILLON" : "PUBLIE",
        order: f.order,
      },
    });
  }

  function openCreate() {
    setEditing(null);
    setCategory("FORMATION_COURTE");
    setDialogOpen(true);
  }
  function openEdit(f: FormationRow) {
    setEditing(f);
    setCategory(f.category);
    setDialogOpen(true);
  }

  const filieres = rows.filter((f) => f.category === "FILIERE");
  const courtes = rows.filter((f) => f.category !== "FILIERE");

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5">
        <p className="text-sm text-gris-texte">
          <strong className="text-marine-profond">{formations.filter((f) => f.status === "PUBLIE").length}</strong> publiées ·{" "}
          {filieres.length} filières et {courtes.length} formations courtes
        </p>
        <Button onClick={openCreate} className="h-10 bg-orange-logo hover:bg-orange-sature text-white shadow-orange">
          <Plus className="w-4 h-4 mr-1.5" aria-hidden />
          Nouvelle formation
        </Button>
      </div>

      {/* Filières */}
      <FormationGroup
        title="Filières métiers (6 mois)"
        icon={GraduationCap}
        items={filieres}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        onToggle={toggleStatus}
      />

      {/* Formations courtes */}
      <FormationGroup
        title="Formations courtes (3 jours)"
        icon={Timer}
        items={courtes}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        onToggle={toggleStatus}
      />

      <FormationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        formation={editing}
        category={category}
        setCategory={setCategory}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette formation ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {deleteTarget?.title} » sera retirée du back-office et du site public.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            {deleteTarget && (
              <AlertDialogAction asChild>
                <Button
                  type="button"
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    if (!deleteTarget) return;
                    const id = deleteTarget.id;
                    setDeleteTarget(null);
                    void boEngine.mutate({
                      id: boEngine.newId("mut"),
                      type: "formation.delete",
                      createdAt: new Date().toISOString(),
                      payload: { id },
                    });
                  }}
                >
                  Supprimer
                </Button>
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FormationGroup({
  title,
  icon: Icon,
  items,
  onEdit,
  onDelete,
  onToggle,
}: {
  title: string;
  icon: React.ElementType;
  items: FormationRow[];
  onEdit: (f: FormationRow) => void;
  onDelete: (f: FormationRow) => void;
  onToggle: (f: FormationRow) => void;
}) {
  return (
    <section className="mb-7" aria-label={title}>
      <h2 className="flex items-center gap-2 font-bold text-marine-profond text-[15px] mb-3">
        <Icon className="w-4 h-4 text-orange-contrast" aria-hidden />
        {title}
        <span className="font-inter text-[11px] px-2 py-0.5 rounded-full bg-marine-profond/[0.06] text-gris-texte">
          {items.length}
        </span>
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {items.length === 0 && (
          <p className="text-sm text-gris-texte col-span-2 rounded-xl border border-dashed border-marine-profond/15 bg-white/60 p-6 text-center">
            Aucune formation dans cette catégorie.
          </p>
        )}
        {items.map((f) => (
          <article
            key={f.id}
            className={cn(
              "rounded-xl border bg-white p-5 shadow-[0_2px_12px_rgba(12,25,61,0.05)]",
              f.status !== "PUBLIE" ? "border-dashed border-marine-profond/20 opacity-75" : "border-marine-profond/[0.07]"
            )}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-bold text-marine-profond text-[15px] leading-snug">{f.title}</h3>
              <BoBadge tone={STATUS_TONES[f.status] ?? "neutral"}>
                {f.status === "PUBLIE" ? "En ligne" : "Brouillon"}
              </BoBadge>
            </div>
            {f.hook && <p className="text-[13px] text-orange-contrast font-semibold italic">« {f.hook} »</p>}
            {f.duration && (
              <p className="text-[11.5px] text-gris-texte mt-2 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5" aria-hidden />
                {f.duration}
                {f.level ? ` · ${f.level}` : ""}
                {f.price ? ` · ${f.price}` : ""}
              </p>
            )}
            {f.skills.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {f.skills.slice(0, 3).map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12.5px] text-gris-texte leading-snug">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-logo/60 mt-1.5 shrink-0" aria-hidden />
                    {s}
                  </li>
                ))}
                {f.skills.length > 3 && (
                  <li className="text-[11px] text-gris-texte/70">+ {f.skills.length - 3} autres compétences…</li>
                )}
              </ul>
            )}
            <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-marine-profond/[0.06]">
              <a
                href="/academy#formations"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-gris-texte hover:text-marine-profond transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                Voir sur le site
              </a>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[11.5px] text-gris-texte hover:text-marine-profond"
                  onClick={() => onToggle(f)}
                >
                  {f.status === "PUBLIE" ? (
                    <><EyeOff className="w-3.5 h-3.5 mr-1" aria-hidden /> Dépublier</>
                  ) : (
                    <><Eye className="w-3.5 h-3.5 mr-1" aria-hidden /> Publier</>
                  )}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gris-texte hover:text-marine-profond" onClick={() => onEdit(f)} aria-label={`Modifier ${f.title}`}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gris-texte hover:text-red-600" onClick={() => onDelete(f)} aria-label={`Supprimer ${f.title}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FormationDialog({
  open,
  onOpenChange,
  formation,
  category,
  setCategory,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formation: FormationRow | null;
  category: string;
  setCategory: (c: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(fd: FormData) {
    const title = String(fd.get("title") || "").trim();
    if (!title) {
      setError("Le titre de la formation est obligatoire.");
      return;
    }
    const skills = fd
      .getAll("skills")
      .map((s) => String(s).trim())
      .filter(Boolean);
    if (skills.length === 0) {
      setError("Au moins une compétence est requise.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await boEngine.mutate({
        id: boEngine.newId("mut"),
        type: "formation.upsert",
        createdAt: new Date().toISOString(),
        payload: {
          id: formation?.id ?? boEngine.newId("form"),
          title,
          hook: String(fd.get("hook") || "") || undefined,
          description: String(fd.get("description") || "") || undefined,
          category: String(fd.get("category") || "FORMATION_COURTE"),
          duration: String(fd.get("duration") || "") || undefined,
          price: String(fd.get("price") || "") || undefined,
          level: String(fd.get("level") || "") || undefined,
          skills: JSON.stringify(skills),
          outcome: String(fd.get("outcome") || "") || undefined,
          status: String(fd.get("status") || "PUBLIE"),
          order: Number(fd.get("order") || 99) || 99,
        },
      });
      onOpenChange(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto bo-scrollbar-light">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl font-black text-marine-profond">
            {formation ? `Modifier — ${formation.title}` : "Nouvelle formation"}
          </DialogTitle>
          <DialogDescription>
            Publiée sur la page Academy du site public dès qu&apos;elle est marquée « En ligne ».
          </DialogDescription>
        </DialogHeader>

        <form
          action={(fd) => {
            void handleSubmit(fd);
          }}
          className="space-y-4"
          key={formation?.id ?? "create"}
        >
          {formation && <input type="hidden" name="id" value={formation.id} />}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="f-title">Titre *</Label>
              <Input id="f-title" name="title" required defaultValue={formation?.title ?? ""} placeholder="Ex. Gestion Efficace de la Caisse" className="h-10" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="f-category">Catégorie</Label>
              <input type="hidden" name="category" value={category} />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="f-category" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FILIERE">Filière métier (6 mois)</SelectItem>
                  <SelectItem value="FORMATION_COURTE">Formation courte (3 jours)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="f-duration">Durée</Label>
              <Input id="f-duration" name="duration" defaultValue={formation?.duration ?? ""} placeholder="3 jours / 6 mois" className="h-10" />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="f-hook">Accroche (affichée en italique)</Label>
              <Input id="f-hook" name="hook" defaultValue={formation?.hook ?? ""} placeholder="Ex. Gérez les fonds comme les bailleurs l'exigent." className="h-10" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="f-level">Niveau</Label>
              <Input id="f-level" name="level" defaultValue={formation?.level ?? ""} placeholder="Débutant à confirmé" className="h-10" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="f-price">Coût / mention</Label>
              <Input id="f-price" name="price" defaultValue={formation?.price ?? ""} placeholder="Ex. Gratuit · Financement possible" className="h-10" />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Compétences enseignées (une par ligne)</Label>
              {formation?.skills.map((s, i) => (
                <Input key={i} name="skills" defaultValue={s} className="h-10 mb-2" placeholder="Compétence acquise" />
              ))}
              {[...Array(formation ? 0 : 3)].map((_, i) => (
                <Input key={`new-${i}`} name="skills" className="h-10 mb-2" placeholder="Compétence acquise" />
              ))}
              <p className="text-[11px] text-gris-texte">
                Les compétences existantes sont pré-remplies — modifiez ou laissez vides pour supprimer.
              </p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="f-outcome">Résultat pour l&apos;apprenant</Label>
              <Textarea id="f-outcome" name="outcome" defaultValue={formation?.outcome ?? ""} rows={2} placeholder="Ex. Un produit fini prêt à la vente + accès aux microcrédits." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="f-status">Statut</Label>
              <Select name="status" defaultValue={formation?.status ?? "PUBLIE"}>
                <SelectTrigger id="f-status" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIE">En ligne (visible sur le site)</SelectItem>
                  <SelectItem value="BROUILLON">Brouillon (masqué)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="f-order">Ordre d&apos;affichage</Label>
              <Input id="f-order" name="order" type="number" defaultValue={formation?.order ?? 99} className="h-10" />
            </div>
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={pending} className="bg-orange-logo hover:bg-orange-sature text-white shadow-orange">
              {pending ? "Enregistrement…" : formation ? "Enregistrer" : "Créer la formation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
