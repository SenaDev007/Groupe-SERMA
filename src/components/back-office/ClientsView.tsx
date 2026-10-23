"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useBoData } from "@/hooks/useBoData";
import { boEngine } from "@/lib/offline/engine";
import { deriveClientRows, type ClientRow } from "@/lib/back-office/derive";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  HeartHandshake,
  Building2,
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "ONG", label: "Dossiers ONG", icon: HeartHandshake, hint: "Organisations non gouvernementales et projets financés par bailleurs" },
  { value: "ENTREPRISE", label: "Autres clients", icon: Building2, hint: "Entreprises, startups, commerces et professions libérales" },
] as const;

export function ClientsView({
  clients,
  initialTab,
}: {
  clients: ClientRow[];
  initialTab: "ONG" | "ENTREPRISE";
}) {
  const bo = useBoData();
  const [tab, setTab] = useState<"ONG" | "ENTREPRISE">(initialTab);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ClientRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClientRow | null>(null);

  // Store offline-first : données locales (IndexedDB) dès que prêt,
  // sinon props du rendu serveur (premier affichage instantané).
  const rows = useMemo(
    () => (bo.ready && bo.snapshot ? deriveClientRows(bo.snapshot) : clients),
    [bo.ready, bo.snapshot, clients]
  );

  const filtered = rows.filter((c) => c.type === tab);
  const activeTab = TABS.find((t) => t.value === tab)!;

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(client: ClientRow) {
    setEditing(client);
    setDialogOpen(true);
  }

  return (
    <div>
      {/* Onglets — distinction fondamentale ONG / autres clients */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {TABS.map((t) => {
          const Icon = t.icon;
          const count = clients.filter((c) => c.type === t.value).length;
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              aria-pressed={active}
              className={cn(
                "flex items-center gap-4 rounded-xl border p-4 text-left transition-colors",
                active
                  ? "border-orange-logo/60 bg-white shadow-[0_4px_18px_rgba(224,127,10,0.12)]"
                  : "border-marine-profond/[0.08] bg-white/70 hover:border-marine-profond/20"
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-11 h-11 rounded-xl shrink-0",
                  active ? "bg-orange-logo text-white shadow-orange-sm" : "bg-marine-profond/[0.06] text-marine-profond/60"
                )}
              >
                <Icon className="w-5 h-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-bold text-marine-profond text-[15px]">
                  {t.label}
                  <span className={cn("font-inter text-[11px] px-2 py-0.5 rounded-full", active ? "bg-orange-logo/10 text-orange-contrast" : "bg-marine-profond/[0.06] text-gris-texte")}>
                    {count}
                  </span>
                </span>
                <span className="block text-xs text-gris-texte mt-1 leading-snug">{t.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* En-tête d'action */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-sm text-gris-texte">
          <strong className="text-marine-profond">{filtered.length}</strong>{" "}
          {filtered.length > 1 ? "dossiers" : "dossier"} — {activeTab.label.toLowerCase()}
        </p>
        <Button onClick={openCreate} className="h-10 bg-orange-logo hover:bg-orange-sature text-white shadow-orange">
          <Plus className="w-4 h-4 mr-1.5" aria-hidden />
          Nouveau {tab === "ONG" ? "ONG" : "client"}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-marine-profond/[0.07] bg-white shadow-[0_2px_12px_rgba(12,25,61,0.05)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gris-bleute/70 hover:bg-gris-bleute/70">
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gris-texte">Client</TableHead>
              <TableHead className="hidden md:table-cell text-[11px] font-bold uppercase tracking-wider text-gris-texte">Secteur</TableHead>
              <TableHead className="hidden lg:table-cell text-[11px] font-bold uppercase tracking-wider text-gris-texte">Contact</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gris-texte">Fichiers</TableHead>
              <TableHead className="hidden sm:table-cell text-[11px] font-bold uppercase tracking-wider text-gris-texte">Missions actives</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gris-texte">Statut</TableHead>
              <TableHead className="w-[104px] text-right text-[11px] font-bold uppercase tracking-wider text-gris-texte">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-gris-texte">
                  Aucun dossier {tab === "ONG" ? "ONG" : "client"} pour le moment. Créez le premier pour organiser ses travaux.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((c) => {
              const foldersCount = (bo.ready && bo.snapshot
                ? bo.snapshot.folders.filter((f) => f.clientId === c.id).length
                : c.foldersCount) ?? 0;
              return (
              <TableRow key={c.id} className="group">
                <TableCell>
                  <Link href={`/back-office/cabinet/clients/${c.id}`} className="flex items-center gap-3 min-w-0 hover:text-orange-contrast">
                    <span
                      className={cn(
                        "flex items-center justify-center w-9 h-9 rounded-lg shrink-0 font-inter text-xs font-extrabold",
                        c.type === "ONG" ? "bg-vert-tech/10 text-[#256b4d]" : "bg-marine-profond/[0.06] text-marine-profond/70"
                      )}
                    >
                      {c.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-marine-profond truncate group-hover:text-orange-contrast transition-colors">
                        {c.name}
                      </span>
                      <span className="block text-xs text-gris-texte mt-0.5 truncate">
                        {c.taxId || "IFU non renseigné"} · créé le {formatDateFr(c.createdAt)}
                      </span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell text-[13px] text-gris-texte">{c.sector || "—"}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="block text-[13px] text-marine-profond font-medium">{c.contactName || "—"}</span>
                  <span className="block text-xs text-gris-texte mt-0.5">{c.phone || c.email || "—"}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span className="font-inter text-sm font-bold text-marine-profond tabular-nums">{c.documentsCount}</span>
                    <span className="text-[11px] text-gris-texte">· {foldersCount} dossier{foldersCount > 1 ? "s" : ""}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className={cn("font-inter text-sm font-bold tabular-nums", c.activeMissions > 0 ? "text-orange-contrast" : "text-gris-texte")}>
                    {c.activeMissions}
                  </span>
                </TableCell>
                <TableCell>
                  <BoBadge tone={STATUS_TONES[c.status] ?? "neutral"}>
                    {c.status === "ACTIF" ? "Actif" : c.status === "SUSPENDU" ? "Suspendu" : "Archivé"}
                  </BoBadge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gris-texte hover:text-marine-profond"
                      onClick={() => openEdit(c)}
                      aria-label={`Modifier ${c.name}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gris-texte hover:text-red-600"
                      onClick={() => setDeleteTarget(c)}
                      aria-label={`Supprimer ${c.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-orange-contrast hover:text-orange-logo">
                      <Link href={`/back-office/cabinet/clients/${c.id}`} aria-label={`Ouvrir le dossier ${c.name}`}>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Dialogue création / édition */}
      <ClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={editing}
        defaultType={tab}
      />

      {/* Confirmation suppression */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce dossier ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le dossier « {deleteTarget?.name} » sera définitivement supprimé, avec tous ses
              dossiers, sous-dossiers, fichiers et missions. Cette action est irréversible.
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
                    // Application locale immédiate + file de synchro
                    // (la base distante est mise à jour dès que possible)
                    void boEngine.mutate({
                      id: boEngine.newId("mut"),
                      type: "client.delete",
                      createdAt: new Date().toISOString(),
                      payload: { id },
                    });
                  }}
                >
                  Supprimer définitivement
                </Button>
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ClientDialog({
  open,
  onOpenChange,
  client,
  defaultType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientRow | null;
  defaultType: "ONG" | "ENTREPRISE";
}) {
  const [type, setType] = useState<string>(client?.type ?? defaultType);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const name = String(formData.get("name") || "").trim();
    if (!name) {
      setError("Le nom du client est obligatoire.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const id = client?.id ?? boEngine.newId("cli");
      await boEngine.mutate({
        id: boEngine.newId("mut"),
        type: "client.upsert",
        createdAt: new Date().toISOString(),
        payload: {
          id,
          name,
          type: String(formData.get("type") || "ENTREPRISE"),
          sector: String(formData.get("sector") || "") || undefined,
          contactName: String(formData.get("contactName") || "") || undefined,
          email: String(formData.get("email") || "") || undefined,
          phone: String(formData.get("phone") || "") || undefined,
          address: String(formData.get("address") || "") || undefined,
          taxId: String(formData.get("taxId") || "") || undefined,
          notes: String(formData.get("notes") || "") || undefined,
          status: String(formData.get("status") || "ACTIF"),
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
            {client ? `Modifier — ${client.name}` : "Nouveau dossier client"}
          </DialogTitle>
          <DialogDescription>
            {client
              ? "Mettez à jour la fiche du client. Les dossiers et missions sont conservés."
              : "Créez la fiche du client : son espace de fichiers s'ouvre immédiatement, prêt à recevoir vos dossiers."}
          </DialogDescription>
        </DialogHeader>

        <form
          action={(fd) => {
            void handleSubmit(fd);
          }}
          className="space-y-4"
          key={client?.id ?? "create"}
        >
          {client && <input type="hidden" name="id" value={client.id} />}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="c-name">Nom / Raison sociale *</Label>
              <Input id="c-name" name="name" required defaultValue={client?.name ?? ""} placeholder="Ex. ONG Santé Aloma" className="h-10" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-type">Catégorie *</Label>
              <input type="hidden" name="type" value={type} />
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="c-type" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONG">
                    <span className="flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-[#256b4d]" aria-hidden /> ONG &amp; projets
                    </span>
                  </SelectItem>
                  <SelectItem value="ENTREPRISE">
                    <span className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-marine-profond/70" aria-hidden /> Autre client (entreprise)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-sector">Secteur d&apos;activité</Label>
              <Input id="c-sector" name="sector" defaultValue={client?.sector ?? ""} placeholder="Santé, Éducation, Commerce…" className="h-10" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-contact">Personne de contact</Label>
              <Input id="c-contact" name="contactName" defaultValue={client?.contactName ?? ""} placeholder="Nom du dirigeant / DAF" className="h-10" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-taxid">IFU / N° contribuable</Label>
              <Input id="c-taxid" name="taxId" defaultValue={client?.taxId ?? ""} placeholder="IFU-XXXXXXXX" className="h-10" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-email">E-mail</Label>
              <Input id="c-email" name="email" type="email" defaultValue={client?.email ?? ""} placeholder="contact@organisation.org" className="h-10" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-phone">Téléphone</Label>
              <Input id="c-phone" name="phone" type="tel" defaultValue={client?.phone ?? ""} placeholder="+229 01 …" className="h-10" />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="c-address">Adresse</Label>
              <Input id="c-address" name="address" defaultValue={client?.address ?? ""} placeholder="Quartier, ville" className="h-10" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-status">Statut</Label>
              <Select name="status" defaultValue={client?.status ?? "ACTIF"}>
                <SelectTrigger id="c-status" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIF">Actif</SelectItem>
                  <SelectItem value="SUSPENDU">Suspendu</SelectItem>
                  <SelectItem value="ARCHIVE">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="c-notes">Notes internes</Label>
              <Textarea id="c-notes" name="notes" defaultValue={client?.notes ?? ""} placeholder="Bailleurs, spécificités, conventions…" rows={3} />
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
              {pending ? "Enregistrement…" : client ? "Enregistrer les modifications" : "Créer le dossier"}
              {!pending && <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden />}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
