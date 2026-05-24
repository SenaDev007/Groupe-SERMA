"use client";

import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Send, Loader2, AlertTriangle, CheckCircle2, RotateCcw, Mail } from "lucide-react";
import confetti from "canvas-confetti";
import { cabinetFormSchema, type CabinetFormData } from "@/lib/validations";
import {
  Label,
  FieldWrapper,
  Input,
  RadioGroup,
  Checkbox,
} from "./FormFields";

const FEDAPAY_CABINET = "https://me.fedapay.com/UEIKG2CU";
const CABINET_PENDING_KEY = "serma_cabinet_pending";

export default function CabinetSermaForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentName, setPaymentName] = useState("");
  const formTopRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CabinetFormData>({
    resolver: zodResolver(cabinetFormSchema),
    defaultValues: { sexe: undefined, conditionsAcceptees: undefined },
  });

  const sexe = watch("sexe");
  const conditionsAcceptees = watch("conditionsAcceptees");

  const scrollToTop = () =>
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Detect FedaPay redirect after inscription payment
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("cabinet_payment") !== "success") return;

    window.history.replaceState({}, "", window.location.pathname);

    const saved = localStorage.getItem(CABINET_PENDING_KEY);
    if (!saved) return;

    let parsed: CabinetFormData;
    try { parsed = JSON.parse(saved); } catch { return; }

    setPaymentName(parsed.prenom);
    setPaymentSuccess(true);

    // Confetti
    const end = Date.now() + 3500;
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors: ["#F59B1E", "#2BA96B", "#FFFFFF"] });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors: ["#F59B1E", "#2BA96B", "#FFFFFF"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    // Send confirmation email
    fetch("/api/cabinet-inscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: saved,
    })
      .then(() => { localStorage.removeItem(CABINET_PENDING_KEY); })
      .catch(console.error);
  }, []);

  const onSubmit = async (data: CabinetFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Save form data for after payment redirect
      localStorage.setItem(CABINET_PENDING_KEY, JSON.stringify(data));
      // Redirect to FedaPay — total 7 000 FCFA (inscription 2 000 + 1ère séance 5 000)
      const returnUrl = `${window.location.origin}/?cabinet_payment=success`;
      window.location.href = `${FEDAPAY_CABINET}?redirect_url=${encodeURIComponent(returnUrl)}`;
    } catch {
      setSubmitError("Erreur lors de la redirection. Veuillez réessayer.");
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setPaymentSuccess(false);
    setPaymentName("");
    setSubmitError(null);
    reset({
      nom: "",
      prenom: "",
      sexe: undefined,
      whatsapp: "",
      email: "",
      ville: "",
      poste: "",
      conditionsAcceptees: undefined,
    });
    scrollToTop();
  };

  if (paymentSuccess) {
    return (
      <motion.div
        ref={formTopRef}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="text-center py-6 xs:py-8 px-2 xs:px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 14 }}
          className="w-20 h-20 xs:w-24 xs:h-24 rounded-full bg-green-serma/15 border-2 border-green-serma/60 mx-auto mb-5 flex items-center justify-center"
        >
          <CheckCircle2 className="w-10 h-10 xs:w-12 xs:h-12 text-green-serma" strokeWidth={1.5} aria-hidden="true" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-serma/10 border border-green-serma/30 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-serma animate-pulse" />
            <span className="text-green-serma text-[11px] font-semibold uppercase tracking-wider">Inscription confirmée</span>
          </div>

          <h2 className="font-syne text-2xl xs:text-3xl font-bold text-white mb-2 tracking-tight">
            Bienvenue, <span className="text-orange">{paymentName}</span> !
          </h2>
          <p className="text-slate-400 text-sm xs:text-base mb-6 max-w-sm mx-auto leading-relaxed">
            Votre paiement de 7 000 FCFA (inscription + 1ʳᵉ séance) a été confirmé. Notre équipe vous contactera sur WhatsApp.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2.5 bg-navy-elevated border border-white/[0.07] rounded-xl px-4 py-3 mb-6"
          >
            <Mail className="w-4 h-4 text-orange flex-shrink-0" aria-hidden="true" />
            <p className="text-slate-300 text-xs text-left">
              Notification envoyée —{" "}
              <strong className="text-white">nous vous contacterons sur WhatsApp</strong> sous peu.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto mb-6">
            {[
              { label: "Séances", value: "Tous les samedis", sub: "15h – 17h" },
              { label: "Période", value: "16 Mai – 14 Juin", sub: "2026" },
              { label: "Total réglé", value: "7 000 FCFA", sub: "✓ Confirmé" },
              { label: "Séances suivantes", value: "5 000 FCFA", sub: "par séance" },
            ].map((item) => (
              <div key={item.label} className="bg-navy-light rounded-xl p-3 border border-white/[0.06] text-left">
                <p className="text-[9px] xs:text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">{item.label}</p>
                <p className="text-white text-[10px] xs:text-xs font-bold leading-tight">{item.value}</p>
                <p className="text-slate-600 text-[9px] xs:text-[10px]">{item.sub}</p>
              </div>
            ))}
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm font-medium hover:border-white/20 hover:text-white transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Nouvelle inscription
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div ref={formTopRef}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-4 sm:space-y-5">

          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-5">
            <FieldWrapper error={errors.nom?.message}>
              <Label htmlFor="c-nom" required>Nom</Label>
              <Input id="c-nom" placeholder="Ex : KOFFI" error={!!errors.nom} {...register("nom")} />
            </FieldWrapper>
            <FieldWrapper error={errors.prenom?.message}>
              <Label htmlFor="c-prenom" required>Prénom(s)</Label>
              <Input id="c-prenom" placeholder="Ex : Ama Céleste" error={!!errors.prenom} {...register("prenom")} />
            </FieldWrapper>
          </div>

          <FieldWrapper error={errors.sexe?.message}>
            <Label required>Sexe</Label>
            <RadioGroup
              name="c-sexe"
              options={["Masculin", "Féminin"]}
              value={sexe || ""}
              onChange={(v) => setValue("sexe", v as "Masculin" | "Féminin")}
              error={errors.sexe?.message}
            />
          </FieldWrapper>

          <FieldWrapper error={errors.whatsapp?.message}>
            <Label htmlFor="c-whatsapp" required>Numéro WhatsApp</Label>
            <Input
              id="c-whatsapp"
              type="tel"
              inputMode="tel"
              placeholder="Ex : +229 01 XX XX XX XX"
              error={!!errors.whatsapp}
              {...register("whatsapp")}
            />
          </FieldWrapper>

          <FieldWrapper error={errors.email?.message}>
            <Label htmlFor="c-email" required>Adresse e-mail</Label>
            <Input
              id="c-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="votre@email.com"
              error={!!errors.email}
              {...register("email")}
            />
          </FieldWrapper>

          <FieldWrapper error={errors.ville?.message}>
            <Label htmlFor="c-ville" required>Ville de résidence</Label>
            <Input id="c-ville" placeholder="Ex : Cotonou, Parakou..." error={!!errors.ville} {...register("ville")} />
          </FieldWrapper>

          <FieldWrapper>
            <Label htmlFor="c-poste">
              Poste visé / Entreprise cible{" "}
              <span className="text-muted text-xs font-normal">(optionnel)</span>
            </Label>
            <Input id="c-poste" placeholder="Ex : Guichetier — BOA Bénin" {...register("poste")} />
          </FieldWrapper>

          {/* Tarifs */}
          <div className="bg-orange/10 border border-orange/50 rounded-xl p-3 xs:p-4">
            <p className="text-orange text-xs xs:text-sm font-bold mb-3">Paiement requis pour valider votre place</p>
            <div className="bg-navy-dark rounded-xl p-3 text-center mb-2">
              <p className="text-[9px] xs:text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Total à régler</p>
              <p className="text-white text-xl xs:text-2xl font-extrabold">7 000 FCFA</p>
              <p className="text-muted text-[9px] xs:text-[10px] mt-0.5">Inscription (2 000) + 1ʳᵉ séance (5 000)</p>
            </div>
            <p className="text-slate-500 text-[10px] xs:text-xs">
              Le lien FedaPay s'affichera après envoi du formulaire. Les séances suivantes : 5 000 FCFA chacune.
            </p>
          </div>

          <Checkbox
            id="c-conditions"
            checked={!!conditionsAcceptees}
            onChange={(v) => setValue("conditionsAcceptees", v as true)}
            error={errors.conditionsAcceptees?.message}
            label={
              <span>
                Je m'engage à participer aux séances les{" "}
                <strong className="text-white">samedis de 15h à 17h</strong>{" "}
                (du 16 mai au 14 juin 2026).
              </span>
            }
          />

          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-400/40 rounded-xl p-3 xs:p-4 text-red-400 text-xs xs:text-sm flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-px" aria-hidden="true" />
              {submitError}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full py-3.5 xs:py-4 rounded-xl font-bold text-sm xs:text-base
              inline-flex items-center justify-center gap-2
              transition-all duration-200
              ${isSubmitting
                ? "bg-orange/50 text-navy/60 cursor-not-allowed"
                : "bg-orange text-navy hover:bg-orange-hover hover:shadow-orange active:scale-[0.98]"
              }
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 xs:h-5 xs:w-5 animate-spin" aria-hidden="true" />
                Redirection...
              </>
            ) : (
              <>
                Soumettre et payer l&apos;inscription
                <Send className="h-4 w-4 xs:h-5 xs:w-5" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
