"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { b2bCabinetSchema, type B2BCabinetData } from "@/lib/validations";
import { motion } from "framer-motion";
import { Send, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";
import {
  buildWhatsAppUrl,
  WHATSAPP_MESSAGES,
} from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

/**
 * Formulaire B2B Cabinet — prise de rendez-vous.
 * Panneau glass premium, validation Zod, WhatsApp pré-rempli,
 * tracking GA4 (form_start, rdv_cabinet_submitted).
 */
export default function ContactCabinet() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<B2BCabinetData | null>(null);
  const startedRef = useRef(false);

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

  // GA4 — form_start dès le premier champ renseigné (CDC §7.3)
  useEffect(() => {
    const subscription = watch(() => {
      if (!startedRef.current) {
        startedRef.current = true;
        trackEvent("form_start", { form: "contact_cabinet" });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

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

      // GA4 — conversion principale Cabinet (CDC §7.3)
      trackEvent("rdv_cabinet_submitted", { besoin: data.besoin });

      setSubmittedData(data);
      setIsSuccess(true);
      reset();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur de réseau. Veuillez réessayer.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Message WhatsApp pré-rempli — construit depuis les données soumises
  // (template micro-copy du copywriting, section Cabinet)
  const getWhatsAppUrl = () => {
    const d = submittedData;
    const msg = d
      ? WHATSAPP_MESSAGES.cabinetRdv(
          d.raisonSociale,
          d.besoin,
          d.message,
          d.whatsapp
        )
      : WHATSAPP_MESSAGES.cabinet;
    return buildWhatsAppUrl(msg);
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3.5 rounded-xl border bg-gris-bleute/60 text-marine-profond placeholder-gris-texte/50 focus:outline-none focus:ring-2 focus:ring-orange-logo/25 focus:bg-white text-sm transition-all ${
      hasError
        ? "border-red-400 ring-2 ring-red-500/10"
        : "border-marine-profond/[0.12] focus:border-orange-logo"
    }`;

  const labelClass =
    "block text-[11px] font-bold uppercase tracking-[0.1em] text-marine-profond mb-1.5";

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel rounded-3xl p-8 sm:p-10 border border-vert-tech/30 text-center shadow-[0_20px_60px_rgba(55,137,100,0.15)] max-w-md mx-auto"
      >
        <div className="w-16 h-16 bg-vert-tech/15 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-9 h-9 text-vert-tech" />
        </div>
        <h3 className="font-playfair text-2xl font-bold text-marine-profond mb-3">
          Demande reçue !
        </h3>
        <p className="text-gris-texte text-sm leading-relaxed mb-7">
          Votre demande a bien été enregistrée. Notre équipe analyse vos
          informations et vous contactera dans les 24 heures. Un comptable (pas
          un commercial) prendra contact avec vous.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("whatsapp_click", { source: "cabinet_form" })
            }
            className="inline-flex items-center justify-center gap-2.5 w-full py-4 px-4 bg-vert-tech hover:bg-[#2c7050] text-white rounded-full font-bold text-sm transition-all duration-200"
          >
            <WhatsAppIcon className="w-4 h-4" />
            Nous écrire sur WhatsApp
          </a>
          <button
            onClick={() => setIsSuccess(false)}
            className="text-gris-texte hover:text-marine-profond text-xs font-semibold underline transition-colors"
          >
            Envoyer un autre message
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-9 border border-marine-profond/[0.1] shadow-[0_16px_52px_rgba(12,25,61,0.1)] max-w-xl mx-auto w-full">
      <h3 className="font-playfair text-2xl font-bold text-marine-profond mb-2">
        Discutons de votre situation
      </h3>
      <p className="text-gris-texte text-sm mb-7 leading-relaxed">
        Décrivez-nous votre besoin en 2 minutes. Notre équipe revient vers vous
        dans les 24h avec une première analyse.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        <div>
          <label className={labelClass}>
            Raison sociale / Nom complet{" "}
            <span className="text-orange-logo">*</span>
          </label>
          <input
            type="text"
            placeholder="Nom de votre entreprise ou votre nom"
            className={inputClass(!!errors.raisonSociale)}
            {...register("raisonSociale")}
          />
          {errors.raisonSociale && (
            <span className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {errors.raisonSociale.message}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Téléphone WhatsApp <span className="text-orange-logo">*</span>
            </label>
            <input
              type="tel"
              placeholder="+229 01 XX XX XX XX"
              className={inputClass(!!errors.whatsapp)}
              {...register("whatsapp")}
            />
            {errors.whatsapp && (
              <span className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {errors.whatsapp.message}
              </span>
            )}
          </div>

          <div>
            <label className={labelClass}>
              Adresse e-mail <span className="text-orange-logo">*</span>
            </label>
            <input
              type="email"
              placeholder="votre@email.com"
              className={inputClass(!!errors.email)}
              {...register("email")}
            />
            {errors.email && (
              <span className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {errors.email.message}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Secteur d&apos;activité <span className="text-orange-logo">*</span>
            </label>
            <select
              className={inputClass(!!errors.secteur)}
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
              <span className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {errors.secteur.message}
              </span>
            )}
          </div>

          <div>
            <label className={labelClass}>
              Besoin principal <span className="text-orange-logo">*</span>
            </label>
            <select
              className={inputClass(!!errors.besoin)}
              {...register("besoin")}
            >
              <option value="">Sélectionner...</option>
              <option value="Tenue comptable">
                Tenue & Organisation comptable
              </option>
              <option value="Certification">
                Certification des États Financiers
              </option>
              <option value="Conseil fiscal">Conseil Fiscal & Social</option>
              <option value="Assistance urgente">
                Assistance & Déblocage Urgents
              </option>
              <option value="Autre">Autre besoin</option>
            </select>
            {errors.besoin && (
              <span className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {errors.besoin.message}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className={labelClass}>
            Message / Description du besoin
          </label>
          <textarea
            placeholder="Décrivez brièvement votre situation, vos blocages ou vos objectifs..."
            rows={4}
            className={`${inputClass(false)} resize-none`}
            {...register("message")}
          />
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong className="font-bold">Erreur :</strong> {submitError}
            </span>
          </div>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-full bg-orange-logo hover:bg-orange-sature text-white font-bold text-sm tracking-wider uppercase inline-flex items-center justify-center gap-2.5 transition-all duration-200 hover:shadow-[0_10px_32px_rgba(224,127,10,0.4)] disabled:opacity-50 disabled:pointer-events-none"
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
        </motion.button>
      </form>
    </div>
  );
}
