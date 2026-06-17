# Briefly AI

> Your AI-powered email and calendar workspace — built for speed, clarity, and focus.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)](https://www.postgresql.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-Satya7250-black?logo=github)](https://github.com/Satya7250/Briefly-AI)

---

## Overview

**Briefly AI** is an intelligent productivity workspace that unifies your Gmail inbox and Google Calendar into a single, AI-first interface. It lets you read and send emails, manage calendar events, and prepare for upcoming meetings — all powered by an AI assistant that understands your context.

Briefly is built for professionals who want to cut through inbox noise, stay on top of their schedule, and walk into every meeting prepared — without switching between a dozen tabs.

---

## Features

| Feature | Description |
|---|---|
| 📬 **Gmail Integration** | Sync and read your inbox via OAuth |
| 📅 **Google Calendar Integration** | View and manage calendar events |
| ✉️ **Send Email** | Draft and send emails directly from the app |
| 🤖 **AI Email Summaries** | Instant AI summaries of any email thread |
| 🧠 **AI Meeting Preparation** | Auto-generate briefing notes from attendees and email context |
| ➕ **Create Calendar Events** | AI-assisted event creation from natural language |
| ✏️ **Update Calendar Events** | Reschedule events with a simple instruction |
| 💬 **AI Assistant** | Conversational assistant with full inbox + calendar awareness |
| 🔐 **OAuth Authentication** | Secure sign-in with Google via Better Auth |
| ⌨️ **Command Palette** | Keyboard-first navigation throughout the app |

---

## Demo Flow

1. **Sign up** with your account
2. **Connect Gmail** via OAuth in Settings
3. **Connect Google Calendar** via OAuth in Settings
4. **Open Inbox** — emails load instantly from the synced local database
5. **Ask the AI** — *"Summarize my unread emails"* or *"What's on my calendar?"*
6. **Send an email** — AI drafts it, you review and send
7. **Create a meeting** — *"Schedule a meeting tomorrow at 3pm"*
8. **Update a meeting** — *"Move my standup to 5pm"*
9. **Generate a briefing** — click Prepare on any upcoming event to get a full AI prep brief

---

## Tech Stack

**Frontend**
- [Next.js 16](https://nextjs.org) (App Router)
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

**Backend**
- Next.js API Routes (server-side, edge-ready)
- [Better Auth](https://better-auth.com) — authentication

**Database**
- [PostgreSQL](https://www.postgresql.org)
- [Drizzle ORM](https://orm.drizzle.team)

**Integrations**
- [Corsair](https://corsair.dev) — OAuth token management and API sync layer
- Gmail API (read, send)
- Google Calendar API (read, create, update)

**AI**
- [OpenAI via OpenRouter](https://openrouter.ai) — GPT-4o-mini for summaries, drafts, and briefings

---

## Architecture

```
User (Browser)
     │
     ▼
Briefly AI — Next.js 16 (App Router)
     │
     ├── AI Assistant ──► OpenAI / OpenRouter
     │
     └── Corsair (Integration Layer)
          │
          ├── Gmail API ──► Inbox, Send, Sync
          └── Google Calendar API ──► Events, Create, Update
```

All OAuth tokens are encrypted at rest using the `CORSAIR_KEK` key. Data is synced into a local PostgreSQL database for fast, low-latency reads.

---

## Local Setup

### 1. Clone

```bash
git clone https://github.com/Satya7250/Briefly-AI.git
cd Briefly-AI
```

### 2. Install

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root:

```env
DATABASE_URL=postgresql://user:password@host:5432/briefly

BETTER_AUTH_SECRET=your-auth-secret
BETTER_AUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

OPENAI_API_KEY=sk-or-v1-...

CORSAIR_KEK=your-32-char-encryption-key
```

> **Google OAuth:** Add `http://localhost:3000/api/corsair/gmail/callback` and  
> `http://localhost:3000/api/corsair/googlecalendar/callback` as Authorized Redirect URIs.

### 4. Database

```bash
npx drizzle-kit push
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Screenshots

> *(Screenshots from the live app)*

| Dashboard | Inbox |
|---|---|
| ![Dashboard](./public/screenshots/dashboard.png) | ![Inbox](./public/screenshots/inbox.png) |

| Calendar | AI Assistant |
|---|---|
| ![Calendar](./public/screenshots/calendar.png) | ![Assistant](./public/screenshots/assistant.png) |

| Meeting Prep |  |
|---|---|
| ![Meeting Prep](./public/screenshots/meeting-prep.png) | |

---

## Roadmap

- [ ] AI Email Reply (in-thread context)
- [ ] Attachment support and file previews
- [ ] Contact suggestions from Gmail history
- [ ] Advanced meeting intelligence (pre-read docs, action tracking)
- [ ] Mobile-responsive layout

---

## Author

**Satya Prakash**

- 🐙 GitHub: [github.com/Satya7250](https://github.com/Satya7250)
- 💼 LinkedIn: [linkedin.com/in/satyaprakash-in](https://www.linkedin.com/in/satyaprakash-in/)
- 📦 Project: [github.com/Satya7250/Briefly-AI](https://github.com/Satya7250/Briefly-AI)

---

## License

[MIT](LICENSE) © 2026 Satya Prakash
