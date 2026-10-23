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
  Star,
  Eye,
  EyeOff,
  Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TestimonialRow {
  id: string;
  name: string;
  role: string | null;
  entity: string;
  content: string;
  rating: number;
  status: string;
}

export function TestimonialsView({ testimonials }: { testimonials: TestimonialRow[] }) {
  const bo = useBoData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TestimonialRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TestimonialRow | null>(null);

  // Store offline-first : témoignages depuis IndexedDB dès que prêt,
  // sinon props du rendu serveur.
  const rows = useMemo<TestimonialRow[]>(() => {
    if (bo.ready && bo.snapshot) {
      return bo.snapshot.testimonials.map((t) => ({
        id: t.id,
        name: t.name,
        role: t.role,
        entity: t.entity,
        content: t.content,
        rating: t.rating,
        status: t.status,
      }));
    }
    return testimonials;
  }, [bo.ready, bo.snapshot, testimonials]);

  function toggleStatus(t: TestimonialRow) {
    void boEngine.mutate({
      id: boEngine.newId("mut"),
      type: "testimonial.upsert",
      createdAt: new Date().toISOString(),
      payload: {
        id: t.id,
        name: t.name,
        role: t.role ?? undefined,
        entity: t.entity,
        content: t.content,
        rating: t.rating,
        status: t.status === "PUBLIE" ? "BROUILLON" : "PUBLIE",
      },
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5">
        <p className="text-sm text-gris-texte">
          <strong className="text-marine-profond">{testimonials.filter((t) => t.status === "PUBLIE").length}</strong> en ligne ·{" "}
          {testimonials.filter((t) => t.entity === "CABINET").length} cabinet ·{" "}
          {testimonials.filter((t) => t.entity === "ACADEMY").length} academy
        </p>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className="h-10 bg-orange-logo hover:bg-orange-sature text-white shadow-orange"
        >
          <Plus className="w-4 h-4 mr-1.5" aria-hidden />
          Nouveau témoignage
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {rows.length === 0 && (
          <p className="text-sm text-gris-texte col-span-2 rounded-xl border border-dashed border-marine-profond/15 bg-white/60 p-6 text-center">
            Aucun témoignage — créez le premier pour enrichir le site public.
          </p>
        )}
        {rows.map((t) => (
          <article
            key={t.id}
            className={cn(
              "rounded-xl border bg-white p-5 shadow-[0_2px_12px_rgba(12,25,61,0.05)]",
              t.status !== "PUBLIE" ? "border-dashed border-marine-profond/20 opacity-75" : "border-marine-profond/[0.07]"
            )}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-1" aria-label={`Note : ${t.rating} sur 5`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={cn("w-3.5 h-3.5", i < t.rating ? "text-orange-logo fill-orange-logo" : "text-marine-profond/15")}
                    aria-hidden
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <BoBadge tone={t.entity === "CABINET" ? "marine" : "green"}>{t.entity === "CABINET" ? "Cabinet" : "Academy"}</BoBadge>
                <BoBadge tone={STATUS_TONES[t.status] ?? "neutral"}>{t.status === "PUBLIE" ? "En ligne" : "Brouillon"}</BoBadge>
              </div>
            </div>

            <Quote className="w-5 h-5 text-orange-logo/40 mb-2" aria-hidden />
            <p className="text-[13.5px] text-marine-profond/85 leading-relaxed italic">« {t.content} »</p>

            <div className="mt-4 pt-3 border-t border-marine-profond/[0.06] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-marine-profond truncate">{t.name}</p>
                <p className="text-[11.5px] text-gris-texte truncate">{t.role || "—"}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[11.5px] text-gris-texte hover:text-marine-profond"
                  onClick={() => toggleStatus(t)}
                >
                  {t.status === "PUBLIE" ? (
                    <><EyeOff className="w-3.5 h-3.5 mr-1" aria-hidden /> Masquer</>
                  ) : (
                    <><Eye className="w-3.5 h-3.5 mr-1" aria-hidden /> Publier</>
                  )}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gris-texte hover:text-marine-profond" onClick={() => { setEditing(t); setDialogOpen(true); }} aria-label={`Modifier le témoignage de ${t.name}`}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gris-texte hover:text-red-600" onClick={() => setDeleteTarget(t)} aria-label={`Supprimer le témoignage de ${t.name}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <TestimonialDialog open={dialogOpen} onOpenChange={setDialogOpen} testimonial={editing} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce témoignage ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le témoignage de « {deleteTarget?.name} » sera retiré du site public. Action irréversible.
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
                      type: "testimonial.delete",
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

function TestimonialDialog({
  open,
  onOpenChange,
  testimonial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial: TestimonialRow | null;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(fd: FormData) {
    const name = String(fd.get("name") || "").trim();
    const content = String(fd.get("content") || "").trim();
    if (!name || !content) {
      setError("L'auteur et le contenu du témoignage sont obligatoires.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await boEngine.mutate({
        id: boEngine.newId("mut"),
        type: "testimonial.upsert",
        createdAt: new Date().toISOString(),
        payload: {
          id: testimonial?.id ?? boEngine.newId("tem"),
          name,
          role: String(fd.get("role") || "") || undefined,
          entity: String(fd.get("entity") || "CABINET"),
          content,
          rating: Number(fd.get("rating") || 5) || 5,
          status: String(fd.get("status") || "PUBLIE"),
        },
      });
      onOpenChange(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto bo-scrollbar-light">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl font-black text-marine-profond">
            {testimonial ? `Modifier — ${testimonial.name}` : "Nouveau témoignage"}
          </DialogTitle>
          <DialogDescription>
            Publié sur les pages publiques du Groupe (cabinet ou academy) selon l&apos;entité choisie.
          </DialogDescription>
        </DialogHeader>

        <form
          action={(fd) => {
            void handleSubmit(fd);
          }}
          className="space-y-4"
          key={testimonial?.id ?? "create"}
        >
          {testimonial && <input type="hidden" name="id" value={testimonial.id} />}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="t-name">Auteur *</Label>
              <Input id="t-name" name="name" required defaultValue={testimonial?.name ?? ""} placeholder="Ex. Dossou KPONOU" className="h-10" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="t-role">Rôle / organisation</Label>
              <Input id="t-role" name="role" defaultValue={testimonial?.role ?? ""} placeholder="Ex. DG · AgroBenin (Parakou)" className="h-10" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="t-entity">Entité</Label>
              <Select name="entity" defaultValue={testimonial?.entity ?? "CABINET"}>
                <SelectTrigger id="t-entity" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CABINET">Cabinet SERMA</SelectItem>
                  <SelectItem value="ACADEMY">SERMA HUB Academy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="t-rating">Note</Label>
              <Select name="rating" defaultValue={String(testimonial?.rating ?? 5)}>
                <SelectTrigger id="t-rating" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} / 5</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="t-content">Témoignage *</Label>
              <Textarea
                id="t-content"
                name="content"
                required
                defaultValue={testimonial?.content ?? ""}
                rows={4}
                placeholder="Le contenu exact du témoignage, entre guillemets…"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="t-status">Statut</Label>
              <Select name="status" defaultValue={testimonial?.status ?? "PUBLIE"}>
                <SelectTrigger id="t-status" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIE">En ligne (visible sur le site)</SelectItem>
                  <SelectItem value="BROUILLON">Brouillon (masqué)</SelectItem>
                </SelectContent>
              </Select>
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
              {pending ? "Enregistrement…" : testimonial ? "Enregistrer" : "Créer le témoignage"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
