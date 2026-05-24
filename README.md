# Site Web Unifié — Groupe SERMA

Ce projet représente la vitrine web unifiée du **Groupe SERMA** à Parakou (Bénin), regroupant :
- **La Page d'Accueil Groupe** : Portail d'aiguillage rapide vers les deux espaces.
- **L'Espace Cabinet SERMA SARL** : Présentation des prestations d'expertise comptable, conseil fiscal, certification d'états financiers, et formulaire de prise de rendez-vous B2B.
- **L'Espace SERMA HUB Impact Academy** : Centre de formation professionnelle appliquée, filières métiers et formations comptables courtes (PERFECTO, caisse, projet), avec le formulaire d'inscription en 5 étapes.
- **Le Blog** : Structure de publication d'actualités et conseils fiscaux.

---

## 🛠️ Stack Technique

- **Framework** : Next.js 14 (App Router, SSR)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS v3
- **Validation** : React Hook Form + Zod (validation typée côté client et serveur)
- **Animations** : Framer Motion (transitions fluides, hover effects, staggered loading)
- **Notifications & E-mails** : Resend API
- **Intégration Paiement** : Liens FedaPay (Mobile Money & Cartes bancaires)

---

## ⚙️ Configuration Locale

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer les variables d'environnement
Copiez le fichier d'exemple :
```bash
cp .env.local.example .env.local
```

Éditez le fichier `.env.local` créé avec vos identifiants :
```env
# Clé API Resend — https://resend.com/api-keys
RESEND_API_KEY=re_votre_cle_resend

# Email de destination des formulaires (leads Cabinet & Inscriptions Academy)
RESEND_TO_EMAIL=contact@sermagroupe.bj
```

### 3. Lancer le serveur de développement local
```bash
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### 4. Compiler pour la production
```bash
npm run build
npm run start
```

---

## 🚀 Déploiement sur Vercel

Le projet est entièrement configuré pour un déploiement instantané sur **Vercel** via le fichier [vercel.json](file:///d:/Projet%20YEHI%20OR%20Tech/Groupe-SERMA/vercel.json).

### Option A — Déploiement en un clic (Vercel CLI)
1. Installez Vercel CLI globalement :
   ```bash
   npm i -g vercel
   ```
2. Connectez-vous et déployez :
   ```bash
   vercel login
   vercel
   ```
3. Pour la production :
   ```bash
   vercel --prod
   ```

### Option B — Importation GitHub (Recommandé)
1. Poussez le projet sur un dépôt GitHub (privé ou public).
2. Connectez-vous à votre tableau de bord [Vercel](https://vercel.com).
3. Cliquez sur **New Project** et importez le dépôt GitHub.
4. Dans l'onglet **Environment Variables**, configurez :
   - `RESEND_API_KEY` (votre clé API Resend)
   - `RESEND_TO_EMAIL` (votre adresse de réception)
5. Cliquez sur **Deploy**. Chaque push sur la branche principale (`main` ou `master`) redéploiera automatiquement le site.

---

## 📂 Structure Finale du Projet

```
├── app/
│   ├── layout.tsx              # Layout racine + chargement Playfair/DM Sans/Inter
│   ├── globals.css             # Styles globaux Tailwind & variables CSS
│   ├── page.tsx                # Homepage du Groupe (aiguillage)
│   ├── cabinet/
│   │   └── page.tsx            # Espace Cabinet SERMA SARL (B2B)
│   ├── academy/
│   │   ├── page.tsx            # Espace SERMA HUB Academy (B2C)
│   │   └── inscription/
│   │       └── page.tsx        # Page d'inscription (MultiStepForm)
│   ├── blog/
│   │   └── page.tsx            # Index du Blog & Actualités
│   └── api/
│       ├── contact-cabinet/
│       │   └── route.ts        # Traitement formulaires B2B (Resend)
│       ├── inscription/
│       │   └── route.ts        # Enregistrement des candidatures Academy
│       └── payment-confirm/
│           └── route.ts        # Confirmation après paiement FedaPay
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Barre de navigation s'adaptant à l'espace actif
│   │   └── Footer.tsx          # Pied de page Groupe SERMA (marine profond)
│   ├── cabinet/
│   │   └── ContactCabinet.tsx  # Formulaire de contact B2B Cabinet
│   ├── shared/
│   │   ├── StatsCounter.tsx    # Compteurs de chiffres clés animés (natif)
│   │   ├── TestimonialCard.tsx # Fiches de témoignages esthétiques
│   │   └── WhatsAppFAB.tsx     # Bulle WhatsApp flottante contextuelle
│   └── MultiStepForm.tsx       # Logique d'inscription multi-étapes
├── lib/
│   ├── validations.ts          # Validation Zod des étapes et formulaires
│   └── email-template.ts       # Gabarits HTML d'e-mails (Resend)
├── vercel.json                 # Configuration Vercel
└── tailwind.config.ts          # Configuration design tokens Tailwind
```
