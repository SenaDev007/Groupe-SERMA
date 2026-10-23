"use client";

import { useMemo, useState } from "react";
import { useBoData } from "@/hooks/useBoData";
import { boEngine } from "@/lib/offline/engine";
import { BoBadge, STATUS_TONES, PRIORITY_TONES } from "@/components/back-office/BoKit";
import { priorityLabel } from "@/lib/back-office/labels";
import {
  WORK_CATEGORIES,
  WORK_CATEGORY_LABELS,
  WORK_STATUS_LABELS,
  formatDateFr,
} from "@/lib/back-office/constants";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorkItemRow {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  dueDate: string | null;
  notes: string | null;
  documentCount: number;
}

const STATUS_FLOW = ["A_FAIRE", "EN_COURS", "EN_REVISION", "TERMINE"];

export function WorkItemsPanel({
  clientId,
  items,
}: {
  clientId: string;
  items: WorkItemRow[];
}) {
  const bo = useBoData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WorkItemRow | null>(null);

  // Store offline-first : missions depuis IndexedDB dès que prêt,
  // sinon props du rendu serveur.
  const rows = useMemo(() => {
    if (bo.ready && bo.snapshot) {
      return bo.snapshot.workItems
        .filter((w) => w.clientId === clientId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .map((w) => ({
          id: w.id,
          title: w.title,
          category: w.category,
          status: w.status,
          priority: w.priority,
          dueDate: w.dueDate,
          notes: w.notes,
          documentCount: bo.snapshot!.documents.filter((d) => d.workItemId === w.id).length,
        }));
    }
    return items;
  }, [bo.ready, bo.snapshot, clientId, items]);

  const counts = STATUS_FLOW.map((s) => ({
    status: s,
    count: rows.filter((i) => i.status === s).length,
  }));

  return (
    <section aria-labelledby="missions-title" className="rounded-xl border border-marine-profond/[0.07] bg-white shadow-[0_2px_12px_rgba(12,25,61,0.05)] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-marine-profond/[0.07] bg-gris-bleute/60">
        <div className="flex items-center gap-2.5">
          <ClipboardList className="w-[18px] h-[18px] text-orange-contrast" aria-hidden />
          <h2 id="missions-title" className="font-bold text-marine-profond text-[15px]">
            Missions de travail
          </h2>
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            {counts.map(({ status, count }) => (
              <BoBadge key={status} tone={STATUS_TONES[status] ?? "neutral"}>
                {WORK_STATUS_LABELS[status]} {count}
              </BoBadge>
            ))}
          </div>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className="h-9 bg-orange-logo hover:bg-orange-sature text-white shadow-orange"
        >
          <Plus className="w-4 h-4 mr-1.5" aria-hidden />
          Nouvelle mission
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gris-bleute/40 hover:bg-gris-bleute/40">
            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gris-texte">Mission</TableHead>
            <TableHead className="hidden md:table-cell text-[11px] font-bold uppercase tracking-wider text-gris-texte">Catégorie</TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gris-texte">Échéance</TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gris-texte">Priorité</TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gris-texte">Statut</TableHead>
            <TableHead className="w-[88px] text-right text-[11px] font-bold uppercase tracking-wider text-gris-texte">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-sm text-gris-texte">
                Aucune mission pour ce client. Créez la première mission de travail.
              </TableCell>
            </TableRow>
          )}
          {rows.map((item) => {
            const late = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== "TERMINE";
            return (
              <TableRow key={item.id} className="group">
                <TableCell className="min-w-0">
                  <p className="font-semibold text-marine-profond text-[13.5px] leading-snug">{item.title}</p>
                  {item.notes && <p className="text-xs text-gris-texte mt-1 leading-snug line-clamp-2">{item.notes}</p>}
                  {item.documentCount > 0 && (
                    <p className="text-[11px] text-orange-contrast font-semibold mt-1">
                      {item.documentCount} document{item.documentCount > 1 ? "s" : ""} rattaché{item.documentCount > 1 ? "s" : ""}
                    </p>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <BoBadge tone="outline">{WORK_CATEGORY_LABELS[item.category] ?? item.category}</BoBadge>
                </TableCell>
                <TableCell>
                  <span className={cn("font-inter text-xs font-bold tabular-nums", late ? "text-red-600" : "text-marine-profond")}>
                    {formatDateFr(item.dueDate)}
                  </span>
                  {late && <span className="block text-[10px] font-bold text-red-600 uppercase">En retard</span>}
                </TableCell>
                <TableCell>
                  <BoBadge tone={PRIORITY_TONES(item.priority)}>{priorityLabel(item.priority)}</BoBadge>
                </TableCell>
                <TableCell>
                  <BoBadge tone={STATUS_TONES[item.status] ?? "neutral"}>{WORK_STATUS_LABELS[item.status] ?? item.status}</BoBadge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gris-texte hover:text-marine-profond"
                      onClick={() => {
                        setEditing(item);
                        setDialogOpen(true);
                      }}
                      aria-label={`Modifier ${item.title}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gris-texte hover:text-red-600"
                      onClick={() => {
                        void boEngine.mutate({
                          id: boEngine.newId("mut"),
                          type: "workItem.delete",
                          createdAt: new Date().toISOString(),
                          payload: { id: item.id },
                        });
                      }}
                      aria-label={`Supprimer ${item.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <WorkItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        clientId={clientId}
        item={editing}
      />
    </section>
  );
}

function WorkItemDialog({
  open,
  onOpenChange,
  clientId,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  item: WorkItemRow | null;
}) {
  const [category, setCategory] = useState(item?.category ?? "TENUE");
  const [status, setStatus] = useState(item?.status ?? "A_FAIRE");
  const [priority, setPriority] = useState(item?.priority ?? "NORMALE");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(fd: FormData) {
    const title = String(fd.get("title") || "").trim();
    if (!title) {
      setError("L'intitulé de la mission est obligatoire.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await boEngine.mutate({
        id: boEngine.newId("mut"),
        type: "workItem.upsert",
        createdAt: new Date().toISOString(),
        payload: {
          id: item?.id ?? boEngine.newId("work"),
          clientId: item ? undefined : clientId,
          title,
          category: String(fd.get("category") || "DIVERS"),
          status: String(fd.get("status") || "A_FAIRE"),
          priority: String(fd.get("priority") || "NORMALE"),
          dueDate: String(fd.get("dueDate") || "") || undefined,
          notes: String(fd.get("notes") || "") || undefined,
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
            {item ? "Modifier la mission" : "Nouvelle mission de travail"}
          </DialogTitle>
          <DialogDescription>
            Tenue comptable, déclaration fiscale, certification, paie, assistance…
            Chaque mission est rattachée au dossier client.
          </DialogDescription>
        </DialogHeader>

        <form
          action={(fd) => {
            void handleSubmit(fd);
          }}
          className="space-y-4"
          key={item?.id ?? "create"}
        >
          {item && <input type="hidden" name="id" value={item.id} />}
          <input type="hidden" name="clientId" value={clientId} />

          <div className="space-y-2">
            <Label htmlFor="w-title">Intitulé de la mission *</Label>
            <Input
              id="w-title"
              name="title"
              required
              defaultValue={item?.title ?? ""}
              placeholder="Ex. DFU — Déclaration Fiscale Unique"
              className="h-10"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="w-category">Catégorie</Label>
              <input type="hidden" name="category" value={category} />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="w-category" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORK_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="w-duedate">Échéance</Label>
              <Input
                id="w-duedate"
                name="dueDate"
                type="date"
                defaultValue={item?.dueDate ? item.dueDate.slice(0, 10) : ""}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="w-status">Statut</Label>
              <input type="hidden" name="status" value={status} />
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="w-status" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FLOW.map((s) => (
                    <SelectItem key={s} value={s}>{WORK_STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="w-priority">Priorité</Label>
              <input type="hidden" name="priority" value={priority} />
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="w-priority" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASSE">Basse</SelectItem>
                  <SelectItem value="NORMALE">Normale</SelectItem>
                  <SelectItem value="HAUTE">Haute</SelectItem>
                  <SelectItem value="URGENTE">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="w-notes">Notes de travail</Label>
            <Textarea
              id="w-notes"
              name="notes"
              defaultValue={item?.notes ?? ""}
              placeholder="Références, pièces attendues, points d'attention…"
              rows={3}
            />
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
              {pending ? "Enregistrement…" : item ? "Enregistrer" : "Créer la mission"}
              {!pending && <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden />}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
