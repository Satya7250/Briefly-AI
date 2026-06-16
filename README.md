# ![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![Node.js](https://img.shields.io/badge/node-20%2B-339933?logo=node.js&logoColor=white) ![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript) ![Tailwind%20CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?logo=tailwindcss) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)

---

# Project Name

**Your One‑Line Value Proposition** – a concise, compelling statement that tells users why this project matters and what problem it solves.

---

## 🚀 Overview

> [!NOTE]
> **Problem**: Managing email and calendar workflows is fragmented, manual, and error‑prone.
>
> **Solution**: An AI‑augmented web app that unifies Gmail, Google Calendar, and OpenAI to automate routine tasks, surface insights, and streamline productivity.
>
> **Key Innovation**: Real‑time bi‑directional sync with Google services combined with contextual LLM responses, all built on a modern server‑rendered Next.js stack.

---

## ✨ Features

- 📧 **Smart Gmail Assistant** – generate replies, schedule sends, and extract actionable items.
- 📅 **Intelligent Calendar Scheduler** – auto‑suggest meeting times, create events from email threads.
- 🤖 **AI‑Powered Recommendations** – priority tagging, follow‑up prompts, and email summarization.
- 🛠️ **Customizable Workflows** – drag‑and‑drop rule builder for personal automation.
- 🔐 **Secure OAuth2 Integration** – never store passwords; tokens are encrypted at rest.
- 📊 **Analytics Dashboard** – track email volume, response latency, and calendar utilization.

---

## 🏗 Architecture

```mermaid
flowchart TB
    subgraph Frontend[Next.js 16 (React) + TypeScript]
        UI[UI Components]
        State[State Management (React Query)]
    end
    subgraph Backend[Node.js Server]
        API[REST/GraphQL API]
        Auth[OAuth2 Service]
        AI[OpenAI Service]
        DB[(PostgreSQL)]
    end
    Gmail[[Gmail API]]
    Calendar[[Google Calendar API]]

    UI -->|fetch| API
    State -->|mutate| API
    API --> Auth
    API --> AI
    API --> DB
    Auth --> Gmail
    Auth --> Calendar
    AI -->|LLM calls| OpenAI[(OpenAI)]
    DB -->|drizzle ORM| DB
    Gmail -->|webhooks| API
    Calendar -->|webhooks| API
```

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | Next.js | 16 |
| | TypeScript | 5.5 |
| | Tailwind CSS | 3.4 |
| | shadcn/ui | latest |
| **Backend** | Node.js | 20 |
| | PostgreSQL | 16 |
| | Drizzle ORM | latest |
| **Integrations** | Gmail API | OAuth2 |
| | Google Calendar API | OAuth2 |
| | OpenAI | GPT‑4o |

---

## 📸 Screenshots

> [!NOTE]
> Replace the placeholders with real screenshots before release.

![Landing page hero](file:///C:/Users/alok/.gemini/antigravity-ide/brain/872a58e7-819c-4f8b-b60f-827cab26fd9e/hero_screenshot_placeholder_1781534881662.png)

---

## ⚡ Key Workflows

```mermaid
sequenceDiagram
    participant User as User
    participant UI as Frontend UI
    participant API as Backend API
    participant Gmail as Gmail Service
    participant Calendar as Calendar Service
    participant AI as OpenAI

    User->>UI: Compose email draft
    UI->>API: POST /emails/generate
    API->>AI: Generate reply suggestion
    AI-->>API: Suggested text
    API-->>UI: Render suggestion
    User->>UI: Accept suggestion
    UI->>API: POST /emails/send
    API->>Gmail: Send email via OAuth2 token
    Gmail-->>API: Confirmation
    API-->>UI: Success toast

    %% Calendar workflow
    User->>UI: Click "Schedule Meeting"
    UI->>API: POST /calendar/propose
    API->>Calendar: Retrieve free slots
    Calendar-->>API: Slot list
    API->>AI: Generate optimal slot suggestion
    AI-->>API: Suggestion
    API-->>UI: Show suggestion
    User->>UI: Confirm
    UI->>API: POST /calendar/create
    API->>Calendar: Create event
    Calendar-->>API: Event ID
    API-->>UI: Confirmation
```

---

## 🤖 AI Features

| Feature | Description |
|---------|-------------|
| **Email Drafting** | AI writes context‑aware replies based on thread history. |
| **Summarization** | Turn long email threads into concise bullet points. |
| **Priority Tagging** | Automatically label emails as *Urgent*, *Follow‑up*, or *Info*. |
| **Meeting Proposals** | Suggest optimal meeting times using calendar availability and NLP extraction. |
| **Action Extraction** | Detect tasks in emails and create to‑do items automatically. |

---

## 📬 Gmail Integration

- Secure OAuth2 flow using Google’s **Authorization Code Grant**.
- Scoped permissions: `https://www.googleapis.com/auth/gmail.readonly` and `.../mail.send`.
- Real‑time push notifications via **Google Pub/Sub** to keep the inbox in sync.
- End‑to‑end encryption of access tokens stored in PostgreSQL.

---

## 📅 Google Calendar Integration

- OAuth2 scopes for read/write access to calendars.
- Automatic conflict detection and resolution.
- Bi‑directional sync: events created from email threads appear in the calendar and vice‑versa.
- Supports recurring events, reminders, and time‑zone aware scheduling.

---

## 🎯 Workflow Improvements

| Existing Workflow | Our Improvement |
|-------------------|-----------------|
| Manually copy email content → calendar → create event | **One‑click** “Create Event from Email” powered by AI. |
| Draft replies in separate editor | **Inline AI suggestions** appear directly in Gmail UI. |
| Search for past emails manually | **Semantic search** using embeddings for instant retrieval. |

---

## 🔥 Bonus Features (Hackathon)

- **Voice Command Integration** – use microphone to dictate email actions.
- **Real‑time Collaboration** – share draft suggestions with teammates via a shared workspace.
- **Dark Mode Auto‑Switch** – respects OS theme and provides a custom UI palette.

---

## 🗄 Database Schema

```mermaid
classDiagram
    class users {
        +uuid id
        +string email
        +string name
        +datetime created_at
    }
    class emails {
        +uuid id
        +uuid user_id
        +string thread_id
        +text raw_body
        +json metadata
        +datetime received_at
    }
    class events {
        +uuid id
        +uuid user_id
        +string google_event_id
        +datetime start_time
        +datetime end_time
        +string summary
    }
    users "1" --> "*" emails : owns
    users "1" --> "*" events : schedules
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js **20+**
- PostgreSQL **16**
- A Google Cloud project with Gmail & Calendar APIs enabled

### Installation

```bash
git clone <repo-url>
cd superhuman-clone
npm install
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID | `1234567890-abcdefg.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `ABCDEF123456` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `OPENAI_API_KEY` | OpenAI secret key | `sk-...` |
| `NEXTAUTH_URL` | Base URL for NextAuth | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Random secret for session encryption | `your-random-secret` |

### Run Development Server

```bash
npm run dev
```

---

## 📂 Project Structure

```
📦 superhuman-clone
├─ 📂 src
│  ├─ 📂 app               # Next.js app router (server components)
│  │  ├─ 📄 layout.tsx
│  │  └─ 📄 page.tsx
│  ├─ 📂 components        # Reusable UI components (client & server)
│  │  ├─ 📂 landing
│  │  │  ├─ 📄 hero.tsx
│  │  │  └─ 📄 landing-page-client.tsx
│  │  └─ 📂 ui            # shadcn/ui wrappers
│  ├─ 📂 lib               # Helper utilities, API clients, ORM setup
│  └─ 📂 styles            # Tailwind globals & CSS modules
├─ 📂 prisma                # Drizzle ORM schema definitions
├─ 📄 next.config.js
├─ 📄 tailwind.config.js
└─ 📄 README.md
```

---

## 🌐 Deployment




















---

## 🧪 Testing

- **Unit Tests** – Jest + React Testing Library for components.
- **Integration Tests** – Playwright for end‑to‑end flows (login, email sync, calendar creation).
- **CI** – GitHub Actions run tests on every push and enforce coverage > 80%.

---

## 📈 Future Improvements

- **Multi‑account support** for managing several Gmail accounts.
- **Slack & Teams integrations** to push AI‑summaries into team channels.
- **Advanced AI agents** for proactive task suggestions.
- **Webhooks for external services** (e.g., CRM sync).

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/awesome-feature`).
3. Follow the existing code style (Prettier, ESLint).
4. Write tests for new functionality.
5. Submit a Pull Request with a clear description.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 🙏 Acknowledgements

- **Next.js** – for the powerful React framework.
- **Tailwind CSS** – for the utility‑first styling.
- **shadcn/ui** – beautiful, accessible component primitives.
- **Drizzle ORM** – type‑safe database layer.
- **OpenAI** – powering our AI capabilities.
- **Google APIs** – Gmail and Calendar integrations.

---

## 👨💻 Author

**Satya Prakash** – Founder & Lead Engineer. Passionate about building AI‑first productivity tools that empower professionals to work smarter.

---
