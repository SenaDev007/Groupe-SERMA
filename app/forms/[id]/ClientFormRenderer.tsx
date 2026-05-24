"use strict";

"use client";

import React, { useState, useEffect } from "react";
import { Form } from "@/lib/db";
import { motion } from "framer-motion";
import { Check, ArrowRight, Loader2, CreditCard, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface ClientFormRendererProps {
  form: Form;
}

export default function ClientFormRenderer({ form }: ClientFormRendererProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Initialize checkboxes and multi-select arrays
  useEffect(() => {
    const initialData: Record<string, any> = {};
    form.fields.forEach((field) => {
      if (field.type === "checkbox") {
        initialData[field.id] = [];
      } else {
        initialData[field.id] = "";
      }
    });
    setFormData(initialData);
  }, [form]);

  // Handle simple input change
  const handleChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    // Clear error
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  // Handle checkbox change (multi-select)
  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    const currentValues = Array.isArray(formData[fieldId]) ? formData[fieldId] : [];
    let updatedValues: string[];

    if (checked) {
      updatedValues = [...currentValues, option];
    } else {
      updatedValues = currentValues.filter((v: string) => v !== option);
    }

    handleChange(fieldId, updatedValues);
  };

  // Run validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    form.fields.forEach((field) => {
      const val = formData[field.id];
      const isFieldEmpty =
        val === undefined ||
        val === null ||
        val === "" ||
        (Array.isArray(val) && val.length === 0);

      if (field.required && isFieldEmpty) {
        newErrors[field.id] = "Ce champ est obligatoire";
      } else if (!isFieldEmpty) {
        if (field.type === "email" && !/\S+@\S+\.\S+/.test(val)) {
          newErrors[field.id] = "Adresse email invalide";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/forms/${form.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        // Trigger success confetti
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#F59B1E", "#2BA96B", "#FFFFFF"],
        });
      } else {
        setSubmitError(data.error || "Une erreur est survenue lors de la soumission");
      }
    } catch (err) {
      setSubmitError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    const name = formData.prenom || formData.prenoms || formData.nom || "Cher(e) participant(e)";
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0b1527]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl text-center"
      >
        <div className="w-20 h-20 rounded-full bg-[#2BA96B]/20 border border-[#2BA96B] mx-auto mb-6 flex items-center justify-center">
          <Check className="h-10 w-10 text-[#2BA96B]" />
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-syne">
          Inscription Validée !
        </h2>
        <p className="text-gray-300 text-sm md:text-base mt-2">
          Merci pour votre intérêt, <strong className="text-[#F59B1E]">{name}</strong>.
        </p>

        <p className="text-gray-400 text-xs md:text-sm max-w-md mx-auto mt-4 leading-relaxed">
          Vos informations ont bien été enregistrées dans notre système.
          {form.price && form.price > 0
            ? " Pour confirmer définitivement votre participation, veuillez procéder au règlement ci-dessous."
            : " Notre équipe prendra contact avec vous très prochainement par WhatsApp pour valider votre dossier."}
        </p>

        {form.price && form.price > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 max-w-md mx-auto mt-6">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">
              Frais de Formation
            </span>
            <span className="text-2xl font-extrabold text-[#F59B1E] block mb-4">
              {form.price.toLocaleString("fr-FR")} FCFA
            </span>
            
            {form.paymentLink ? (
              <a
                href={form.paymentLink}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-[#F59B1E] to-[#C86E09] hover:from-[#ffaa33] hover:to-[#e07f0a] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-[#F59B1E]/20"
              >
                <CreditCard className="h-5 w-5" />
                <span>Payer maintenant via FedaPay</span>
              </a>
            ) : (
              <div className="text-xs text-gray-400 italic">
                (Le lien de paiement n'a pas encore été configuré. Vous recevrez un lien par WhatsApp.)
              </div>
            )}
            <p className="text-[10px] text-gray-500 mt-2">
              Paiement Mobile Money (MTN, Moov, Wave) ou Carte Bancaire
            </p>
          </div>
        )}

        <div className="pt-8 mt-8 border-t border-white/5 flex flex-col sm:flex-row justify-center gap-4">
          <a
            href={form.entity === "academy" ? "/academy" : "/cabinet"}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl transition-colors text-sm"
          >
            Retourner à l'accueil
          </a>
          <button
            onClick={() => {
              setIsSuccess(false);
              setFormData({});
            }}
            className="px-6 py-3 border border-[#F59B1E]/30 text-[#F59B1E] hover:bg-[#F59B1E]/10 font-semibold rounded-xl transition-colors text-sm cursor-pointer"
          >
            Nouvelle Inscription
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0b1527]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl"
    >
      {/* Form Header */}
      <div className="border-b border-white/5 pb-6 mb-6 text-center sm:text-left space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 justify-center sm:justify-start">
            <div className="p-1.5 bg-[#05091a] border border-white/5 rounded-lg">
              <Sparkles className="h-5 w-5 text-[#F59B1E]" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2BA96B]">
              {form.entity === "academy" ? "SERMA ACADEMY" : "CABINET SERMA"}
            </span>
          </div>

          {form.price && form.price > 0 ? (
            <span className="text-xs bg-[#F59B1E]/15 text-[#F59B1E] font-bold px-3 py-1 rounded-full border border-[#F59B1E]/20 self-center">
              Frais : {form.price.toLocaleString("fr-FR")} FCFA
            </span>
          ) : (
            <span className="text-xs bg-[#2BA96B]/15 text-[#2BA96B] font-bold px-3 py-1 rounded-full border border-[#2BA96B]/20 self-center">
              Formation Gratuite
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-syne">
          {form.title}
        </h1>
        {form.description && (
          <p className="text-gray-400 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
            {form.description}
          </p>
        )}
      </div>

      {submitError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs font-semibold">
          ⚠️ {submitError}
        </div>
      )}

      {/* Form Fields Render */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {form.fields.map((field) => {
          const hasError = !!errors[field.id];
          const errorMsg = errors[field.id];

          return (
            <div key={field.id} className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>

              {/* Render Inputs dynamically */}
              {["text", "email", "tel", "number"].includes(field.type) && (
                <input
                  type={field.type}
                  placeholder={field.placeholder || ""}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className={`w-full px-4 py-3 bg-[#05091a] border rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all duration-200 ${
                    hasError ? "border-red-500/50 focus:border-red-500" : "border-white/5 focus:border-[#F59B1E]/50"
                  }`}
                />
              )}

              {field.type === "textarea" && (
                <textarea
                  rows={4}
                  placeholder={field.placeholder || ""}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className={`w-full px-4 py-3 bg-[#05091a] border rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all duration-200 ${
                    hasError ? "border-red-500/50 focus:border-red-500" : "border-white/5 focus:border-[#F59B1E]/50"
                  }`}
                />
              )}

              {field.type === "select" && (
                <select
                  value={formData[field.id] || ""}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className={`w-full px-4 py-3 bg-[#05091a] border rounded-xl text-gray-300 focus:outline-none transition-all duration-200 ${
                    hasError ? "border-red-500/50 focus:border-red-500" : "border-white/5 focus:border-[#F59B1E]/50"
                  }`}
                >
                  <option value="">Choisir une option...</option>
                  {field.options?.map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {field.type === "radio" && (
                <div className="space-y-2 mt-2">
                  {field.options?.map((opt, idx) => (
                    <label key={idx} className="flex items-center space-x-3 cursor-pointer group text-sm text-gray-300">
                      <input
                        type="radio"
                        name={field.id}
                        value={opt}
                        checked={formData[field.id] === opt}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        className="text-[#F59B1E] focus:ring-0 bg-[#05091a] border-white/10"
                      />
                      <span className="group-hover:text-white transition-colors">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {field.type === "checkbox" && (
                <div className="space-y-2 mt-2">
                  {field.options?.map((opt, idx) => {
                    const values = Array.isArray(formData[field.id]) ? formData[field.id] : [];
                    const isChecked = values.includes(opt);
                    
                    return (
                      <label key={idx} className="flex items-center space-x-3 cursor-pointer group text-sm text-gray-300">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                          className="text-[#F59B1E] focus:ring-0 bg-[#05091a] border-white/10 rounded"
                        />
                        <span className="group-hover:text-white transition-colors">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {hasError && (
                <p className="text-red-400 text-xs mt-1 font-semibold">
                  {errorMsg}
                </p>
              )}
            </div>
          );
        })}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 bg-gradient-to-r from-[#F59B1E] to-[#C86E09] hover:from-[#ffaa33] hover:to-[#e07f0a] disabled:opacity-50 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-[#F59B1E]/20 flex items-center justify-center space-x-2 cursor-pointer mt-8"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Traitement en cours...</span>
            </>
          ) : (
            <>
              <span>Valider l'inscription</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
