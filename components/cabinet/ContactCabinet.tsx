"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Send, Loader2, CheckCircle2, MessageCircle } from "lucide-react";

// B2B Cabinet Schema
const b2bCabinetSchema = z.object({
  raisonSociale: z.string().min(2, "Le nom ou la raison sociale est requis"),
  whatsapp: z
    .string()
    .min(8, "Numéro WhatsApp invalide")
    .regex(/^[+]?[\d\s\-().]{8,20}$/, "Format de numéro invalide"),
  email: z.string().email("Adresse e-mail invalide"),
  secteur: z.enum(["Entreprise", "ONG", "Startup", "Association", "Indépendant"], {
    required_error: "Veuillez sélectionner votre secteur d'activité",
  }),
  besoin: z.enum(
    [
      "Tenue comptable",
      "Certification",
      "Conseil fiscal",
      "Assistance urgente",
      "Autre",
    ],
    { required_error: "Veuillez sélectionner votre besoin principal" }
  ),
  message: z.string().optional(),
});

type B2BCabinetData = z.infer<typeof b2bCabinetSchema>;

export default function ContactCabinet() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<B2BCabinetData>({
    resolver: zodResolver(b2bCabinetSchema),
    defaultValues: {
      raisonSociale: "",
      whatsapp: "",
      email: "",
      secteur: undefined,
      besoin: undefined,
      message: "",
    },
  });

  const onSubmit = async (data: B2BCabinetData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/contact-cabinet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Une erreur est survenue.");
      }

      setIsSuccess(true);
      reset();
    } catch (err: any) {
      setSubmitError(err.message || "Erreur de réseau. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prefilled WhatsApp message
  const values = watch();
  const getWhatsAppUrl = () => {
    const defaultMsg = `Bonjour Cabinet SERMA,\n\nJe m'appelle ${values.raisonSociale || "[Nom]"}.\nJe cherche : ${values.besoin || "[Besoin]"}.\n\nSecteur : ${values.secteur || "[Secteur]"}.\nMessage : ${values.message || ""}\n\nMon contact : ${values.whatsapp || "[Téléphone]"}`;
    return `https://wa.me/2290140377199?text=${encodeURIComponent(defaultMsg)}`;
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-xl max-w-md mx-auto"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-serma" />
        </div>
        <h3 className="font-playfair text-2xl font-bold text-marine-profond mb-3">
          Demande Reçue !
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          Votre demande a bien été enregistrée. Notre équipe analyse vos informations et vous contactera dans les 24 heures. Un comptable (pas un commercial) prendra contact avec vous.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-all duration-200"
          >
            <MessageCircle className="w-4 h-4 fill-white text-green-500" />
            Nous écrire sur WhatsApp
          </a>
          <button
            onClick={() => setIsSuccess(false)}
            className="text-slate-500 hover:text-marine-profond text-xs font-semibold underline transition-colors"
          >
            Envoyer un autre message
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl max-w-xl mx-auto">
      <h3 className="font-playfair text-2xl font-bold text-marine-profond mb-2">
        Discutons de votre situation
      </h3>
      <p className="text-slate-500 text-sm mb-6 leading-relaxed">
        Décrivez-nous votre besoin en 2 minutes. Notre équipe revient vers vous dans les 24h avec une première analyse.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Raison sociale / Nom complet <span className="text-orange-logo">*</span>
          </label>
          <input
            type="text"
            placeholder="Nom de votre entreprise ou votre nom"
            className={`w-full px-4 py-3 rounded-xl border bg-slate-50 text-marine-profond placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-logo/25 focus:bg-white text-sm transition-all ${
              errors.raisonSociale ? "border-red-500 ring-2 ring-red-500/10" : "border-slate-200 focus:border-orange-logo"
            }`}
            {...register("raisonSociale")}
          />
          {errors.raisonSociale && (
            <span className="text-xs text-red-500 mt-1 block">{errors.raisonSociale.message}</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Téléphone WhatsApp <span className="text-orange-logo">*</span>
            </label>
            <input
              type="tel"
              placeholder="+229 01 XX XX XX XX"
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50 text-marine-profond placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-logo/25 focus:bg-white text-sm transition-all ${
                errors.whatsapp ? "border-red-500 ring-2 ring-red-500/10" : "border-slate-200 focus:border-orange-logo"
              }`}
              {...register("whatsapp")}
            />
            {errors.whatsapp && (
              <span className="text-xs text-red-500 mt-1 block">{errors.whatsapp.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Adresse e-mail <span className="text-orange-logo">*</span>
            </label>
            <input
              type="email"
              placeholder="votre@email.com"
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50 text-marine-profond placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-logo/25 focus:bg-white text-sm transition-all ${
                errors.email ? "border-red-500 ring-2 ring-red-500/10" : "border-slate-200 focus:border-orange-logo"
              }`}
              {...register("email")}
            />
            {errors.email && (
              <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Secteur d&apos;activité <span className="text-orange-logo">*</span>
            </label>
            <select
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50 text-marine-profond focus:outline-none focus:ring-2 focus:ring-orange-logo/25 focus:bg-white text-sm transition-all ${
                errors.secteur ? "border-red-500 ring-2 ring-red-500/10" : "border-slate-200 focus:border-orange-logo"
              }`}
              {...register("secteur")}
            >
              <option value="">Sélectionner...</option>
              <option value="Entreprise">Entreprise</option>
              <option value="ONG">ONG</option>
              <option value="Startup">Startup</option>
              <option value="Association">Association</option>
              <option value="Indépendant">Indépendant</option>
            </select>
            {errors.secteur && (
              <span className="text-xs text-red-500 mt-1 block">{errors.secteur.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Besoin principal <span className="text-orange-logo">*</span>
            </label>
            <select
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50 text-marine-profond focus:outline-none focus:ring-2 focus:ring-orange-logo/25 focus:bg-white text-sm transition-all ${
                errors.besoin ? "border-red-500 ring-2 ring-red-500/10" : "border-slate-200 focus:border-orange-logo"
              }`}
              {...register("besoin")}
            >
              <option value="">Sélectionner...</option>
              <option value="Tenue comptable">Tenue & Organisation comptable</option>
              <option value="Certification">Certification des États Financiers</option>
              <option value="Conseil fiscal">Conseil Fiscal & Social</option>
              <option value="Assistance urgente">Assistance & Déblocage Urgents</option>
              <option value="Autre">Autre besoin</option>
            </select>
            {errors.besoin && (
              <span className="text-xs text-red-500 mt-1 block">{errors.besoin.message}</span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Message / Description du besoin
          </label>
          <textarea
            placeholder="Décrivez brièvement votre situation, vos blocages ou vos objectifs..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-marine-profond placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-logo/25 focus:bg-white text-sm focus:border-orange-logo transition-all resize-none"
            {...register("message")}
          />
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-xs flex items-start gap-2">
            <span className="font-bold">Erreur :</span>
            <span>{submitError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl bg-orange-logo hover:bg-orange-sature text-white font-bold text-sm tracking-wider uppercase inline-flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Traitement en cours...
            </>
          ) : (
            <>
              Envoyer ma demande
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
