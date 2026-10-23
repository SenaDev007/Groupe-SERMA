"use client";

import { useMemo, useState } from "react";
import { useBoData } from "@/hooks/useBoData";
import { boEngine } from "@/lib/offline/engine";
import { BoBadge, STATUS_TONES } from "@/components/back-office/BoKit";
import { formatDateFr } from "@/lib/back-office/constants";
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
  BookOpen,
  Eye,
  EyeOff,
  ExternalLink,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  legacyId: number | null;
  excerpt: string | null;
  category: string | null;
  readTime: string | null;
  status: string;
  publishedAt: string | null;
  content: string | null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function ArticlesView({ articles }: { articles: ArticleRow[] }) {
  const bo = useBoData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ArticleRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ArticleRow | null>(null);

  // Store offline-first : articles depuis IndexedDB dès que prêt,
  // sinon props du rendu serveur.
  const rows = useMemo<ArticleRow[]>(() => {
    if (bo.ready && bo.snapshot) {
      return bo.snapshot.articles.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        legacyId: a.legacyId,
        excerpt: a.excerpt,
        category: a.category,
        readTime: a.readTime,
        status: a.status,
        publishedAt: a.publishedAt,
        content: a.content,
      }));
    }
    return articles;
  }, [bo.ready, bo.snapshot, articles]);

  function toggleStatus(a: ArticleRow) {
    void boEngine.mutate({
      id: boEngine.newId("mut"),
      type: "article.upsert",
      createdAt: new Date().toISOString(),
      payload: {
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt ?? undefined,
        content: a.content ?? undefined,
        category: a.category ?? undefined,
        readTime: a.readTime ?? undefined,
        status: a.status === "PUBLIE" ? "BROUILLON" : "PUBLIE",
      },
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5">
        <p className="text-sm text-gris-texte">
          <strong className="text-marine-profond">{articles.filter((a) => a.status === "PUBLIE").length}</strong> publiés ·{" "}
          {articles.filter((a) => a.status === "BROUILLON").length} brouillons
        </p>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className="h-10 bg-orange-logo hover:bg-orange-sature text-white shadow-orange"
        >
          <Plus className="w-4 h-4 mr-1.5" aria-hidden />
          Nouvel article
        </Button>
      </div>

      <div className="rounded-xl border border-marine-profond/[0.07] bg-white shadow-[0_2px_12px_rgba(12,25,61,0.05)] overflow-hidden">
        <ul className="divide-y divide-marine-profond/[0.06]">
          {rows.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-gris-texte">Aucun article — créez le premier billet du blog.</li>
          )}
          {rows.map((a) => (
            <li key={a.id} className="px-5 py-4 flex flex-wrap items-center gap-4 hover:bg-gris-bleute/40 transition-colors">
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-marine-profond/[0.06] text-marine-profond/60 shrink-0">
                <BookOpen className="w-5 h-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-marine-profond text-[14.5px] leading-snug">{a.title}</p>
                  <BoBadge tone={STATUS_TONES[a.status] ?? "neutral"}>
                    {a.status === "PUBLIE" ? "Publié" : "Brouillon"}
                  </BoBadge>
                </div>
                <p className="text-xs text-gris-texte mt-1 leading-snug line-clamp-1">
                  {a.excerpt || "Aucun résumé"}
                </p>
                <p className="text-[11px] text-gris-texte/80 mt-1 flex items-center gap-2">
                  {a.category && <span>{a.category}</span>}
                  {a.readTime && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" aria-hidden /> {a.readTime}
                    </span>
                  )}
                  <span>/blog/{a.slug}</span>
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={`/blog/${a.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-gris-texte hover:text-marine-profond px-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                  Voir
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[11.5px] text-gris-texte hover:text-marine-profond"
                  onClick={() => toggleStatus(a)}
                >
                  {a.status === "PUBLIE" ? (
                    <><EyeOff className="w-3.5 h-3.5 mr-1" aria-hidden /> Dépublier</>
                  ) : (
                    <><Eye className="w-3.5 h-3.5 mr-1" aria-hidden /> Publier</>
                  )}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gris-texte hover:text-marine-profond" onClick={() => { setEditing(a); setDialogOpen(true); }} aria-label={`Modifier ${a.title}`}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gris-texte hover:text-red-600" onClick={() => setDeleteTarget(a)} aria-label={`Supprimer ${a.title}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <ArticleDialog open={dialogOpen} onOpenChange={setDialogOpen} article={editing} rows={rows} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {deleteTarget?.title} » sera définitivement retiré du blog et du site public.
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
                      type: "article.delete",
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

function ArticleDialog({
  open,
  onOpenChange,
  article,
  rows,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: ArticleRow | null;
  rows: ArticleRow[];
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(fd: FormData) {
    const title = String(fd.get("title") || "").trim();
    if (!title) {
      setError("Le titre de l'article est obligatoire.");
      return;
    }
    const slug = String(fd.get("slug") || "").trim() || slugify(title);
    const duplicate = rows.find((r) => r.slug === slug && r.id !== article?.id);
    if (duplicate) {
      setError("Un autre article utilise déjà ce slug.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await boEngine.mutate({
        id: boEngine.newId("mut"),
        type: "article.upsert",
        createdAt: new Date().toISOString(),
        payload: {
          id: article?.id ?? boEngine.newId("art"),
          title,
          slug,
          excerpt: String(fd.get("excerpt") || "") || undefined,
          content: String(fd.get("content") || "") || undefined,
          category: String(fd.get("category") || "") || undefined,
          readTime: String(fd.get("readTime") || "") || undefined,
          status: String(fd.get("status") || "BROUILLON"),
        },
      });
      onOpenChange(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto bo-scrollbar-light">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl font-black text-marine-profond">
            {article ? "Modifier l'article" : "Nouvel article de blog"}
          </DialogTitle>
          <DialogDescription>
            Rédaction en Markdown (## titres, **gras**, listes). Publié sur la page Blog du site public.
          </DialogDescription>
        </DialogHeader>

        <form
          action={(fd) => {
            void handleSubmit(fd);
          }}
          className="space-y-4"
          key={article?.id ?? "create"}
        >
          {article && <input type="hidden" name="id" value={article.id} />}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="a-title">Titre *</Label>
              <Input id="a-title" name="title" required defaultValue={article?.title ?? ""} placeholder="Ex. Le guide pratique de la DFU au Bénin" className="h-10" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="a-slug">Slug (URL)</Label>
              <Input id="a-slug" name="slug" defaultValue={article?.slug ?? ""} placeholder="genere-automatiquement" className="h-10" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="a-legacy">ID historique (optionnel)</Label>
              <Input id="a-legacy" name="legacyId" type="number" defaultValue={article?.legacyId ?? ""} placeholder="1, 2, 3…" className="h-10" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="a-category">Catégorie</Label>
              <Select name="category" defaultValue={article?.category ?? "Cabinet & Fiscalité"}>
                <SelectTrigger id="a-category" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cabinet & Fiscalité">Cabinet &amp; Fiscalité</SelectItem>
                  <SelectItem value="Entrepreneuriat">Entrepreneuriat</SelectItem>
                  <SelectItem value="Formations & Carrière">Formations &amp; Carrière</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="a-readtime">Temps de lecture</Label>
              <Input id="a-readtime" name="readTime" defaultValue={article?.readTime ?? ""} placeholder="6 min" className="h-10" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="a-status">Statut</Label>
              <Select name="status" defaultValue={article?.status ?? "BROUILLON"}>
                <SelectTrigger id="a-status" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BROUILLON">Brouillon (masqué)</SelectItem>
                  <SelectItem value="PUBLIE">Publié (visible sur le site)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="a-excerpt">Résumé (extrait affiché dans la grille)</Label>
              <Textarea id="a-excerpt" name="excerpt" defaultValue={article?.excerpt ?? ""} rows={2} placeholder="Un ou deux phrases qui donnent envie de lire l'article." />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="a-content">Contenu (Markdown)</Label>
              <Textarea
                id="a-content"
                name="content"
                defaultValue={article?.content ?? ""}
                rows={10}
                placeholder={"## Introduction\n\nVotre texte…\n\n- Point important\n- Autre point"}
                className="font-mono text-[13px]"
              />
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
              {pending ? "Enregistrement…" : article ? "Enregistrer" : "Créer l'article"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
