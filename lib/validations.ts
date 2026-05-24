import { z } from "zod";

export const step1Schema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le ou les prénom(s) sont requis"),
  sexe: z.enum(["Masculin", "Féminin"], {
    required_error: "Veuillez sélectionner votre sexe",
  }),
  whatsapp: z
    .string()
    .min(8, "Numéro WhatsApp invalide")
    .regex(/^[+]?[\d\s\-().]{8,20}$/, "Format de numéro invalide"),
  email: z.string().email("Adresse e-mail invalide"),
  ville: z.string().min(2, "La ville de résidence est requise"),
});

export const step2Schema = z.object({
  statut: z.enum(
    [
      "Étudiant(e)",
      "Professionnel(le) en activité",
      "Demandeur(se) d'emploi",
      "Autre",
    ],
    { required_error: "Veuillez sélectionner votre statut" }
  ),
  domaine: z
    .string()
    .min(2, "Le domaine d'études ou secteur d'activité est requis"),
  niveauEtudes: z.enum(
    ["Bac", "Bac+2", "Bac+3", "Bac+4", "Bac+5 et plus", "Non précisé"],
    { required_error: "Veuillez sélectionner votre niveau d'études" }
  ),
});

export const step3Schema = z.object({
  modules: z
    .array(z.string())
    .min(1, "Veuillez sélectionner au moins un module"),
  source: z.enum(["WhatsApp", "Facebook", "Bouche-à-oreille", "Autre"], {
    required_error: "Veuillez indiquer comment vous avez connu la formation",
  }),
});

export const step4Schema = z.object({
  motivation: z
    .string()
    .min(50, "La motivation doit contenir au moins 50 caractères"),
  attentes: z.string().optional(),
  attestation: z.enum(["Oui", "Non", "Je déciderai plus tard"], {
    required_error: "Veuillez faire un choix concernant l'attestation",
  }),
});

export const step5Schema = z.object({
  conditionsAcceptees: z.literal(true, {
    errorMap: () => ({
      message: "Vous devez confirmer avoir pris connaissance des conditions",
    }),
  }),
  presenceConfirmee: z.literal(true, {
    errorMap: () => ({
      message: "Vous devez vous engager à être présent(e) aux 3 jours",
    }),
  }),
});

export const fullFormSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema);

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type FullFormData = z.infer<typeof fullFormSchema>;

export const cabinetFormSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le ou les prénom(s) sont requis"),
  sexe: z.enum(["Masculin", "Féminin"], {
    required_error: "Veuillez sélectionner votre sexe",
  }),
  whatsapp: z
    .string()
    .min(8, "Numéro WhatsApp invalide")
    .regex(/^[+]?[\d\s\-().]{8,20}$/, "Format de numéro invalide"),
  email: z.string().email("Adresse e-mail invalide"),
  ville: z.string().min(2, "La ville de résidence est requise"),
  poste: z.string().optional(),
  conditionsAcceptees: z.literal(true, {
    errorMap: () => ({ message: "Vous devez vous engager à participer aux séances" }),
  }),
});

export type CabinetFormData = z.infer<typeof cabinetFormSchema>;

export const MODULES = [
  "Gestion efficace de la caisse en Entreprise, Banque et Microfinance",
  "Gestion de projet",
] as const;

export const STATUTS = [
  "Étudiant(e)",
  "Professionnel(le) en activité",
  "Demandeur(se) d'emploi",
  "Autre",
] as const;

export const NIVEAUX = [
  "Bac",
  "Bac+2",
  "Bac+3",
  "Bac+4",
  "Bac+5 et plus",
  "Non précisé",
] as const;

export const SOURCES = [
  "WhatsApp",
  "Facebook",
  "Bouche-à-oreille",
  "Autre",
] as const;
