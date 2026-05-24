# Cahier des Charges
## Site Web Groupe SERMA — Version 1.0

**Former. Structurer. Performer.**
*Un site. Deux espaces. Une seule excellence.*

---

| | |
|---|---|
| **Version** | 1.0 — Mai 2025 |
| **Statut** | Document de référence contractuel |
| **Rédigé par** | Keter Marketing — Dawes AKPOWI |
| **Client** | Groupe SERMA — Cabinet SERMA SARL + SERMA HUB Impact Academy |
| **Contact client** | +229 01 40 37 71 99 / +229 01 96 23 73 43 |
| **Documents liés** | Copywriting complet (doc séparé) · Prompt de production (doc séparé) |
| **Formulaire existant** | https://inscription-formation-gratuite-serm.vercel.app/ |
| **GitHub formulaire** | https://github.com/SenaDev007/Inscription-Formation-Gratuite-SERMA-HUB.git |

---

## 01 — Présentation & Contexte

### 1.1 Présentation du client

**Groupe SERMA** est une structure béninoise basée à Parakou composée de deux entités complémentaires :

**Cabinet SERMA SARL** — expertise comptable, conseil fiscal et certification financière. Il accompagne les entreprises, ONG et institutions dans leur conformité comptable (OHADA), leur gestion fiscale et sociale, et leur performance financière.

**SERMA HUB Impact Academy (CFPEA)** — centre de formation professionnelle et d'entrepreneuriat appliqué. Il forme des porteurs de projets et des professionnels en leur transmettant des compétences immédiatement opérationnelles, dans 5 filières métiers et une gamme de formations comptables certifiantes.

La force du Groupe SERMA : **Formation + Application + Certification** dans un même écosystème.

### 1.2 Problème à résoudre

| PROBLÈME | IMPACT | SOLUTION |
|---|---|---|
| Pas de site web unifié | Les deux entités ne sont pas visibles en ligne | Site groupe avec deux espaces distincts |
| Formulaire d'inscription isolé | Pas rattaché à une présence de marque | Intégration dans l'espace Academy |
| Pas de vitrine Cabinet | Clients B2B ne trouvent pas le cabinet | Espace Cabinet avec services détaillés |
| Contenu WhatsApp non centralisé | Informations dispersées, non indexées | Blog et pages de formations structurées |
| Deux identités sans pont | Cabinet et Academy semblent déconnectés | Homepage Groupe qui lie les deux espaces |

### 1.3 Ce que le site doit faire

**Pour le Cabinet SERMA SARL :** Convaincre les dirigeants, ONG et entrepreneurs que le Cabinet est le partenaire comptable et fiscal le plus fiable de Parakou.

**Pour SERMA HUB Academy :** Convertir les visiteurs (étudiants, chômeurs, femmes entrepreneures, professionnels) en inscrits aux formations. La conversion passe par le formulaire existant.

---

## 02 — Objectifs Stratégiques

| OBJECTIF | MÉCANISME | KPI CIBLE |
|---|---|---|
| Générer des leads Cabinet | Formulaire de prise de rendez-vous B2B | 10 demandes/mois dès M+3 |
| Convertir en inscriptions Academy | Intégration formulaire + CTA ciblés | 20 inscriptions/mois dès M+3 |
| Établir la crédibilité groupe | Chiffres clés + témoignages vérifiés | Temps sur page > 2 min |
| Visibilité locale Parakou | SEO local + Google Business Profile | Top 3 requêtes comptabilité Parakou |
| Visibilité nationale Bénin | SEO contenu + formations OHADA | Top 5 formations comptables Bénin |
| Unifier l'image groupe | Un site, deux espaces, une charte cohérente | 0 confusion entre les entités |

---

## 03 — Architecture Plateforme

### 3.1 Décision architecturale

**Un seul site — deux espaces distincts.**

Le visiteur arrive sur une homepage qui présente le Groupe. Il choisit ensuite son espace : Cabinet ou Academy. Les deux espaces partagent la même charte graphique mais ont des parcours, des contenus et des CTA entièrement différents.

```
sermagroupe.bj/  (ou sermahub.bj — à confirmer)
│
├── /                          ← Homepage Groupe SERMA
│
├── /cabinet/                  ← ESPACE 1 — Cabinet SERMA SARL
│   ├── /services/             ← Tenue comptable, certification, conseil
│   ├── /expertise/            ← Qui sommes-nous, approche
│   └── /contact/              ← Formulaire RDV B2B
│
├── /academy/                  ← ESPACE 2 — SERMA HUB Impact Academy
│   ├── /filieres/             ← Les 5 filières métiers
│   │   ├── /commerce/
│   │   ├── /agro-business/
│   │   ├── /services-techniques/
│   │   ├── /digital/
│   │   └── /entrepreneur-feminin/
│   ├── /formations/           ← Formations comptables courtes
│   │   ├── /syscohada/
│   │   ├── /gestion-caisse/
│   │   └── /gestion-projet/
│   ├── /inscription/          ← Formulaire existant intégré
│   └── /contact/              ← Contact Academy
│
└── /blog/                     ← Contenu éditorial groupe
    ├── /actualites/
    └── /conseils/
```

### 3.2 Intégration du formulaire existant

Le formulaire d'inscription `https://inscription-formation-gratuite-serm.vercel.app/` est déjà opérationnel. Deux options d'intégration :

| OPTION | DESCRIPTION | RECOMMANDATION |
|---|---|---|
| Option A — Embed iframe | Intégrer le formulaire existant dans `/academy/inscription/` via `<iframe>` | Rapide, zéro risque de régression |
| Option B — Portage Next.js | Porter le code GitHub dans le projet Next.js principal | Plus propre, même stack, meilleur SEO |
| **Option recommandée** | **Option B** — Porter le code depuis le repo GitHub dans l'architecture Next.js | UX unifiée, tracking GA4 natif, meilleur SEO |

> ✎ Le repo GitHub https://github.com/SenaDev007/Inscription-Formation-Gratuite-SERMA-HUB.git doit être analysé avant de trancher. Si la migration est trop coûteuse, Option A en attendant.

### 3.3 Structure du projet Next.js

```
serma-groupe/
├── app/
│   ├── page.tsx                   ← Homepage Groupe
│   ├── layout.tsx                 ← Layout global + SEO + GA4
│   ├── cabinet/
│   │   ├── page.tsx               ← Landing Cabinet
│   │   ├── services/page.tsx
│   │   ├── expertise/page.tsx
│   │   └── contact/page.tsx
│   ├── academy/
│   │   ├── page.tsx               ← Landing Academy
│   │   ├── filieres/
│   │   │   ├── page.tsx           ← Vue d'ensemble 5 filières
│   │   │   ├── commerce/page.tsx
│   │   │   ├── agro-business/page.tsx
│   │   │   ├── services-techniques/page.tsx
│   │   │   ├── digital/page.tsx
│   │   │   └── entrepreneur-feminin/page.tsx
│   │   ├── formations/
│   │   │   ├── page.tsx
│   │   │   ├── syscohada/page.tsx
│   │   │   ├── gestion-caisse/page.tsx
│   │   │   └── gestion-projet/page.tsx
│   │   ├── inscription/page.tsx   ← Formulaire (porté ou iframe)
│   │   └── contact/page.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   └── api/
│       ├── contact-cabinet/route.ts
│       └── contact-academy/route.ts
├── components/
│   ├── layout/  Navbar  Footer  SpaceSwitch
│   ├── homepage/  HeroGroupe  EntitiesCards  StatsGroupe
│   ├── cabinet/  ServiceCard  ExpertiseSection  ContactCabinet
│   ├── academy/  FilierCard  FormationCard  InscriptionCTA
│   └── shared/  WhatsAppFAB  TestimonialCard  StatsCounter
├── lib/
│   └── analytics.ts  validations.ts  whatsapp.ts
└── public/images/
```

---

## 04 — Stack Technique

### 4.1 Stack core

| TECHNOLOGIE | RÔLE | VERSION | JUSTIFICATION |
|---|---|---|---|
| Next.js | Framework React fullstack, App Router, SSR | 15+ | Performance, SEO, routing multi-espace |
| TypeScript | Typage strict, maintenabilité | 5.x | Qualité production |
| Tailwind CSS | Design system cohérent | 4.x | Rapidité, tokens de couleur |
| shadcn/ui | Composants UI accessibles | Latest | Qualité WCAG 2.1 |
| Framer Motion | Animations fluides | 11+ | UX premium |
| React Hook Form | Formulaires performants | 7.x | Formulaire Cabinet + portage Academy |
| Zod | Validation TypeScript-first | 3.x | Sécurité côté client et serveur |
| Resend | Emails notifications leads | Latest | 3 000 emails/mois gratuits |
| next-sitemap | Sitemap multi-sections | Latest | SEO technique |

### 4.2 Infrastructure

| SERVICE | USAGE | COÛT |
|---|---|---|
| Vercel | Hébergement, CDN, CI/CD | 0 XOF démarrage |
| GitHub | Versioning + repo formulaire existant | 0 XOF |
| Google Analytics 4 | Tracking conversions par espace | 0 XOF |
| Google Search Console | Suivi SEO multi-pages | 0 XOF |
| Google Business Profile | Visibilité locale Parakou | 0 XOF |

---

## 05 — Design System

### 5.1 Palette — extraite exactement du logo SERMA

| COULEUR | HEX | USAGE |
|---|---|---|
| Marine profond (primary) | `#0C193D` | Header, footer, sections sombres, textes forts |
| Marine moyen | `#112046` | Boutons secondaires, backgrounds sombres |
| Orange logo (accent) | `#E07F0A` | CTAs principaux, highlights, chiffres clés |
| Orange saturé | `#E58A10` | Hover boutons, badges actifs |
| Vert tech | `#378964` | Éléments digitaux, badges Academy, tags |
| Blanc pur | `#FFFFFF` | Navbar, cartes, formulaires |
| Gris bleuté (fond) | `#F4F6FB` | Fond alterné des sections |
| Gris texte | `#4A4E69` | Corps de texte, descriptions |

### 5.2 Différenciation visuelle des deux espaces

Les deux espaces partagent la charte globale mais ont un **accent couleur distinctif** :

| ESPACE | ACCENT PRINCIPAL | SIGNAL VISUEL |
|---|---|---|
| **Cabinet SERMA SARL** | Marine `#0C193D` + Orange `#E07F0A` | Sobre, corporate, confiance |
| **SERMA HUB Academy** | Orange `#E07F0A` + Vert `#378964` | Dynamique, accessible, ambition |

### 5.3 Typographie

| USAGE | POLICE | STYLE | CHARGEMENT |
|---|---|---|---|
| Titres / Display | Playfair Display | Serif — autorité, expertise | next/font/google |
| Corps / Interface | DM Sans | Sans-serif — lisibilité | next/font/google |
| Chiffres clés | Inter | Numérique, précision | next/font/google |

### 5.4 Navbar & Footer

**Navbar :** fond blanc `#FFFFFF` — logo SERMA parfaitement lisible (marine + orange sur blanc). Transition vers fond blanc + border-bottom `#E07F0A` au scroll.

**Footer :** fond marine profond `#0C193D` — logo SERMA lisible, texte blanc et orange.

> ✎ Même raisonnement que pour Win Agro : ne jamais poser le logo sur une couleur de sa propre palette. Marine sur marine = illisible.

### 5.5 Principes visuels

- Sections alternées : fond `#F4F6FB` (gris bleuté) / fond `#FFFFFF` (blanc)
- Sections d'impact : fond `#0C193D` (marine profond), texte blanc
- Cards : border `1px solid #E2E8F0`, radius `14px`, shadow légère
- Boutons primaires : fond `#E07F0A`, texte blanc, radius `8px`
- Boutons secondaires : outline `#0C193D`, texte marine
- Icônes : Lucide React, stroke `1.5px`, couleur selon le contexte

---

## 06 — Architecture du Site

### 6.1 Homepage Groupe SERMA

| # | SECTION | CONTENU | OBJECTIF |
|---|---|---|---|
| 01 | Hero Groupe | Tagline + deux CTA vers chaque espace | Orienter le visiteur |
| 02 | Présentation groupe | Qui est SERMA — l'alliance Cabinet + Academy | Crédibilité globale |
| 03 | Chiffres clés | Stats consolidées Cabinet + Academy | Réassurance |
| 04 | Deux espaces | Cards Cabinet et Academy avec CTAs distincts | Bifurcation du parcours |
| 05 | Pourquoi SERMA | 4 arguments différenciateurs groupe | Conviction |
| 06 | Témoignages | Clients Cabinet + apprenants Academy | Social proof mixte |
| 07 | Contact rapide | WhatsApp + téléphone + lien formulaires | Conversion finale |
| 08 | Footer | Liens groupe + deux espaces + contacts | Navigation |

### 6.2 Espace Cabinet SERMA SARL

| # | SECTION | CONTENU | OBJECTIF |
|---|---|---|---|
| 01 | Hero Cabinet | Accroche B2B + CTA RDV | Qualifier le prospect |
| 02 | Services | 4 offres : comptabilité / certification / conseil / assistance | Identification du besoin |
| 03 | Approche | Méthodologie + normes OHADA + SYSCOHADA | Crédibilité technique |
| 04 | Pourquoi nous | Arguments vs concurrents locaux | Différenciation |
| 05 | Types de clients | Entreprises / ONG / Startups / Indépendants | Qualification |
| 06 | Témoignages | Clients entreprises avec résultats concrets | Social proof B2B |
| 07 | Contact Cabinet | Formulaire RDV + téléphone + WhatsApp | Conversion B2B |

### 6.3 Espace SERMA HUB Impact Academy

| # | SECTION | CONTENU | OBJECTIF |
|---|---|---|---|
| 01 | Hero Academy | Accroche problème → solution + CTA inscription | Accrocher le visiteur |
| 02 | Concept | Ce qui rend SERMA HUB différent des formations classiques | Différenciation |
| 03 | Chiffres | Stats participants, filières, taux de placement | Crédibilité |
| 04 | 5 Filières | Cards des 5 filières avec descriptions + CTA | Orientation |
| 05 | Formations courtes | Modules comptables (SYSCOHADA, caisse, projet) | Audience professionnelle |
| 06 | Pour qui | Portraits types : étudiant, chômeur, femme, professionnel | Qualification |
| 07 | Témoignages | Apprenants avec résultats mesurables | Social proof |
| 08 | Inscription | Formulaire intégré (porté depuis GitHub) | Conversion principale |
| 09 | Contact Academy | WhatsApp + téléphone | Dernier filet |

---

## 07 — Stratégie de Conversion

### 7.1 Deux tunnels distincts

**Tunnel Cabinet (B2B — cycle long)**

```
Visiteur → Homepage → Espace Cabinet → Page Service → Page Contact
→ Formulaire RDV → Email notification → Appel téléphonique
```

**Tunnel Academy (B2C — cycle court)**

```
Visiteur → Homepage → Espace Academy → Filière/Formation → Inscription
→ Formulaire intégré → Confirmation → Rappel WhatsApp
```

### 7.2 Formulaire Cabinet — Prise de RDV B2B

| CHAMP | TYPE | REQUIS | PLACEHOLDER |
|---|---|---|---|
| Raison sociale / Nom | text | Oui | "Nom de votre entreprise ou votre nom" |
| Téléphone WhatsApp | tel | Oui | "+229 XXXXXXXXXX" |
| Email | email | Oui | "votre@email.com" |
| Secteur d'activité | select | Oui | Entreprise / ONG / Startup / Association / Indépendant |
| Besoin | select | Oui | Tenue comptable / Certification / Conseil fiscal / Assistance urgente / Autre |
| Message | textarea | Non | "Décrivez brièvement votre situation..." |

**Comportement à la soumission Cabinet :**
- Email de notification via Resend
- Message WhatsApp automatique pré-rempli vers le Cabinet
- Confirmation à l'écran : « Votre demande est enregistrée. Notre équipe vous contacte dans les 24h. »

### 7.3 Formulaire Academy — Inscription formation

Le formulaire existant (5 étapes) est porté depuis le repo GitHub. Il couvre :

```
Étape 1 : Informations personnelles (nom, prénom, sexe, WhatsApp, email, ville)
Étape 2 : Profil (situation professionnelle, niveau d'études)
Étape 3 : Formation souhaitée + filière d'intérêt
Étape 4 : Motivation + disponibilité présentiel/ligne
Étape 5 : Confirmation + récapitulatif
```

**Événements GA4 à tracker :**
- `form_start` (étape 1 commencée)
- `form_step_2`, `form_step_3`, `form_step_4` (abandon funnel)
- `inscription_submitted` (conversion principale Academy)
- `rdv_cabinet_submitted` (conversion principale Cabinet)
- `whatsapp_click` avec propriété `source` (homepage, cabinet, academy, fab)

---

## 08 — Animations & UX

| SECTION | TYPE | PARAMÈTRES | DÉCLENCHEUR |
|---|---|---|---|
| Hero — titres | staggered fadeUp | opacity 0→1, y 40→0, 0.15s/ligne | Page load |
| Chiffres clés | count animation | 0 → valeur, 1.5s, easeOut | whileInView once |
| Cards espaces | hover lift | translateY -6px, shadow +, 0.25s | Hover |
| Cards filières | stagger fadeUp | stagger 0.1s, 5 cards | whileInView once |
| Services Cabinet | slideRight | x -40→0, stagger 0.1s | whileInView once |
| Témoignages | carousel drag | Framer Motion drag | Mobile |
| FAB WhatsApp | pulse verte | scale 1→1.08→1, 2s ∞ | Auto |
| Navbar | blur transition | transparent → blanc + border | IntersectionObserver |

---

## 09 — SEO & Performance

### 9.1 SEO On-Page — pages clés

**Homepage Groupe**

| | |
|---|---|
| Meta title | Groupe SERMA — Expertise Comptable & Formation Professionnelle à Parakou |
| Meta description | Cabinet SERMA SARL : expertise comptable OHADA. SERMA HUB Academy : formations pratiques en entreprise, agro-business et digital. Parakou, Bénin. |
| H1 | Former. Structurer. Performer. Le Groupe SERMA à Parakou. |

**Landing Cabinet**

| | |
|---|---|
| Meta title | Cabinet SERMA SARL — Expertise Comptable & Conseil Fiscal Parakou \| Bénin |
| Meta description | Cabinet d'expertise comptable à Parakou. Tenue comptable, certification états financiers OHADA, conseil fiscal et social. Entreprises, ONG, startups. |
| H1 | Votre comptabilité est en règle. Votre business peut avancer. |

**Landing Academy**

| | |
|---|---|
| Meta title | SERMA HUB Impact Academy — Formation Professionnelle Pratique à Parakou |
| Meta description | Centre de formation professionnelle à Parakou. 5 filières métiers, formations comptables certifiantes. Tu repars avec une activité réelle. |
| H1 | Tu travailles beaucoup. Mais l'argent ne reste pas. On t'apprend pourquoi — et comment changer ça. |

### 9.2 Mots-clés prioritaires

| PRIORITÉ | MOT-CLÉ | ESPACE CIBLE |
|---|---|---|
| P1 | expertise comptable Parakou | Cabinet |
| P1 | cabinet comptable Bénin | Cabinet |
| P1 | formation professionnelle Parakou | Academy |
| P1 | formation comptabilité Bénin | Academy |
| P1 | SYSCOHADA formation Bénin | Academy |
| P2 | certification états financiers Bénin | Cabinet |
| P2 | conseil fiscal Parakou | Cabinet |
| P2 | formation agro-business Parakou | Academy |
| P2 | formation digital WhatsApp Bénin | Academy |
| P2 | formation entrepreneur féminin Bénin | Academy |
| P3 | OHADA comptabilité Bénin | Cabinet + Academy |
| P3 | gestion caisse entreprise formation | Academy |
| P3 | formation commerce Parakou | Academy |
| P3 | accompagnement entrepreneuriat Bénin | Academy |

### 9.3 Exigences de performance

| MÉTRIQUE | CIBLE | OUTIL |
|---|---|---|
| Lighthouse desktop | ≥ 90 | PageSpeed Insights |
| Lighthouse mobile | ≥ 85 | PageSpeed Insights |
| LCP | < 2.5s | Core Web Vitals |
| CLS | < 0.1 | Core Web Vitals |
| TTFB | < 600ms | WebPageTest |
| Bundle JS | < 150 KB gzipé | Next.js Analyzer |

---

## 10 — Copywriting

Le copywriting complet — section par section, CTA par CTA — est dans le **document de production séparé : « Copywriting Complet — Groupe SERMA »**.

### 10.1 Principes éditoriaux

- **Bifurcation claire dès la homepage** : le visiteur sait en 3 secondes s'il est sur le bon chemin (Cabinet ou Academy)
- **Ton Cabinet** : sérieux, rassurant, technique — il parle à des dirigeants qui ont besoin de confiance
- **Ton Academy** : direct, motivant, humain — il parle à des personnes qui ont besoin d'être sorties de l'inaction
- **Pas de jargon inutile** : OHADA est expliqué, pas supposé connu
- **Résultats avant diplômes** : ce que le client ou l'apprenant obtient concrètement

### 10.2 Contenus à fournir par le client

| ÉLÉMENT | FORMAT | DÉLAI |
|---|---|---|
| Logo haute résolution | PNG fond transparent | Avant Phase 1 (J1) |
| Photo équipe Cabinet | JPEG haute résolution | Avant Phase 3 (J6) |
| Photo formations en cours | JPEG haute résolution | Avant Phase 3 (J6) |
| Témoignages clients Cabinet | Nom + poste + témoignage | Avant Phase 4 (J10) |
| Témoignages apprenants Academy | Prénom + filière + résultat | Avant Phase 4 (J10) |
| Chiffres clés réels | Nombre de clients, apprenants, années | Avant Phase 2 (J4) |
| Adresse email notifications | Format standard | Avant Phase 1 (J1) |
| Domaine souhaité | Ex : sermagroupe.bj | Avant Phase 6 (J15) |

---

## 11 — Responsive & Accessibilité

| BREAKPOINT | RÉSOLUTION | LAYOUT |
|---|---|---|
| Mobile (default) | < 768px | 1 colonne, hamburger menu avec distinction Cabinet/Academy |
| Tablet | 768 — 1024px | 2 colonnes cards |
| Desktop | ≥ 1024px | Layout complet, navigation multi-niveaux |

**Accessibilité WCAG 2.1 AA :**
- Contraste : ratio ≥ 4.5:1 (orange sur blanc : 3.4:1 — utiliser `#C86E09` pour le texte orange sur blanc)
- Focus visible sur tous les éléments interactifs
- Navigation clavier entre les deux espaces
- ARIA labels sur tous les éléments d'interface

> ⚠ L'orange `#E07F0A` sur fond blanc ne passe pas le ratio WCAG AA pour le texte. Pour le texte sur fond blanc, utiliser `#C86E09` (plus foncé). L'orange original reste pour les fonds colorés et les grandes tailles.

---

## 12 — Planning

| PHASE | DURÉE | LIVRABLES | VALIDATION |
|---|---|---|---|
| Phase 1 — Setup | J1 — J2 | Repo · Next.js · Tailwind · shadcn · Variables env · Design tokens | Accès repo |
| Phase 2 — Composants | J3 — J5 | Navbar multi-espace · Footer · FAB · Tokens couleurs | Review design |
| Phase 3 — Homepage | J6 — J8 | Hero Groupe · Cards espaces · Stats · Témoignages | Validation copy |
| Phase 4 — Cabinet | J9 — J12 | Pages Cabinet + formulaire RDV + API contact | Test formulaire |
| Phase 5 — Academy | J13 — J17 | Pages Academy + filières + formations + portage formulaire | Test inscription |
| Phase 6 — SEO | J18 — J19 | Metadata · Schema.org · Sitemap · Robots | Search Console |
| Phase 7 — Perf. | J20 — J21 | Lighthouse ≥ 90 · WebP · Bundle · Animations | Rapport Lighthouse |
| Phase 8 — Livraison | J22 — J24 | Correctifs · Déploiement · Formation client · README | Signature |

> **Durée totale : 24 jours ouvrables** — démarrage à réception logo + email client

---

## 13 — Livrables

| # | LIVRABLE | FORMAT | MOMENT |
|---|---|---|---|
| 01 | Code source complet — propriété intégrale | Repo GitHub privé transféré | Phase 8 |
| 02 | Site déployé en ligne | URL Vercel + domaine | Phase 8 |
| 03 | Formulaire Academy intégré | Fonctionnel + testé | Phase 5 |
| 04 | Formulaire Cabinet | Fonctionnel + notifications email | Phase 4 |
| 05 | Rapport Lighthouse | PDF captures desktop + mobile | Phase 7 + 8 |
| 06 | Google Analytics 4 configuré | Accès compte GA4 transmis | Phase 6 |
| 07 | Google Search Console | Accès + sitemap soumis | Phase 6 |
| 08 | Documentation technique | README setup + déploiement | Phase 8 |
| 09 | Session formation client (30 min) | Appel vidéo | Phase 8 |
| 10 | Garantie maintenance | 30 jours post-livraison — bugs | Phase 8 + 30j |

---

## 14 — Conditions Commerciales & Juridiques

### 14.1 Périmètre

**Inclus :**
- Développement complet : homepage + espace Cabinet + espace Academy
- Intégration/portage du formulaire existant (depuis GitHub)
- SEO technique, Analytics, Search Console
- Déploiement + domaine
- Formation client 30 min
- Maintenance 30 jours

**Non inclus :**
- Achat domaine (à la charge du client)
- Création de contenu rédactionnel au-delà du copywriting livré
- Blog (articles individuels — structure seulement)
- Application mobile
- Système LMS complet (gestion des cours en ligne)
- Maintenance mensuelle après la période garantie — avenant tarifaire

### 14.2 Droits & propriété

À la livraison complète, le client est propriétaire intégral du code source. Keter Marketing conserve le droit de mentionner ce projet dans son portfolio.

### 14.3 Modifications hors périmètre

Tout ajout non mentionné dans ce document fera l'objet d'un avenant écrit avant exécution.

### 14.4 Confidentialité

Document confidentiel, destiné exclusivement au Groupe SERMA et à Keter Marketing.

---

## Signatures

| Pour Groupe SERMA | Pour Keter Marketing |
|---|---|
| Nom : ____________________________ | **Dawes AKPOWI** |
| Qualité : _________________________ | CEO & Co-founder |
| Date : ___________________________ | Keter Marketing |
| Signature : _______________________ | Mai 2025 |
| *Lu et approuvé* | |

---

*Document confidentiel — Keter Marketing pour Groupe SERMA — Mai 2025*
