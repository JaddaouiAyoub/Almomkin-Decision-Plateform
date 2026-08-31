# ALMOMKIN TEST V1

> Plateforme expérimentale de prise de décision comportementale — Étude des biais cognitifs sous incertitude

## 📋 Présentation

ALMOMKIN TEST est une plateforme de recherche expérimentale conçue pour étudier les réactions et biais cognitifs des participants confrontés à des situations de prise de décision sous incertitude.

### Ce que mesure le système

| Métrique | Description |
|---|---|
| **Décision choisie** | Sélection parmi 4 options de réponse |
| **Groupe expérimental** | Assignation silencieuse côté serveur (Groupe A vs Groupe B) |
| **Temps de décision** | Mesure précise en millisecondes (double mesure serveur + client anti-fraude) |
| **Niveau de confiance** | Score auto-rapporté de 0 à 10 |
| **Différences comportementales A/B** | Agrégations et visualisations comparatives |

### Architecture fonctionnelle

```
┌──────────────────────────────────────────────────────────────┐
│                    Interface Participant                      │
│   Landing → Cas d'étude (A/B) → Question + Timer → Confiance │
│                        /test                                  │
└──────────────────────┬───────────────────────────────────────┘
                       │ API Routes
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                     Logique Serveur                           │
│   Assignation Groupe │ Horodatage │ Calcul Temps │ Confiance │
│   /api/test/start    │ /question  │ /submit      │ /confidence│
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                   Interface Admin                             │
│   Dashboard KPI │ Graphiques A/B │ Résultats │ Export CSV     │
│                      /admin                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠 Stack Technique

| Technologie | Rôle |
|---|---|
| **Next.js 16** (App Router) | Framework React full-stack |
| **TypeScript** | Typage strict |
| **PostgreSQL** | Base de données relationnelle |
| **Prisma ORM** | Accès base de données type-safe |
| **Tailwind CSS 4** | Styles utilitaires |
| **Framer Motion** | Animations fluides |
| **Recharts** | Graphiques statistiques |
| **NextAuth.js v5** | Authentification admin (credentials) |
| **Lucide React** | Icônes |
| **Papaparse** | Export CSV |
| **Zod** | Validation des données |

---

## ⚡ Installation & Démarrage

### Prérequis

- **Node.js** ≥ 18
- **PostgreSQL** fonctionnant sur le port `5435`
- **npm** ou **yarn**

### 1. Cloner le projet

```bash
git clone <repository-url>
cd Amotawakil
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer la base de données

Créer un fichier `.env.local` à la racine du projet :

```env
# Database — PostgreSQL sur le port 5435
DATABASE_URL="postgresql://admin:password@localhost:5435/almomkin"

# NextAuth — Changer en production !
AUTH_SECRET="almomkin-super-secret-key-change-in-production-2024"
NEXTAUTH_URL="http://localhost:3000"

# Admin credentials (utilisés par le seed)
ADMIN_EMAIL="admin@almomkin.test"
ADMIN_PASSWORD="Admin@Almomkin2024"
ADMIN_NAME="Administrateur"
```

### 4. Appliquer les migrations

```bash
npx prisma migrate deploy
```

### 5. Peupler la base de données

Le script de seed crée :
- 1 compte administrateur
- 1 expérience active avec 2 groupes (A et B)
- 1 cas d'étude avec contenus A/B différenciés
- 1 question avec 4 options de réponse
- ~40 participants simulés avec données statistiques réalistes

```bash
npx prisma db seed
```

### 6. Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

---

## 🔐 Identifiants Admin

| Champ | Valeur |
|---|---|
| **Email** | `admin@almomkin.test` |
| **Mot de passe** | `Admin@Almomkin2024` |

Accéder au panel admin : [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 🧭 Pages & Routes

### Interface Participant

| Route | Description |
|---|---|
| `/` | Redirection vers `/test` |
| `/test` | Flow complet du test (Landing → Cas → Question → Confiance → Fin) |

### Interface Admin (protégée)

| Route | Description |
|---|---|
| `/admin/login` | Page de connexion |
| `/admin` | Dashboard KPI + graphiques comparatifs A/B |
| `/admin/results` | Tableau des résultats avec filtre par groupe, pagination, export CSV |
| `/admin/participants` | Liste des 50 derniers participants |
| `/admin/groups` | Gestion des groupes expérimentaux |
| `/admin/cases` | Gestion des cas d'étude et contenus A/B |
| `/admin/questions` | Gestion des questions et options de réponse |

### API Routes

| Route | Méthode | Description |
|---|---|---|
| `/api/test/start` | POST | Créer participant + session + assigner groupe |
| `/api/test/question` | POST | Enregistrer timestamp serveur (question affichée) |
| `/api/test/submit` | POST | Soumettre réponse + calculer temps de décision |
| `/api/test/confidence` | PATCH | Sauvegarder score de confiance + compléter session |
| `/api/admin/export` | GET | Télécharger toutes les données en CSV |
| `/api/auth/[...nextauth]` | * | Endpoints NextAuth.js |

---

## 📊 Modèle de Données

```
Admin
  ├── id, email, passwordHash, name

Experiment
  ├── id, name, description, isActive
  ├── groups: ExperimentGroup[]
  ├── studyCases: StudyCase[]
  └── sessions: TestSession[]

ExperimentGroup
  ├── id, name, label ("A"/"B"), isActive
  ├── sessions: TestSession[]
  └── responses: Response[]

StudyCase
  ├── id, title, isActive, order
  ├── groupContents: CaseGroupContent[]  ← Contenu différencié A/B
  └── questions: Question[]

CaseGroupContent
  ├── studyCaseId, groupLabel, content
  └── unique(studyCaseId, groupLabel)

Question
  ├── id, text, order, isActive
  └── options: AnswerOption[] (A, B, C, D)

Participant
  ├── id, createdAt
  └── sessions: TestSession[]

TestSession
  ├── participantId, experimentId, groupId, studyCaseId
  ├── status: STARTED → CASE_SHOWN → QUESTION_SHOWN → ANSWERED → COMPLETED
  └── responses: Response[]

Response
  ├── sessionId, participantId, groupId, questionId, answerOptionId
  ├── decisionTimeMs (serveur), clientTimeMs (client)
  ├── confidenceScore (0-10)
  └── questionShownAt, answeredAt (timestamps serveur)
```

---

## 🔬 Logique Expérimentale

### Assignation des groupes

L'assignation au Groupe A ou B est effectuée **côté serveur** de manière aléatoire lors du démarrage d'une session (`/api/test/start`). Le participant ne voit jamais à quel groupe il appartient.

### Mesure du temps de décision

Le système utilise une **double mesure anti-fraude** :

1. **Côté serveur** : `decisionTimeMs = answeredAt - questionShownAt` (calculé en millisecondes)
2. **Côté client** : `clientTimeMs` via le hook `useTimer` (pour comparaison/audit)

### Contenu A/B

Chaque cas d'étude possède des variantes de contenu (`CaseGroupContent`) spécifiques à chaque groupe. Le participant du Groupe A voit le contenu A, celui du Groupe B voit le contenu B, sans en avoir conscience.

---

## 📁 Structure du Projet

```
.
├── actions/                    # Server Actions (login/logout)
├── app/
│   ├── globals.css             # Design system complet
│   ├── layout.tsx              # Layout racine
│   ├── page.tsx                # Redirection vers /test
│   ├── test/page.tsx           # Flow participant (state machine)
│   ├── admin/
│   │   ├── layout.tsx          # Layout admin + Sidebar
│   │   ├── page.tsx            # Dashboard KPI
│   │   ├── login/page.tsx      # Connexion admin
│   │   ├── results/page.tsx    # Résultats + export
│   │   ├── participants/       # Liste participants
│   │   ├── groups/             # Groupes expérimentaux
│   │   ├── cases/              # Cas d'étude
│   │   └── questions/          # Questions & réponses
│   └── api/                    # API routes
├── components/
│   ├── admin/Sidebar.tsx       # Navigation admin
│   ├── charts/                 # Graphiques Recharts
│   └── test/                   # Écrans participant (Landing, Case, Question, Confidence, Completion)
├── hooks/
│   └── useTimer.ts             # Chronométrage millisecondes
├── lib/
│   ├── auth.ts                 # Configuration NextAuth v5
│   ├── prisma.ts               # Client Prisma singleton
│   ├── utils.ts                # Fonctions utilitaires
│   ├── csv/                    # Génération CSV
│   ├── experiment/             # Logique expérimentale serveur
│   └── statistics/             # Calculs statistiques
├── prisma/
│   ├── schema.prisma           # Schéma BDD
│   ├── seed.ts                 # Données initiales
│   └── migrations/             # Migrations SQL
└── types/                      # Types TypeScript partagés
```

---

## 🚀 Commandes Utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Lancer en production
npm start

# Prisma
npx prisma studio          # Interface visuelle BDD
npx prisma migrate dev     # Créer une migration
npx prisma migrate deploy  # Appliquer les migrations
npx prisma db seed         # Peupler la BDD
npx prisma generate        # Régénérer le client

# Lint
npm run lint
```

---

## ⚠️ Notes Importantes

- **Port PostgreSQL** : Le projet est configuré pour utiliser le port `5435` (et non le port par défaut `5432`). Modifiez `DATABASE_URL` dans `.env.local` si nécessaire.
- **Sécurité** : En production, changez `AUTH_SECRET`, les identifiants admin, et le mot de passe PostgreSQL.
- **Données de test** : Le script `seed.ts` génère ~40 participants fictifs avec des biais statistiques entre les groupes A et B pour permettre la visualisation de différences dans les graphiques.

---

## 📄 Licence

Projet de recherche — Usage interne.
