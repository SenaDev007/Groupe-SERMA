"use strict";

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Edit3,
  Copy,
  Save,
  FileText,
  Users,
  CheckCircle,
  CreditCard,
  ExternalLink,
  LogOut,
  Download,
  Search,
  Sparkles,
  ArrowLeft,
  X,
  PlusCircle,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";
import { Form, FormField, Submission } from "@/lib/db";

export default function DashboardPage() {
  const router = useRouter();
  
  // State variables
  const [forms, setForms] = useState<Form[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<"submissions" | "forms" | "builder">("submissions");
  const [loadingForms, setLoadingForms] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [savingForm, setSavingForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEntity, setFilterEntity] = useState<"all" | "cabinet" | "academy">("all");
  const [filterForm, setFilterForm] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form Builder state
  const [builderId, setBuilderId] = useState("");
  const [builderTitle, setBuilderTitle] = useState("");
  const [builderDescription, setBuilderDescription] = useState("");
  const [builderEntity, setBuilderEntity] = useState<"cabinet" | "academy">("academy");
  const [builderPrice, setBuilderPrice] = useState<number>(0);
  const [builderPaymentLink, setBuilderPaymentLink] = useState("");
  const [builderFields, setBuilderFields] = useState<FormField[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Modal / Detailed View submission state
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Fetch Forms and Submissions
  const fetchData = async () => {
    try {
      setLoadingForms(true);
      const resForms = await fetch("/api/admin/forms");
      if (resForms.status === 401) {
        router.push("/admin/login");
        return;
      }
      const dataForms = await resForms.json();
      setForms(Array.isArray(dataForms) ? dataForms : []);
    } catch (err) {
      console.error("Error fetching forms:", err);
    } finally {
      setLoadingForms(false);
    }

    try {
      setLoadingSubmissions(true);
      const resSubs = await fetch("/api/admin/submissions");
      if (resSubs.status === 401) {
        router.push("/admin/login");
        return;
      }
      const dataSubs = await resSubs.json();
      setSubmissions(Array.isArray(dataSubs) ? dataSubs : []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      router.push("/admin/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Copy Public link to clipboard
  const handleCopyLink = (formId: string) => {
    const origin = window.location.origin;
    const url = `${origin}/forms/${formId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(formId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Delete Form
  const handleDeleteForm = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce formulaire ? Les inscriptions déjà reçues pour ce formulaire seront conservées.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/forms?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setForms(forms.filter((f) => f.id !== id));
      } else {
        alert("Erreur lors de la suppression du formulaire");
      }
    } catch (err) {
      console.error("Delete form failed:", err);
    }
  };

  // Delete Submission
  const handleDeleteSubmission = async (id: string) => {
    if (!window.confirm("Supprimer définitivement cette inscription ?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/submissions?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSubmissions(submissions.filter((s) => s.id !== id));
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(null);
        }
      } else {
        alert("Erreur lors de la suppression de l'inscription");
      }
    } catch (err) {
      console.error("Delete submission failed:", err);
    }
  };

  // Switch to Form Builder for Edit
  const handleEditForm = (form: Form) => {
    setBuilderId(form.id);
    setBuilderTitle(form.title);
    setBuilderDescription(form.description || "");
    setBuilderEntity(form.entity);
    setBuilderPrice(form.price || 0);
    setBuilderPaymentLink(form.paymentLink || "");
    setBuilderFields(form.fields);
    setIsEditing(true);
    setActiveTab("builder");
  };

  // Switch to Form Builder for Create New
  const handleNewForm = () => {
    setBuilderId("");
    setBuilderTitle("");
    setBuilderDescription("");
    setBuilderEntity("academy");
    setBuilderPrice(0);
    setBuilderPaymentLink("");
    setBuilderFields([
      { id: "nom", label: "Nom de famille", type: "text", required: true, placeholder: "Entrez votre nom" },
      { id: "prenom", label: "Prénoms", type: "text", required: true, placeholder: "Entrez votre prénom" },
      { id: "email", label: "Adresse Email", type: "email", required: true, placeholder: "exemple@serma.com" },
      { id: "whatsapp", label: "Numéro WhatsApp", type: "tel", required: true, placeholder: "Ex: +229 00 00 00 00" }
    ]);
    setIsEditing(false);
    setActiveTab("builder");
  };

  // Field manipulation in Builder
  const handleAddField = (type: FormField["type"]) => {
    const id = `field_${Math.random().toString(36).substr(2, 9)}`;
    const newField: FormField = {
      id,
      label: `Nouveau champ (${type})`,
      type,
      required: false,
      placeholder: "",
      options: ["select", "radio", "checkbox"].includes(type) ? ["Option 1", "Option 2"] : undefined,
    };
    setBuilderFields([...builderFields, newField]);
  };

  const handleUpdateField = (index: number, updatedField: Partial<FormField>) => {
    const updated = [...builderFields];
    updated[index] = { ...updated[index], ...updatedField } as FormField;
    setBuilderFields(updated);
  };

  const handleDeleteField = (index: number) => {
    const updated = [...builderFields];
    updated.splice(index, 1);
    setBuilderFields(updated);
  };

  const handleAddFieldOption = (fieldIndex: number) => {
    const field = builderFields[fieldIndex];
    const options = field.options ? [...field.options, `Option ${field.options.length + 1}`] : ["Option 1"];
    handleUpdateField(fieldIndex, { options });
  };

  const handleUpdateFieldOption = (fieldIndex: number, optionIndex: number, val: string) => {
    const field = builderFields[fieldIndex];
    if (!field.options) return;
    const options = [...field.options];
    options[optionIndex] = val;
    handleUpdateField(fieldIndex, { options });
  };

  const handleDeleteFieldOption = (fieldIndex: number, optionIndex: number) => {
    const field = builderFields[fieldIndex];
    if (!field.options) return;
    const options = field.options.filter((_, idx) => idx !== optionIndex);
    handleUpdateField(fieldIndex, { options });
  };

  // Save Form Builder Configuration
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!builderTitle.trim()) {
      alert("Le titre du formulaire est requis");
      return;
    }

    let slug = builderId.trim() || builderTitle.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    if (!slug) {
      slug = `form-${Date.now()}`;
    }

    setSavingForm(true);

    try {
      const newForm: Form = {
        id: slug,
        title: builderTitle,
        description: builderDescription,
        entity: builderEntity,
        price: builderPrice > 0 ? Number(builderPrice) : undefined,
        paymentLink: builderPaymentLink.trim() || undefined,
        fields: builderFields,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch("/api/admin/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      });

      if (res.ok) {
        alert("Formulaire sauvegardé avec succès !");
        // Reload list and switch
        fetchData();
        setActiveTab("forms");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Une erreur est survenue lors de la sauvegarde.");
      }
    } catch (err) {
      console.error("Save form error:", err);
      alert("Erreur réseau");
    } finally {
      setSavingForm(false);
    }
  };

  // Submissions CSV Export
  const handleExportCSV = () => {
    const filteredSubs = getFilteredSubmissions();
    if (filteredSubs.length === 0) {
      alert("Aucune inscription à exporter.");
      return;
    }

    // Determine all unique data keys to create header columns
    const allKeysSet = new Set<string>();
    filteredSubs.forEach((sub) => {
      Object.keys(sub.data).forEach((k) => allKeysSet.add(k));
    });
    const dataKeys = Array.from(allKeysSet);

    // CSV Headers
    const headers = ["ID Soumission", "Date", "Entité", "Formulaire", ...dataKeys];
    
    // CSV Rows
    const rows = filteredSubs.map((sub) => {
      const row = [
        sub.id,
        new Date(sub.submittedAt).toLocaleDateString("fr-FR") + " " + new Date(sub.submittedAt).toLocaleTimeString("fr-FR"),
        sub.entity === "academy" ? "Academy" : "Cabinet",
        sub.formTitle,
        ...dataKeys.map((key) => {
          const val = sub.data[key];
          if (val === undefined || val === null) return "";
          if (Array.isArray(val)) return `"${val.join(", ").replace(/"/g, '""')}"`;
          return `"${String(val).replace(/"/g, '""')}"`;
        }),
      ];
      return row.join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n"); // Byte Order Mark for Excel UTF-8 support
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inscriptions_serma_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to filter submissions based on UI settings
  const getFilteredSubmissions = () => {
    return submissions.filter((sub) => {
      const matchSearch =
        searchQuery === "" ||
        sub.formTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Object.values(sub.data).some((val) =>
          String(val).toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchEntity = filterEntity === "all" || sub.entity === filterEntity;
      const matchForm = filterForm === "all" || sub.formId === filterForm;

      return matchSearch && matchEntity && matchForm;
    });
  };

  return (
    <div className="min-h-screen bg-[#05091a] text-white flex flex-col font-sans">
      {/* Top Professional Header Banner */}
      <header className="bg-[#0b1527] border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-md relative z-20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-[#0d1a3a] to-[#060d1f] rounded-lg border border-white/5">
            <Sparkles className="h-6 w-6 text-[#F59B1E]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">
              GROUPE <span className="text-[#F59B1E]">SERMA</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-[#2BA96B] font-bold">
              Console d'Administration
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline-block text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-gray-400">
            Connecté en tant que <strong className="text-white">Admin</strong>
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 rounded-lg text-sm transition-all cursor-pointer font-semibold"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-[#070e1b] md:border-r border-white/10 p-4 space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
          <button
            onClick={() => setActiveTab("submissions")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm whitespace-nowrap cursor-pointer ${
              activeTab === "submissions"
                ? "bg-[#F59B1E] text-white shadow-lg shadow-[#F59B1E]/10"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Suivi Inscriptions ({submissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("forms")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm whitespace-nowrap cursor-pointer ${
              activeTab === "forms"
                ? "bg-[#F59B1E] text-white shadow-lg shadow-[#F59B1E]/10"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Formulaires Custom ({forms.length})</span>
          </button>

          <button
            onClick={handleNewForm}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl border border-dashed transition-all font-medium text-sm whitespace-nowrap cursor-pointer ${
              activeTab === "builder" && !isEditing
                ? "bg-[#2BA96B] border-transparent text-white"
                : "border-white/10 text-[#2BA96B] hover:bg-[#2BA96B]/5"
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Créer un Formulaire</span>
          </button>
        </aside>

        {/* Dashboard Panels */}
        <main className="flex-1 p-4 md:p-8 bg-[#05091a] overflow-y-auto">
          {/* TAB 1: SUBMISSIONS LIST */}
          {activeTab === "submissions" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Liste des Inscriptions</h2>
                  <p className="text-sm text-gray-400">
                    Gérez et suivez les participants inscrits à vos formations.
                  </p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#2BA96B] to-[#1e784b] hover:from-[#35c37d] hover:to-[#228f58] rounded-xl text-sm font-semibold transition-all shadow-md cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Exporter CSV</span>
                </button>
              </div>

              {/* Filters toolbar */}
              <div className="bg-[#0b1527] border border-white/5 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs text-gray-400 font-medium">Recherche</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Nom, email, whatsapp, contenu..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[#060d1f] border border-white/5 focus:border-[#F59B1E]/30 rounded-xl text-sm placeholder-gray-500 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-medium">Entité SERMA</label>
                  <select
                    value={filterEntity}
                    onChange={(e) => setFilterEntity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#060d1f] border border-white/5 focus:border-[#F59B1E]/30 rounded-xl text-sm text-white focus:outline-none"
                  >
                    <option value="all">Toutes les entités</option>
                    <option value="academy">SERMA Academy</option>
                    <option value="cabinet">Cabinet SERMA</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-medium">Par Formulaire</label>
                  <select
                    value={filterForm}
                    onChange={(e) => setFilterForm(e.target.value)}
                    className="w-full px-3 py-2 bg-[#060d1f] border border-white/5 focus:border-[#F59B1E]/30 rounded-xl text-sm text-white focus:outline-none"
                  >
                    <option value="all">Tous les formulaires</option>
                    <option value="academy-inscription-free">Inscription Gratuite - Academy</option>
                    <option value="cabinet-inscription-caissier">Inscription Caissier - Cabinet</option>
                    {forms.map((form) => (
                      <option key={form.id} value={form.id}>
                        {form.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submissions Table */}
              {loadingSubmissions ? (
                <div className="flex flex-col items-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent border-[#F59B1E]" />
                  <p className="text-xs text-gray-400 mt-4">Chargement des inscriptions...</p>
                </div>
              ) : getFilteredSubmissions().length === 0 ? (
                <div className="bg-[#0b1527]/50 border border-dashed border-white/10 rounded-2xl p-12 text-center">
                  <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white">Aucune inscription trouvée</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Les inscriptions apparaîtront ici dès qu'un utilisateur soumettra un formulaire.
                  </p>
                </div>
              ) : (
                <div className="bg-[#0b1527] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#060d1f] border-b border-white/10">
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Entité</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Formulaire</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Participant / Contact</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {getFilteredSubmissions().map((sub) => {
                          const contactName = `${sub.data.prenom || ""} ${sub.data.nom || ""}`.trim() || sub.data.name || sub.data.Name || "Inconnu";
                          const contactEmail = sub.data.email || sub.data.Email || "";
                          const contactPhone = sub.data.whatsapp || sub.data.phone || sub.data.Phone || sub.data.tel || "";

                          return (
                            <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                                {new Date(sub.submittedAt).toLocaleDateString("fr-FR")}
                                <span className="block text-[10px] text-gray-500">
                                  {new Date(sub.submittedAt).toLocaleTimeString("fr-FR")}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    sub.entity === "academy"
                                      ? "bg-[#2BA96B]/15 text-[#2BA96B]"
                                      : "bg-[#F59B1E]/15 text-[#F59B1E]"
                                  }`}
                                >
                                  {sub.entity === "academy" ? "Academy" : "Cabinet"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-white max-w-[200px] truncate">
                                {sub.formTitle}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span className="font-bold text-gray-200 block">{contactName}</span>
                                <span className="text-xs text-gray-400 block">{contactPhone || contactEmail}</span>
                              </td>
                              <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                                <button
                                  onClick={() => setSelectedSubmission(sub)}
                                  className="inline-flex items-center justify-center p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors cursor-pointer"
                                  title="Détails"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubmission(sub.id)}
                                  className="inline-flex items-center justify-center p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FORMS LIST */}
          {activeTab === "forms" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Formulaires Personnalisés</h2>
                  <p className="text-sm text-gray-400">
                    Créez, modifiez et partagez des formulaires dynamiques de formation ou d'inscription.
                  </p>
                </div>
                <button
                  onClick={handleNewForm}
                  className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#F59B1E] hover:bg-[#e07f0a] rounded-xl text-sm font-semibold transition-all shadow-md cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nouveau Formulaire</span>
                </button>
              </div>

              {loadingForms ? (
                <div className="flex flex-col items-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent border-[#F59B1E]" />
                  <p className="text-xs text-gray-400 mt-4">Chargement des formulaires...</p>
                </div>
              ) : forms.length === 0 ? (
                <div className="bg-[#0b1527]/50 border border-dashed border-white/10 rounded-2xl p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white">Aucun formulaire personnalisé</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Créez votre tout premier formulaire d'inscription sur mesure en cliquant sur le bouton ci-dessus.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {forms.map((form) => (
                    <div
                      key={form.id}
                      className="bg-[#0b1527] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-white/10 transition-all duration-200 group relative"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              form.entity === "academy"
                                ? "bg-[#2BA96B]/15 text-[#2BA96B]"
                                : "bg-[#F59B1E]/15 text-[#F59B1E]"
                            }`}
                          >
                            {form.entity === "academy" ? "Academy" : "Cabinet"}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {form.fields.length} champs
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-[#F59B1E] transition-colors truncate">
                            {form.title}
                          </h3>
                          <p className="text-xs text-gray-400 line-clamp-2 mt-1 min-h-[2rem]">
                            {form.description || "Aucune description fournie."}
                          </p>
                        </div>

                        {form.price ? (
                          <div className="flex items-center space-x-2 text-xs bg-white/5 border border-white/10 py-1.5 px-3 rounded-lg w-fit">
                            <CreditCard className="h-3.5 w-3.5 text-[#F59B1E]" />
                            <span className="font-semibold text-gray-200">
                              {form.price.toLocaleString("fr-FR")} FCFA
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-xs bg-white/5 border border-white/10 py-1.5 px-3 rounded-lg w-fit">
                            <CheckCircle className="h-3.5 w-3.5 text-[#2BA96B]" />
                            <span className="font-semibold text-[#2BA96B]">Gratuit</span>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-white/5 pt-4 mt-6 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleCopyLink(form.id)}
                          className={`flex-1 flex items-center justify-center space-x-1 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                            copiedId === form.id
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/35"
                              : "bg-[#060d1f] text-gray-300 border-white/5 hover:bg-white/5"
                          }`}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>{copiedId === form.id ? "Copié !" : "Lien public"}</span>
                        </button>

                        <button
                          onClick={() => handleEditForm(form)}
                          className="p-2 bg-[#060d1f] hover:bg-white/5 text-[#F59B1E] border border-white/5 rounded-lg transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteForm(form.id)}
                          className="p-2 bg-[#060d1f] hover:bg-red-500/10 text-red-400 border border-white/5 hover:border-red-500/20 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Launch public view link in new tab */}
                      <a
                        href={`/forms/${form.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute top-4 right-4 p-1.5 bg-[#060d1f] hover:bg-[#F59B1E]/10 border border-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
                        title="Ouvrir dans un nouvel onglet"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DYNAMIC FORM BUILDER */}
          {activeTab === "builder" && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveTab("forms")}
                  className="p-2 bg-[#0b1527] border border-white/5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {isEditing ? `Modifier : ${builderTitle}` : "Nouveau Formulaire"}
                  </h2>
                  <p className="text-sm text-gray-400">
                    Définissez la structure, le tarif et les champs du formulaire.
                  </p>
                </div>
              </div>

              {/* Builder Content: Settings and preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* Left Panel: Settings Form */}
                <form onSubmit={handleSaveForm} className="space-y-6 bg-[#0b1527] border border-white/5 p-6 rounded-2xl">
                  <h3 className="text-md font-bold text-[#F59B1E] flex items-center space-x-2 pb-3 border-b border-white/5">
                    <Settings className="h-4 w-4" />
                    <span>Configuration Générale</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Slug ID (Editable only if creating new) */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        Identifiant Unique (Lien / Slug)
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isEditing}
                        placeholder="Ex: formation-audit (sans espaces)"
                        value={builderId}
                        onChange={(e) => setBuilderId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        className="w-full px-4 py-2.5 bg-[#060d1f] disabled:opacity-50 border border-white/5 focus:border-[#F59B1E]/30 rounded-xl text-sm text-white focus:outline-none"
                      />
                      {!isEditing && (
                        <p className="text-[10px] text-gray-500">
                          Ce slug servira d'URL d'accès : /forms/{"{"}slug{"}"}
                        </p>
                      )}
                    </div>

                    {/* Title */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        Titre du Formulaire
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Formation en Comptabilité Pratique"
                        value={builderTitle}
                        onChange={(e) => setBuilderTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#060d1f] border border-white/5 focus:border-[#F59B1E]/30 rounded-xl text-sm text-white focus:outline-none"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        Description / Consignes
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Fournissez des détails ou des instructions aux participants..."
                        value={builderDescription}
                        onChange={(e) => setBuilderDescription(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#060d1f] border border-white/5 focus:border-[#F59B1E]/30 rounded-xl text-sm text-white focus:outline-none"
                      />
                    </div>

                    {/* Target Entity */}
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        Entité Cible
                      </label>
                      <select
                        value={builderEntity}
                        onChange={(e) => setBuilderEntity(e.target.value as any)}
                        className="w-full px-4 py-2.5 bg-[#060d1f] border border-white/5 focus:border-[#F59B1E]/30 rounded-xl text-sm text-white focus:outline-none"
                      >
                        <option value="academy">SERMA Academy</option>
                        <option value="cabinet">Cabinet SERMA</option>
                      </select>
                    </div>

                    {/* Price */}
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        Tarif (FCFA) - Optionnel
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 15000 (0 pour gratuit)"
                        value={builderPrice || ""}
                        onChange={(e) => setBuilderPrice(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-[#060d1f] border border-white/5 focus:border-[#F59B1E]/30 rounded-xl text-sm text-white focus:outline-none"
                      />
                    </div>

                    {/* Payment link (FedaPay etc) */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        Lien de Paiement Intégré (FedaPay, etc) - Optionnel
                      </label>
                      <input
                        type="url"
                        placeholder="Ex: https://kkiapay.me/c/... ou lien FedaPay"
                        value={builderPaymentLink}
                        onChange={(e) => setBuilderPaymentLink(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#060d1f] border border-white/5 focus:border-[#F59B1E]/30 rounded-xl text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Fields Builder */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#F59B1E] uppercase tracking-wider">
                        Champs du Formulaire ({builderFields.length})
                      </h4>
                      
                      {/* Add field drop down button */}
                      <div className="flex flex-wrap gap-2">
                        {["text", "email", "tel", "number", "textarea", "select", "radio", "checkbox"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleAddField(type as any)}
                            className="px-2.5 py-1 bg-white/5 hover:bg-[#F59B1E]/10 border border-white/10 text-gray-300 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                          >
                            + {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Field editor items list */}
                    {builderFields.length === 0 ? (
                      <div className="p-8 text-center bg-[#060d1f] border border-dashed border-white/5 rounded-xl text-gray-500 text-xs">
                        Aucun champ personnalisé configuré. Utilisez les boutons ci-dessus pour ajouter des champs.
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                        {builderFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="p-4 bg-[#060d1f] border border-white/5 rounded-xl space-y-3 relative group"
                          >
                            {/* Header row: field type badge & actions */}
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 bg-[#2BA96B]/15 text-[#2BA96B] rounded text-[10px] font-bold uppercase tracking-wider">
                                Champ #{index + 1} : {field.type}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleDeleteField(index)}
                                className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors cursor-pointer"
                                title="Supprimer ce champ"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Label & Required Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="md:col-span-2 space-y-1">
                                <label className="text-[10px] text-gray-400 font-bold uppercase">
                                  Libellé (Question)
                                </label>
                                <input
                                  type="text"
                                  value={field.label}
                                  onChange={(e) => handleUpdateField(index, { label: e.target.value })}
                                  className="w-full px-3 py-1.5 bg-[#0b1527] border border-white/5 focus:border-[#F59B1E]/30 rounded-lg text-xs text-white focus:outline-none"
                                />
                              </div>

                              <div className="space-y-2 flex flex-col justify-end">
                                <label className="inline-flex items-center space-x-2 text-xs font-semibold cursor-pointer text-gray-300">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => handleUpdateField(index, { required: e.target.checked })}
                                    className="rounded border-white/10 bg-[#0b1527] text-[#F59B1E] focus:ring-0"
                                  />
                                  <span>Obligatoire</span>
                                </label>
                              </div>
                            </div>

                            {/* Placeholder (optional, text/email/tel/textarea) */}
                            {["text", "email", "tel", "number", "textarea"].includes(field.type) && (
                              <div className="space-y-1">
                                <label className="text-[10px] text-gray-400 font-bold uppercase">
                                  Texte indicatif (Placeholder)
                                </label>
                                <input
                                  type="text"
                                  value={field.placeholder || ""}
                                  onChange={(e) => handleUpdateField(index, { placeholder: e.target.value })}
                                  placeholder="Entrez votre réponse..."
                                  className="w-full px-3 py-1.5 bg-[#0b1527] border border-white/5 focus:border-[#F59B1E]/30 rounded-lg text-xs text-white focus:outline-none"
                                />
                              </div>
                            )}

                            {/* Options Configuration (select, radio, checkbox) */}
                            {["select", "radio", "checkbox"].includes(field.type) && (
                              <div className="space-y-2 pt-2 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-gray-400 font-bold uppercase">
                                    Options de choix
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleAddFieldOption(index)}
                                    className="text-[10px] font-bold text-[#F59B1E] hover:underline cursor-pointer"
                                  >
                                    + Ajouter une option
                                  </button>
                                </div>

                                <div className="space-y-1.5">
                                  {field.options?.map((opt, optIndex) => (
                                    <div key={optIndex} className="flex items-center space-x-2">
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => handleUpdateFieldOption(index, optIndex, e.target.value)}
                                        className="flex-1 px-3 py-1 bg-[#0b1527] border border-white/5 focus:border-[#F59B1E]/30 rounded-lg text-xs text-white focus:outline-none"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteFieldOption(index, optIndex)}
                                        className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors cursor-pointer"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions row */}
                  <div className="pt-6 border-t border-white/5 flex items-center space-x-4">
                    <button
                      type="submit"
                      disabled={savingForm}
                      className="flex-1 py-3 px-6 bg-gradient-to-r from-[#F59B1E] to-[#C86E09] hover:from-[#ffaa33] hover:to-[#e07f0a] disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Save className="h-4 w-4" />
                      <span>{savingForm ? "Sauvegarde..." : "Enregistrer le Formulaire"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("forms")}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors font-medium cursor-pointer"
                    >
                      Annuler
                    </button>
                  </div>
                </form>

                {/* Right Panel: Live Mobile-Like Preview */}
                <div className="space-y-4 lg:sticky lg:top-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                      Aperçu Public en Direct
                    </h3>
                    <span className="text-[10px] text-gray-500">
                      Formulaire réactif dynamique
                    </span>
                  </div>

                  <div className="bg-[#0b1527] border-4 border-[#070e1b] rounded-[36px] shadow-2xl overflow-hidden max-w-sm mx-auto h-[600px] flex flex-col">
                    {/* Simulator top camera notch */}
                    <div className="bg-[#070e1b] py-2 flex justify-center">
                      <div className="w-16 h-4 bg-black rounded-full" />
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#05091a]">
                      {/* Sim Header */}
                      <div className="text-center space-y-2 border-b border-white/5 pb-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            builderEntity === "academy"
                              ? "bg-[#2BA96B]/15 text-[#2BA96B]"
                              : "bg-[#F59B1E]/15 text-[#F59B1E]"
                          }`}
                        >
                          {builderEntity === "academy" ? "SERMA ACADEMY" : "CABINET SERMA"}
                        </span>
                        <h4 className="text-md font-extrabold text-white leading-tight">
                          {builderTitle || "Titre du Formulaire"}
                        </h4>
                        {builderDescription && (
                          <p className="text-[10px] text-gray-400 line-clamp-3">
                            {builderDescription}
                          </p>
                        )}
                      </div>

                      {/* Sim Pricing details */}
                      <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex items-center justify-between text-xs">
                        <span className="text-gray-400">Frais de participation:</span>
                        <span className="font-bold text-[#F59B1E]">
                          {builderPrice > 0 ? `${builderPrice.toLocaleString("fr-FR")} FCFA` : "Gratuit"}
                        </span>
                      </div>

                      {/* Sim Form fields */}
                      <div className="space-y-4">
                        {builderFields.map((field) => (
                          <div key={field.id} className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-300">
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>

                            {/* Render fields differently based on type */}
                            {["text", "email", "tel", "number"].includes(field.type) && (
                              <input
                                type={field.type}
                                placeholder={field.placeholder || "Entrez votre texte"}
                                disabled
                                className="w-full px-3 py-2 bg-[#060d1f] border border-white/5 rounded-lg text-xs placeholder-gray-600 disabled:opacity-80"
                              />
                            )}

                            {field.type === "textarea" && (
                              <textarea
                                placeholder={field.placeholder || "Tapez votre réponse..."}
                                disabled
                                className="w-full px-3 py-2 bg-[#060d1f] border border-white/5 rounded-lg text-xs placeholder-gray-600 disabled:opacity-80"
                                rows={2}
                              />
                            )}

                            {field.type === "select" && (
                              <select
                                disabled
                                className="w-full px-3 py-2 bg-[#060d1f] border border-white/5 rounded-lg text-xs text-gray-400 disabled:opacity-80"
                              >
                                <option>Choisir une option...</option>
                                {field.options?.map((opt, i) => (
                                  <option key={i}>{opt}</option>
                                ))}
                              </select>
                            )}

                            {field.type === "radio" && (
                              <div className="space-y-1">
                                {field.options?.map((opt, i) => (
                                  <label key={i} className="flex items-center space-x-2 text-[10px] text-gray-400">
                                    <input type="radio" disabled name={field.id} className="text-[#F59B1E]" />
                                    <span>{opt}</span>
                                  </label>
                                ))}
                              </div>
                            )}

                            {field.type === "checkbox" && (
                              <div className="space-y-1">
                                {field.options?.map((opt, i) => (
                                  <label key={i} className="flex items-center space-x-2 text-[10px] text-gray-400">
                                    <input type="checkbox" disabled className="text-[#F59B1E] rounded" />
                                    <span>{opt}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Sim Submit Button */}
                      <button
                        type="button"
                        disabled
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-[#F59B1E] to-[#C86E09] text-white font-bold text-xs rounded-lg opacity-80"
                      >
                        Soumettre la demande
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: SUBMISSION DETAIL MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b1527] border border-white/10 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Détails de l'Inscription</h3>
                <p className="text-xs text-gray-400">
                  Soumise le {new Date(selectedSubmission.submittedAt).toLocaleString("fr-FR")}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Info details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Form & Entity Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#060d1f] p-3 border border-white/5 rounded-xl">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Formulaire</span>
                  <span className="text-sm font-semibold text-white mt-1 block truncate">
                    {selectedSubmission.formTitle}
                  </span>
                </div>
                <div className="bg-[#060d1f] p-3 border border-white/5 rounded-xl">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Entité Cible</span>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 ${
                      selectedSubmission.entity === "academy"
                        ? "bg-[#2BA96B]/15 text-[#2BA96B]"
                        : "bg-[#F59B1E]/15 text-[#F59B1E]"
                    }`}
                  >
                    {selectedSubmission.entity === "academy" ? "SERMA Academy" : "Cabinet SERMA"}
                  </span>
                </div>
              </div>

              {/* Data Table */}
              <div className="space-y-3">
                <h4 className="text-xs text-[#F59B1E] font-bold uppercase tracking-wider">
                  Champs Remplis
                </h4>
                <div className="border border-white/5 rounded-xl overflow-hidden bg-[#060d1f]">
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-white/5">
                      {Object.entries(selectedSubmission.data).map(([key, val]) => (
                        <tr key={key}>
                          <td className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider bg-white/[0.01] w-2/5">
                            {key}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-200">
                            {Array.isArray(val) ? (
                              <div className="flex flex-wrap gap-1">
                                {val.map((v, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-white/5 rounded text-xs text-white">
                                    {v}
                                  </span>
                                ))}
                              </div>
                            ) : typeof val === "boolean" ? (
                              val ? "Oui" : "Non"
                            ) : (
                              String(val)
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer action buttons */}
            <div className="p-6 border-t border-white/5 flex items-center justify-end space-x-2">
              {/* If whatsapp is present, provide direct click to chat */}
              {selectedSubmission.data.whatsapp && (
                <a
                  href={`https://wa.me/${String(selectedSubmission.data.whatsapp).replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-sm font-semibold transition-all flex items-center space-x-2"
                >
                  <span>Contacter WhatsApp</span>
                </a>
              )}
              
              <button
                onClick={() => handleDeleteSubmission(selectedSubmission.id)}
                className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
