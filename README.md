# CogBench — Setup & Deployment Guide

## What you need
- [Node.js 18+](https://nodejs.org) installed on your computer
- A free [Supabase](https://supabase.com) account — only needed if you want cloud sync (see below); the app runs fine without it
- A free [Vercel](https://vercel.com) account — only needed for online deployment (see below)

---

## Run it locally (for reviewing/grading)

No accounts required — the app works out of the box using local storage only.

```bash
# 1. Clone the repo
git clone https://github.com/bacha121/HCI-study.git
cd HCI-study

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Opens at `http://localhost:5173` with hot reload.

Without Supabase credentials configured, the admin panel shows **⚠ Local storage only** — all data is kept in the browser and nothing is lost; cloud sync is optional (see [How it works](#how-it-works-after-deployment) below).

**Admin login** (to view collected data / export CSV):
```
Email:    admin@study.com
Password: hci2024
```

---

## Optional: enable cloud sync with Supabase

If you want participant data to sync to a shared database instead of staying local to each browser, follow the steps below.

### Step 1 — Set up Supabase (5 minutes)

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Name it `cogbench`, choose a region close to your participants
3. Once created, go to **SQL Editor** → paste the contents of `schema.sql` → **Run**
4. Go to **Settings → API**
5. Copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon / public** key (the long `eyJ...` string)

---

### Step 2 — Configure the app (2 minutes)

1. In the project folder, copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
2. Open `.env` and paste your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

### Step 3 — Build the app (2 minutes)

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `dist/` folder with everything needed.

---

### Step 4 — Deploy to Vercel (3 minutes)

**Option A — Dashboard (easiest)**
1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Import the repo (or drag/upload the project folder)
3. Framework preset: **Vite** — build command `npm run build`, output directory `dist`
4. Click **Deploy**. Vercel gives you a URL like `https://your-project.vercel.app`

**Option B — CLI**
```bash
npm install -g vercel
vercel --prod
```

---

### Step 5 — Set environment variables on Vercel

The `.env` file is not deployed (it's local only). You need to set the variables in Vercel too:

1. Vercel dashboard → your project → **Settings → Environment Variables**
2. Add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
3. Trigger a redeploy (Deployments → **⋯** on latest → Redeploy)

---

## How it works after deployment

| Action | What happens |
|--------|-------------|
| Participant registers | Account created locally + synced to Supabase |
| Participant completes experiment | Each save syncs to Supabase |
| Admin logs in | Pulls all participant data from Supabase into local view |
| Admin exports CSV | Exports everything currently synced |

The admin panel shows a **☁ Cloud connected** indicator when Supabase is active,
or **⚠ Local storage only** if credentials are missing.

---

## File structure

```
cogbench/
├── index.html          ← HTML entry point
├── package.json        ← dependencies
├── vite.config.js      ← build config
├── .env.example        ← credentials template
├── .env                ← your actual credentials (never commit this)
├── schema.sql          ← run once in Supabase SQL editor
└── src/
    ├── main.jsx        ← React entry point
    └── App.jsx         ← the full application
```

---

## Changing admin credentials

Edit `src/App.jsx` → search for `CFG.adminEmail` and `CFG.adminPw`.
