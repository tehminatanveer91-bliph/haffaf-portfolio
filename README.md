# HAFFAF | Web Developer

A production-quality, dynamic full-stack developer portfolio and Firebase-powered administration console designed in the **Midnight Emerald** aesthetic.

## Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion (`motion/react`), Lucide React, React Router
- **Backend & Persistence**: Firebase Authentication, Cloud Firestore, Firebase Storage
- **Deployment**: Vercel (`vercel.json` SPA rewrites included)

---

## Project Structure

```
├── firebase-blueprint.json         # Firestore schema intermediate blueprint
├── firebase-applet-config.json     # Provisioned Firebase client configuration
├── firestore.rules                 # Hardened Firestore Security Rules
├── storage.rules                   # Firebase Storage rules for project thumbnails
├── vercel.json                     # SPA routing rewrites for /admin/*
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── portfolio/              # Hero, About, Skills, Projects, Services, Contact, Footer
│   │   └── admin/                  # ProtectedAdminRoute, Overview, Projects, Skills, Messages, Content
│   ├── context/AuthContext.tsx     # Firebase Auth + verified admin authorization
│   ├── data/defaults.ts            # Deterministic baseline content
│   ├── lib/firebase.ts             # Firebase SDK initialization + error wrapper
│   ├── pages/                      # PortfolioPage, AdminLoginPage, AdminDashboardPage
│   ├── services/portfolioService.ts# Real-time Firestore subscriptions & CRUD
│   ├── types/portfolio.ts          # TypeScript data models
│   └── utils/validation.ts         # Schema-synced validators & pure logic (+ unit tests)
```

---

## Firestore Collection Structure

1. **`siteSettings/{docId}`** (`main`): Hero heading, introduction, availability status, about bio, metrics, contact email, and social links.
2. **`projects/{projectId}`**: Portfolio case studies with `published`, `featured`, `category`, `technologies`, `thumbnailUrl`, `liveUrl`, and `githubUrl`.
3. **`skills/{skillId}`**: Technical skills grouped by `Frontend Development`, `Backend Development`, `Database & Cloud`, and `Development Tools`.
4. **`services/{serviceId}`**: Service offerings with descriptions, `deliverables`, and `active` visibility toggle.
5. **`messages/{messageId}`**: Visitor contact form submissions (public create-only; read, mark read, and delete restricted to verified admins).
6. **`admins/{userId}`** & **`users/{userId}`**: Authorized administrator registry and PII-isolated profiles.

---

## Firebase Setup Guide

1. **Firestore & Auth Provisioning**:
   - In [Firebase Console](https://console.firebase.google.com/), open your project.
   - Under **Authentication → Sign-in method**, enable **Google** and **Email/Password**.
   - Under **Authentication → Users**, create your administrator Email/Password user (public registration is intentionally disabled in the app). Ensure the admin account email is verified, or sign in via the authorized Google account.
   - To grant additional verified admins access beyond the bootstrapped admin email, add a document at `admins/{uid}` with `{ email: "admin@yourdomain.com", createdAt: <serverTimestamp> }`.
2. **Storage Setup**:
   - Enable **Firebase Storage** in Firebase Console and deploy `storage.rules`:
     ```bash
     firebase deploy --only storage
     ```
3. **Firestore Security Rules**:
   - Deploy `firestore.rules`:
     ```bash
     firebase deploy --only firestore:rules
     ```
4. **Initialize Content**:
   - Sign in at `/admin/login` and click **Populate Starter Content** on `/admin/dashboard` to write initial projects, skills, services, and site settings into Firestore.

---

## Local Development

```bash
npm install
npm run dev
```

Run unit tests and typechecks:

```bash
npx --yes tsx --test src/utils/validation.test.ts
npm run lint
npm run build
```

---

## Vercel Deployment Instructions

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import the repository into [Vercel](https://vercel.com/).
3. Configure **Framework Preset**: `Vite` (Build Command: `npm run build`, Output Directory: `dist`).
4. Add environment variables from `.env.example` in Vercel Project Settings (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_DATABASE_ID`).
5. Add your Vercel deployment domain to **Firebase Console → Authentication → Settings → Authorized domains**.
6. Deploy — `vercel.json` handles client-side routing for `/admin/login` and `/admin/dashboard`.
