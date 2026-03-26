# Socratic AI

Socratic AI is a cross-platform learning system designed to solve a common problem in education: students often get quick answers, but not real understanding.

Instead of dumping solutions, Socratic AI guides learners through the **Socratic method**. The platform responds with questions, hints, reframing, and progressive scaffolding so students build the answer themselves and strengthen their reasoning in the process.

The project includes:

- a **Next.js web application**
- an **Express + MongoDB backend**
- a **Python AI tutor service**
- a **linked Android APK companion app** that connects to the same backend and learning data

## The Problem We Are Solving

Most learning tools optimize for speed, not mastery.

Students usually face one of these issues:

- they receive direct answers too early
- they become dependent on solution engines instead of reasoning
- they lose continuity between devices and study sessions
- they do not get meaningful feedback on progress, streaks, or learning patterns
- collaborative learning is awkward, fragmented, or missing entirely

Socratic AI addresses this by creating a guided tutoring experience where learners are nudged toward insight rather than being handed the final answer immediately.

## Our Solution

Socratic AI acts like a patient tutor that:

- asks guiding questions instead of immediately revealing solutions
- keeps students inside a structured hint-based flow
- tracks sessions, topics, and message history over time
- supports progress monitoring and streak building
- allows sessions to be shared across users
- works across **web and mobile** through a shared backend

The result is a learning assistant focused on **understanding, retention, and reflection** rather than shortcutting the process.

## Key Features

### 1. Socratic Chat Tutoring

- Subject-based AI tutoring sessions
- AI replies are designed to guide, not just answer
- Progressive prompting and hint-style interaction
- Topic generation from the student’s question
- Optional reveal-style mode through the tutor service
- Cross-session continuity through saved chat history

### 2. Authentication and User Accounts

- Sign up and sign in flows
- Secure password hashing with `bcrypt`
- JWT-based authentication
- Cookie-based session support on web
- Shared identity across connected clients

### 3. Personalized Dashboard

- Subject-first learning dashboard
- Recommended subject resume flow
- Recent learning sessions
- Dynamic statistics and study summaries
- Theme-aware UI that follows the user’s selected appearance

### 4. Subject Management

- Core subjects available by default
- Additional subjects can be enabled per user
- Learning areas currently include:
  - Mathematics
  - Physics
  - Chemistry
  - Biology
  - Computer Science
  - History
  - Political Science
  - Economics
  - Literature

### 5. Session History and Continuity

- Chats are saved to MongoDB
- Active sessions can be resumed
- Topic names can be edited
- Message history is preserved
- Recent learning sessions appear in the dashboard and subject pages

### 6. Shared Learning / Collaboration

- Share a chat session with another user by email lookup
- View sessions shared with you
- View sessions you shared with others
- Revoke individual or all access to a shared session

### 7. Progress Tracking

- Total sessions
- Estimated study time
- Streak tracking
- Weekly activity
- Subject distribution and mastery indicators
- Recent timeline of learning activity

### 8. User Profile and Preferences

- User profile display
- Profile updates
- Subject selection management
- Theme selection for the web application

### 9. Notification Support

The backend includes endpoints for notification token registration and preference management:

- register device token
- unregister device token
- enable/disable notification preferences

This supports the companion mobile experience.

## Web + Mobile APK Connection

This project is not only a web app.

An **Android APK companion app** was built for the same Socratic AI ecosystem and is connected to the same backend services. That means:

- the mobile app and web app can use the same user accounts
- both clients connect to the same API and database
- learning sessions can continue across devices
- the APK extends the system into an on-the-go study experience

In short, the APK is part of the same product vision: **one tutoring system, multiple entry points**.

## Repository Structure

```text
Socratic_Ai/
├─ apps/
│  ├─ backend/   # Express API + MongoDB models + controllers
│  ├─ web/       # Next.js web app
│  └─ script/    # Python FastAPI AI tutor service
├─ packages/
│  ├─ types/     # shared TypeScript types
│  ├─ eslint-config/
│  └─ typescript-config/
├─ SPEC.md
└─ README.md
```

## Architecture Overview

### Web App

The web frontend lives in `apps/web` and uses:

- Next.js App Router
- Zustand for client-side state
- Tailwind CSS
- Framer Motion

Main areas include:

- homepage
- login / signup
- dashboard
- learn overview
- subject chat pages
- progress
- profile
- settings
- shared topics

### Backend API

The backend lives in `apps/backend` and uses:

- Express
- Mongoose
- JWT auth middleware
- modular routes and controllers

Main API groups:

- `/api/auth`
- `/api/chat`
- `/api/user`
- `/api/sessions`
- `/api/notifications`

### Python Tutor Service

The AI tutoring service lives in `apps/script/socratic.py`.

It provides:

- Socratic response generation
- direct-answer/reveal mode
- topic title generation
- lightweight tutor orchestration for chat requests

The Node backend calls this service when processing tutor messages.

## Tech Stack

### Frontend

- Next.js
- React
- Tailwind CSS
- Framer Motion
- Zustand
- Lucide React

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt

### AI Service

- Python
- FastAPI
- Groq client

### Monorepo / Tooling

- Turborepo
- npm workspaces
- Bun lockfile included
- ESLint
- TypeScript

## Current Implemented Highlights

Based on the codebase, the project currently implements:

- web-based authentication
- dashboard redesign with theme awareness
- subject-driven tutoring flows
- saved chat sessions
- session sharing and collaboration
- user stats and streak logic
- notification token management
- Python-powered tutoring backend
- Android APK integration at the product level

## Running the Project

### 1. Install dependencies

From the repository root:

```bash
npm install
```

### 2. Start the monorepo

```bash
npm run dev
```

### 3. Run only the web app

```bash
npm run dev:web
```

### 4. Run only the backend

```bash
npm run dev:backend
```

### 5. Run the Python tutor service

From `apps/script`:

```bash
pip install -r requirements.txt
python socratic.py
```

## Environment Notes

The project expects environment configuration for:

- MongoDB connection
- JWT secret
- frontend URL / CORS origin
- Python tutor service URL
- Groq API key for the tutor service

Each service has an `.env.example` file listing the required variables:

| Service | File | Variables |
|---------|------|-----------|
| Backend | `apps/backend/.env.example` | `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `PYTHON_SERVICE_URL` |
| Python service | `apps/script/.env.example` | `GROQ_API_KEY` |
| Web app | `apps/web/.env.example` | `NEXT_PUBLIC_API_URL` |

Copy the example file to `.env` in the same directory and fill in the values before running locally:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/script/.env.example apps/script/.env
cp apps/web/.env.example apps/web/.env
```

## Deploy for Free

All three services can be deployed for free using **Vercel** and **MongoDB Atlas**.

### Free services used

| Service | Platform | Free tier |
|---------|----------|-----------|
| Web (Next.js) | [Vercel](https://vercel.com) | Hobby plan — unlimited Next.js deployments |
| Backend (Express) | [Vercel](https://vercel.com) | Hobby plan — serverless Node.js functions |
| Python tutor | [Vercel](https://vercel.com) | Hobby plan — serverless Python functions |
| Database (MongoDB) | [MongoDB Atlas](https://cloud.mongodb.com) | M0 cluster — 512 MB free storage |
| AI (Groq LLM) | [Groq](https://console.groq.com) | Free tier with generous rate limits |

---

### Step 1 — Set up MongoDB Atlas (free database)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account.
2. Create a new **free M0 cluster** (choose any cloud region).
3. Under **Database Access**, create a database user with a username and password.
4. Under **Network Access**, add `0.0.0.0/0` to allow connections from anywhere (required for Vercel).
5. Click **Connect → Drivers** and copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/socratic-ai?retryWrites=true&w=majority
   ```
   Replace `<username>` and `<password>` with the credentials you just created.

---

### Step 2 — Get a free Groq API key

1. Go to [https://console.groq.com](https://console.groq.com) and sign in.
2. Navigate to **API Keys** and create a new key.
3. Copy the key — you will use it as `GROQ_API_KEY` when deploying the Python service.

---

### Step 3 — Deploy the Python tutor service to Vercel

The `apps/script` directory already contains a `vercel.json` that configures the Python serverless function.

1. Install the Vercel CLI (or use the Vercel dashboard):
   ```bash
   npm install -g vercel
   ```
2. From the `apps/script` directory, run:
   ```bash
   cd apps/script
   vercel
   ```
3. Follow the prompts. When asked for environment variables, set:
   - `GROQ_API_KEY` — your Groq API key from Step 2
4. After deployment, copy the production URL (e.g. `https://your-python-service.vercel.app`). You will need it in Step 4.

> **Vercel Dashboard alternative**: Go to [vercel.com/new](https://vercel.com/new), import this repository, set the **Root Directory** to `apps/script`, and add the environment variable above.

---

### Step 4 — Deploy the backend to Vercel

The `apps/backend` directory already contains a `vercel.json` that configures the Express serverless function.

1. From the `apps/backend` directory, run:
   ```bash
   cd apps/backend
   vercel
   ```
2. When asked for environment variables, set:
   - `MONGODB_URI` — the Atlas connection string from Step 1
   - `JWT_SECRET` — any long random string (e.g. `openssl rand -hex 32`)
   - `PYTHON_SERVICE_URL` — the URL from Step 3
   - `FRONTEND_URL` — leave blank for now; you will update it after Step 5
3. After deployment, copy the production URL (e.g. `https://your-backend.vercel.app`).

> **Vercel Dashboard alternative**: Import this repository, set **Root Directory** to `apps/backend`, and add the environment variables above.

---

### Step 5 — Deploy the web app to Vercel

Vercel automatically detects Next.js projects — no extra `vercel.json` is needed.

1. From the `apps/web` directory, run:
   ```bash
   cd apps/web
   vercel
   ```
2. When asked for environment variables, set:
   - `NEXT_PUBLIC_API_URL` — the backend URL from Step 4
3. After deployment, copy the production URL (e.g. `https://your-web-app.vercel.app`).

> **Vercel Dashboard alternative**: Import this repository, set **Root Directory** to `apps/web`, and add the environment variable above.

---

### Step 6 — Update CORS in the backend

Go back to your backend Vercel project settings and update the `FRONTEND_URL` environment variable to the web app URL from Step 5, then redeploy:

```bash
cd apps/backend
vercel env add FRONTEND_URL
# enter: https://your-web-app.vercel.app
vercel --prod
```

---

### Summary of environment variables

**`apps/backend` (Vercel project)**

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Any long random secret string |
| `PYTHON_SERVICE_URL` | URL of the deployed Python service |
| `FRONTEND_URL` | URL of the deployed web app |

**`apps/script` (Vercel project)**

| Variable | Value |
|----------|-------|
| `GROQ_API_KEY` | Groq API key |

**`apps/web` (Vercel project)**

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | URL of the deployed backend |

## Why This Project Matters

Socratic AI is not just another AI chat app. It is built around a specific educational philosophy:

- learning should be interactive
- students should be challenged, not spoon-fed
- progress should be visible
- study should continue seamlessly across web and mobile

The project brings together tutoring, persistence, personalization, and cross-platform access into a single system focused on **real understanding**.

## Conclusion

Socratic AI is a full learning platform that combines:

- a responsive web experience
- a connected Android APK companion app
- a secure backend
- a dedicated AI tutoring service
- collaboration, history, progress tracking, and personalization

The central mission of the project is simple:

**help students think better, not just answer faster.**
