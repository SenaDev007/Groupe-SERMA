"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  MODULES,
  STATUTS,
  NIVEAUX,
  SOURCES,
  type FullFormData,
} from "@/lib/validations";
import StepIndicator from "./StepIndicator";
import SuccessScreen from "./SuccessScreen";
import PaymentSuccessScreen from "./PaymentSuccessScreen";
import {
  Label,
  FieldWrapper,
  Input,
  Textarea,
  RadioGroup,
  Checkbox,
} from "./FormFields";

const STEP_LABELS = [
  "Infos perso.",
  "Profil pro.",
  "Modules",
  "Motivation",
  "Engagement",
];

const TOTAL_STEPS = 5;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 48 : -48,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -48 : 48,
    opacity: 0,
  }),
};

const FEDAPAY_1_MODULE = "https://me.fedapay.com/eUT2Wc_i";
const FEDAPAY_2_MODULES = "https://me.fedapay.com/6b06vewQ";
const PENDING_KEY = "serma_pending_inscription";
const FORMATION_SESSION = "mai2026";

export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentName, setPaymentName] = useState("");
  const [formData, setFormData] = useState<Partial<FullFormData>>({});
  const formTopRef = useRef<HTMLDivElement>(null);

  // Detect FedaPay redirect after successful payment
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const isPaid = params.get("payment") === "success" || params.get("status") === "approved";
    if (!isPaid) return;

    // Clean URL immediately
    window.history.replaceState({}, "", window.location.pathname);

    const saved = localStorage.getItem(PENDING_KEY);
    if (!saved) return;

    let parsed: FullFormData;
    try { parsed = JSON.parse(saved); } catch { return; }

    setPaymentName(`${parsed.prenom}`);
    setPaymentSuccess(true);

    // Send confirmation email via API
    fetch("/api/payment-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: saved,
    })
      .then(() => {
        localStorage.removeItem(PENDING_KEY);
        // Mark as completed to prevent duplicate submissions
        try {
          const stored = localStorage.getItem("serma_inscriptions");
          const inscriptions = stored ? JSON.parse(stored) : [];
          inscriptions.push({
            email: parsed.email,
            nom: parsed.nom,
            prenom: parsed.prenom,
            modules: parsed.modules,
            session: FORMATION_SESSION,
          });
          localStorage.setItem("serma_inscriptions", JSON.stringify(inscriptions));
        } catch { /* ignore */ }
      })
      .catch(console.error);
  }, []);

  const schemas = [
    step1Schema,
    step2Schema,
    step3Schema,
    step4Schema,
    step5Schema,
  ];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
    trigger,
  } = useForm<FullFormData>({
    resolver: zodResolver(schemas[step - 1] as any),
    defaultValues: {
      sexe: undefined,
      statut: undefined,
      niveauEtudes: undefined,
      modules: [],
      source: undefined,
      attestation: undefined,
      conditionsAcceptees: undefined,
      presenceConfirmee: undefined,
    },
    mode: "onChange",
  });

  const watchedValues = watch();

  const scrollToForm = () => {
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goNext = async () => {
    const valid = await trigger();
    if (!valid) return;
    setFormData((prev) => ({ ...prev, ...watchedValues }));
    setDirection(1);
    setStep((s) => s + 1);
    scrollToForm();
  };

  const goPrev = () => {
    setDirection(-1);
    setStep((s) => s - 1);
    scrollToForm();
  };

  const onSubmit = async (data: FullFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    const finalData = { ...formData, ...data } as FullFormData;

    // Check for duplicate: same person + same module(s) + same formation session
    try {
      const stored = localStorage.getItem("serma_inscriptions");
      const inscriptions: Array<{
        email: string; nom: string; prenom: string;
        modules?: string[]; session?: string;
      }> = stored ? JSON.parse(stored) : [];

      const duplicateModules = inscriptions
        .filter(
          (i) =>
            i.session === FORMATION_SESSION &&
            i.email.toLowerCase() === finalData.email.toLowerCase() &&
            i.nom.toLowerCase() === finalData.nom.toLowerCase() &&
            i.prenom.toLowerCase() === finalData.prenom.toLowerCase()
        )
        .flatMap((i) => i.modules ?? [])
        .filter((m) => finalData.modules.includes(m));

      if (duplicateModules.length > 0) {
        setSubmitError(
          `Vous êtes déjà inscrit(e) au module "${duplicateModules[0]}" pour cette session. Choisissez un autre module ou contactez-nous au 01 40 37 71 99.`
        );
        setIsSubmitting(false);
        return;
      }
    } catch {
      // localStorage unavailable — proceed anyway
    }

    try {
      const res = await fetch("/api/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...finalData, skipEmail: true }),
      });
      const result = await res.json();
      if (!res.ok) {
        setSubmitError(result.error || "Une erreur est survenue.");
        setIsSubmitting(false);
      } else {
        // Save form data for after payment redirect
        try {
          localStorage.setItem(PENDING_KEY, JSON.stringify(finalData));
        } catch { /* ignore */ }

        // Redirect to FedaPay with return URL — link depends on number of modules
        const fedapayLink = finalData.modules.length >= 2 ? FEDAPAY_2_MODULES : FEDAPAY_1_MODULE;
        const returnUrl = `${window.location.origin}/?payment=success`;
        window.location.href = `${fedapayLink}?redirect_url=${encodeURIComponent(returnUrl)}`;
      }
    } catch {
      setSubmitError("Erreur réseau. Veuillez réessayer.");
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setIsSuccess(false);
    setPaymentSuccess(false);
    setPaymentName("");
    setDirection(1);
    setFormData({});
    setSubmitError(null);
    reset({
      nom: "",
      prenom: "",
      sexe: undefined,
      whatsapp: "",
      email: "",
      ville: "",
      statut: undefined,
      domaine: "",
      niveauEtudes: undefined,
      modules: [],
      source: undefined,
      motivation: "",
      attentes: "",
      attestation: undefined,
      conditionsAcceptees: undefined,
      presenceConfirmee: undefined,
    });
    scrollToForm();
  };

  if (paymentSuccess) {
    return <PaymentSuccessScreen name={paymentName} onReset={handleReset} />;
  }

  if (isSuccess) {
    return (
      <SuccessScreen
        name={`${watchedValues.prenom || formData.prenom || ""}`}
        onReset={handleReset}
      />
    );
  }

  return (
    <div ref={formTopRef}>
      <StepIndicator
        currentStep={step}
        totalSteps={TOTAL_STEPS}
        labels={STEP_LABELS}
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            {step === 1 && (
              <Step1
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />
            )}
            {step === 2 && (
              <Step2
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />
            )}
            {step === 3 && (
              <Step3
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />
            )}
            {step === 4 && (
              <Step4
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />
            )}
            {step === 5 && (
              <Step5
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                isSubmitting={isSubmitting}
                submitError={submitError}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Navigation ── */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={goPrev}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl border border-white/10 text-slate-400 text-sm font-medium transition-all duration-200 hover:border-white/20 hover:text-white active:scale-[0.98]"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              Retour
            </button>
          )}
          {step < TOTAL_STEPS && (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange text-navy-dark font-bold text-sm transition-all duration-200 hover:bg-orange-hover hover:shadow-orange active:scale-[0.98]"
            >
              Continuer
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   ÉTAPE 1 — Informations personnelles
───────────────────────────────────────────────── */
function Step1({ register, errors, watch, setValue }: StepProps) {
  const sexe = watch("sexe");
  return (
    <div className="space-y-4 sm:space-y-5">
      <StepTitle>Informations personnelles</StepTitle>

      <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-5">
        <FieldWrapper error={errors.nom?.message}>
          <Label htmlFor="nom" required>Nom</Label>
          <Input
            id="nom"
            placeholder="Ex : KOFFI"
            error={!!errors.nom}
            {...register("nom")}
          />
        </FieldWrapper>
        <FieldWrapper error={errors.prenom?.message}>
          <Label htmlFor="prenom" required>Prénom(s)</Label>
          <Input
            id="prenom"
            placeholder="Ex : Ama Céleste"
            error={!!errors.prenom}
            {...register("prenom")}
          />
        </FieldWrapper>
      </div>

      <FieldWrapper error={errors.sexe?.message}>
        <Label required>Sexe</Label>
        <RadioGroup
          name="sexe"
          options={["Masculin", "Féminin"]}
          value={sexe || ""}
          onChange={(v) => setValue("sexe", v as "Masculin" | "Féminin")}
          error={errors.sexe?.message}
        />
      </FieldWrapper>

      <FieldWrapper error={errors.whatsapp?.message}>
        <Label htmlFor="whatsapp" required>Numéro WhatsApp</Label>
        <Input
          id="whatsapp"
          type="tel"
          inputMode="tel"
          placeholder="Ex : +229 01 XX XX XX XX"
          error={!!errors.whatsapp}
          {...register("whatsapp")}
        />
      </FieldWrapper>

      <FieldWrapper error={errors.email?.message}>
        <Label htmlFor="email" required>Adresse e-mail</Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="votre@email.com"
          error={!!errors.email}
          {...register("email")}
        />
      </FieldWrapper>

      <FieldWrapper error={errors.ville?.message}>
        <Label htmlFor="ville" required>Ville de résidence</Label>
        <Input
          id="ville"
          placeholder="Ex : Cotonou, Parakou..."
          error={!!errors.ville}
          {...register("ville")}
        />
      </FieldWrapper>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   ÉTAPE 2 — Profil professionnel
───────────────────────────────────────────────── */
function Step2({ register, errors, watch, setValue }: StepProps) {
  const statut = watch("statut");
  const niveauEtudes = watch("niveauEtudes");

  return (
    <div className="space-y-4 sm:space-y-5">
      <StepTitle>Profil professionnel</StepTitle>

      <FieldWrapper error={errors.statut?.message}>
        <Label required>Statut actuel</Label>
        <RadioGroup
          name="statut"
          options={[...STATUTS]}
          value={statut || ""}
          onChange={(v) => setValue("statut", v as typeof STATUTS[number])}
          error={errors.statut?.message}
        />
      </FieldWrapper>

      <FieldWrapper error={errors.domaine?.message}>
        <Label htmlFor="domaine" required>
          Domaine d'études / secteur d'activité
        </Label>
        <Input
          id="domaine"
          placeholder="Ex : Comptabilité, Finance, Informatique..."
          error={!!errors.domaine}
          {...register("domaine")}
        />
      </FieldWrapper>

      <FieldWrapper error={errors.niveauEtudes?.message}>
        <Label required>Niveau d'études</Label>
        <div className="flex flex-wrap gap-2">
          {NIVEAUX.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setValue("niveauEtudes", n)}
              className={`
                px-3 xs:px-4 py-2 rounded-lg border
                text-xs xs:text-sm font-medium
                transition-all duration-200
                min-h-[40px] xs:min-h-[44px]
                ${
                  niveauEtudes === n
                    ? "bg-orange/15 border-orange text-orange"
                    : "border-orange/20 text-muted hover:border-orange/40 hover:text-white"
                }
              `}
            >
              {n}
            </button>
          ))}
        </div>
        {errors.niveauEtudes && (
          <p className="text-red-400 text-xs mt-1">
            {errors.niveauEtudes.message}
          </p>
        )}
      </FieldWrapper>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   ÉTAPE 3 — Modules
───────────────────────────────────────────────── */
function Step3({ errors, watch, setValue }: StepProps) {
  const selectedModules = watch("modules") || [];
  const source = watch("source");

  const toggleModule = (mod: string) => {
    const current = selectedModules || [];
    const updated = current.includes(mod)
      ? current.filter((m: string) => m !== mod)
      : [...current, mod];
    setValue("modules", updated);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <StepTitle>Choix des modules</StepTitle>

      <div>
        <Label required>Modules souhaités</Label>
        <p className="text-muted text-xs mb-3">
          Sélectionnez au moins un module
        </p>
        <div className="space-y-2.5 sm:space-y-3">
          {MODULES.map((mod) => {
            const isSelected = selectedModules.includes(mod);
            return (
              <motion.button
                key={mod}
                type="button"
                onClick={() => toggleModule(mod)}
                whileTap={{ scale: 0.99 }}
                className={`
                  w-full text-left p-3 xs:p-4 rounded-xl border
                  transition-all duration-200 min-h-[56px]
                  ${
                    isSelected
                      ? "border-orange bg-orange/10"
                      : "border-orange/20 hover:border-orange/40 active:border-orange/50"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`
                      mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                      transition-colors
                      ${isSelected ? "bg-orange border-orange" : "border-muted/50"}
                    `}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-navy" strokeWidth={3} aria-hidden="true" />
                    )}
                  </div>
                  <span
                    className={`text-xs xs:text-sm font-medium leading-snug ${
                      isSelected ? "text-orange" : "text-slate-300"
                    }`}
                  >
                    {mod}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
        {(errors.modules as any)?.message && (
          <p className="text-red-400 text-xs mt-2">
            {(errors.modules as any).message}
          </p>
        )}
      </div>

      <FieldWrapper error={errors.source?.message}>
        <Label required>
          Comment avez-vous connu cette formation ?
        </Label>
        <RadioGroup
          name="source"
          options={[...SOURCES]}
          value={source || ""}
          onChange={(v) => setValue("source", v as typeof SOURCES[number])}
          error={errors.source?.message}
        />
      </FieldWrapper>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   ÉTAPE 4 — Motivation
───────────────────────────────────────────────── */
function Step4({ register, errors, watch, setValue }: StepProps) {
  const attestation = watch("attestation");
  const motivation = watch("motivation") || "";

  return (
    <div className="space-y-4 sm:space-y-5">
      <StepTitle>Motivation & Attentes</StepTitle>

      <FieldWrapper error={errors.motivation?.message}>
        <Label htmlFor="motivation" required>
          Pourquoi souhaitez-vous participer à cette formation ?
        </Label>
        <div className="relative">
          <Textarea
            id="motivation"
            placeholder="Décrivez votre motivation... (minimum 50 caractères)"
            error={!!errors.motivation}
            {...register("motivation")}
          />
          <span
            className={`
              absolute bottom-3 right-3 text-[10px] xs:text-xs pointer-events-none
              ${motivation.length >= 50 ? "text-green-serma" : "text-muted"}
            `}
          >
            {motivation.length}/50 min
          </span>
        </div>
      </FieldWrapper>

      <FieldWrapper error={errors.attentes?.message}>
        <Label htmlFor="attentes">
          Quelles sont vos attentes concrètes ?{" "}
          <span className="text-muted text-xs">(optionnel)</span>
        </Label>
        <Textarea
          id="attentes"
          placeholder="Ce que vous espérez acquérir, apprendre ou développer..."
          {...register("attentes")}
        />
      </FieldWrapper>

      <FieldWrapper error={errors.attestation?.message}>
        <Label required>
          Souhaitez-vous une attestation ?{" "}
          <span className="text-muted text-xs font-normal">(3 000 FCFA)</span>
        </Label>
        <RadioGroup
          name="attestation"
          options={["Oui", "Non", "Je déciderai plus tard"]}
          value={attestation || ""}
          onChange={(v) =>
            setValue(
              "attestation",
              v as "Oui" | "Non" | "Je déciderai plus tard"
            )
          }
          error={errors.attestation?.message}
        />
      </FieldWrapper>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   ÉTAPE 5 — Engagement
───────────────────────────────────────────────── */
function Step5({
  errors,
  watch,
  setValue,
  isSubmitting,
  submitError,
}: StepProps & { isSubmitting: boolean; submitError: string | null }) {
  const conditionsAcceptees = watch("conditionsAcceptees");
  const presenceConfirmee = watch("presenceConfirmee");
  const selectedModules: string[] = watch("modules") || [];
  const moduleCount = selectedModules.length;
  const totalPrice = moduleCount >= 2 ? "4 000" : "2 000";

  return (
    <div className="space-y-5 sm:space-y-6">
      <StepTitle>Confirmation & Engagement</StepTitle>

      {/* Payment notice */}
      <div className="bg-orange/15 border border-orange text-center rounded-xl p-3 xs:p-4">
        <p className="text-orange text-xs xs:text-sm font-bold mb-1">
          Paiement requis pour valider votre place
        </p>
        <p className="text-white text-lg xs:text-xl font-extrabold">{totalPrice} FCFA</p>
        {moduleCount >= 2 && (
          <p className="text-orange/80 text-[10px] xs:text-xs font-medium mt-0.5">
            2 modules × 2 000 FCFA
          </p>
        )}
        <p className="text-muted text-[10px] xs:text-xs mt-1">
          Le lien de paiement FedaPay vous sera affiché après envoi du formulaire.
        </p>
      </div>

      {/* Reminder box */}
      <div className="bg-navy-dark border border-orange/20 rounded-xl p-3 xs:p-4">
        <p className="text-orange text-xs xs:text-sm font-semibold mb-2">
          Rappel important :
        </p>
        <ul className="space-y-1 list-disc list-inside text-[11px] xs:text-xs text-muted">
          <li>
            Places limitées à{" "}
            <strong className="text-white">10 participants maximum</strong>
          </li>
          <li>
            Présence obligatoire aux{" "}
            <strong className="text-white">3 jours</strong> de formation
          </li>
          <li>
            Dates : Jeudi 07, Vendredi 08, Samedi 09 Mai 2026 — dès 9h00
          </li>
          <li>
            Formation 100% gratuite · Attestation opt. : 3 000 FCFA
          </li>
          <li>
            Présentiel + En ligne (Zoom/Google Meet)
          </li>
        </ul>
      </div>

      <div className="space-y-3 xs:space-y-4">
        <Checkbox
          id="conditionsAcceptees"
          checked={!!conditionsAcceptees}
          onChange={(v) => setValue("conditionsAcceptees", v as true)}
          error={errors.conditionsAcceptees?.message}
          label={
            <span>
              Je confirme avoir pris connaissance des conditions (places
              limitées à 10, présence obligatoire aux{" "}
              <strong className="text-white">3 jours</strong>).
            </span>
          }
        />

        <Checkbox
          id="presenceConfirmee"
          checked={!!presenceConfirmee}
          onChange={(v) => setValue("presenceConfirmee", v as true)}
          error={errors.presenceConfirmee?.message}
          label={
            <span>
              Je m'engage à être présent(e) aux{" "}
              <strong className="text-white">
                3 jours de formation
              </strong>{" "}
              (07, 08 et 09 Mai 2026).
            </span>
          }
        />
      </div>

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
          ${
            isSubmitting
              ? "bg-orange/50 text-navy/60 cursor-not-allowed"
              : "bg-orange text-navy hover:bg-orange-hover hover:shadow-orange active:scale-[0.98]"
          }
        `}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 xs:h-5 xs:w-5 animate-spin" aria-hidden="true" />
            Envoi en cours...
          </>
        ) : (
          <>
            Soumettre ma candidature
            <Send className="h-4 w-4 xs:h-5 xs:w-5" aria-hidden="true" />
          </>
        )}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────── */
function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 sm:mb-7">
      <h2 className="font-syne text-xl xs:text-2xl font-bold text-white leading-tight tracking-tight">
        {children}
      </h2>
      <div className="mt-2.5 h-0.5 w-10 bg-orange rounded-full" />
    </div>
  );
}

interface StepProps {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
}
