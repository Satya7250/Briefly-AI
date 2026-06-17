# Briefly — Release Checklist

## Overview

This document covers everything needed to deploy Briefly to production: environment variables, OAuth configuration, deployment steps, and a troubleshooting guide.

---

## 1. Environment Variables

All variables must be set in your hosting environment (e.g. Vercel, Railway, Render).

### Required

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (used by Drizzle ORM) |
| `OPENAI_API_KEY` | OpenRouter API key (used as OpenAI-compatible key) |
| `CORSAIR_KEK` | Key Encryption Key for Corsair credential storage |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js session signing |
| `NEXTAUTH_URL` | Full public URL of your app (e.g. `https://briefly.app`) |
| `GOOGLE_CLIENT_ID` | Google OAuth App client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth App client secret |

### Optional / Development

| Variable | Description |
|---|---|
| `NODE_ENV` | Set to `production` for production builds |

### Example `.env` format

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
OPENAI_API_KEY=sk-or-v1-...
CORSAIR_KEK=your-32-char-encryption-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-app.vercel.app
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
```

---

## 2. Database Setup

Briefly uses **Drizzle ORM** with PostgreSQL.

```bash
# Generate schema
npx drizzle-kit generate

# Push schema to database
npx drizzle-kit push
```

> [!IMPORTANT]
> Run migrations before starting the app in production for the first time.

---

## 3. Google OAuth Configuration

### Step 1: Create OAuth credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select an existing one
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client IDs**
5. Set application type to **Web application**

### Step 2: Add Authorized redirect URIs

Add all of the following:

```
http://localhost:3000/api/corsair/gmail/callback
http://localhost:3000/api/corsair/googlecalendar/callback
https://your-production-domain.com/api/corsair/gmail/callback
https://your-production-domain.com/api/corsair/googlecalendar/callback
```

### Step 3: Enable required APIs

In **APIs & Services → Library**, enable:

- **Gmail API**
- **Google Calendar API**
- **Google People API** (optional, for profile display)

### Step 4: Configure OAuth consent screen

- Set app name, logo, and support email
- Add scopes:
  - `https://www.googleapis.com/auth/gmail.readonly`
  - `https://www.googleapis.com/auth/gmail.send`
  - `https://www.googleapis.com/auth/calendar.readonly`
  - `https://www.googleapis.com/auth/calendar.events`
- For production: submit for Google verification if app will have > 100 users

---

## 4. Deployment Steps

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set all environment variables in the Vercel dashboard under **Settings → Environment Variables**.

### Manual / Docker

```bash
# Install dependencies
npm install

# Build production bundle
npm run build

# Start production server
npm start
```

> [!NOTE]
> The default Next.js port is 3000. Use a reverse proxy (nginx/Caddy) in front for SSL termination.

---

## 5. Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied (`npx drizzle-kit push`)
- [ ] Google OAuth redirect URIs include production domain
- [ ] `NEXTAUTH_URL` set to production URL
- [ ] `npm run build` completes without errors
- [ ] Gmail OAuth flow tested end-to-end
- [ ] Google Calendar OAuth flow tested end-to-end
- [ ] AI assistant responds correctly
- [ ] Email send works
- [ ] Calendar event creation works
- [ ] Calendar event update works
- [ ] Meeting prep generates briefing
- [ ] Settings connect/disconnect/reconnect work

---

## 6. Functional Verification

After deploying, manually verify:

| Feature | Test |
|---|---|
| **Inbox** | Emails load, thread opens, reply works |
| **Calendar** | Events show, create event works |
| **Send Email** | Email sends via Gmail |
| **Create Event** | Event appears in Google Calendar |
| **Update Event** | Rescheduling via AI updates the event |
| **Meeting Prep** | Briefing generated with attendees and context |
| **AI Assistant** | All 4 suggestion prompts produce responses |
| **Settings** | Connect/Disconnect/Reconnect for Gmail and Calendar |

---

## 7. Troubleshooting

### Auth not working / redirect loop

- Check `NEXTAUTH_URL` matches the exact domain (no trailing slash)
- Check `NEXTAUTH_SECRET` is set and consistent across restarts

### OAuth callback fails (400 / redirect_uri_mismatch)

- Verify the redirect URI in Google Console matches exactly: `https://your-domain.com/api/corsair/gmail/callback`
- Check both Gmail and Calendar callback URIs are registered

### Emails not loading

- Ensure Gmail API is enabled in Google Cloud Console
- Check Gmail OAuth scopes include `gmail.readonly`
- Verify `CORSAIR_KEK` is set and matches the value used when tokens were created

### Calendar events not loading

- Ensure Google Calendar API is enabled
- Check calendar OAuth scopes include `calendar.readonly`
- Re-connect Google Calendar from Settings to refresh tokens

### AI Assistant not responding

- Verify `OPENAI_API_KEY` is a valid OpenRouter key
- Check OpenRouter account has credits
- Inspect server logs for `OpenAI API key not configured` errors

### Meeting Prep fails

- Both Gmail AND Google Calendar must be connected
- The meeting must exist in the synced calendar database
- Check server logs for `Calendar event not found` errors

### Token expiry / integration showing disconnected

- Re-connect from Settings → the OAuth flow refreshes tokens
- Corsair handles token refresh automatically in most cases

### `integrationRequired: true` in API response

- The user has not connected the required integration
- Direct them to Settings to connect Gmail or Google Calendar

---

## 8. Common Error Messages

| Error | Cause | Fix |
|---|---|---|
| `Not authenticated` | No active session | Sign in again |
| `Gmail integration is not connected` | Gmail not linked | Connect Gmail in Settings |
| `Google Calendar integration is not connected` | Calendar not linked | Connect Calendar in Settings |
| `Gmail API request timed out` | Gmail API slow/down | Retry; check Gmail status |
| `Google Calendar API request timed out` | Calendar API slow/down | Retry; check Google status |
| `Meeting preparation request timed out` | AI + API calls took too long | Retry for meetings with fewer attendees |
| `OpenAI API key not configured` | Missing env var | Set `OPENAI_API_KEY` |
| `Calendar event not found` | Event not synced locally | Reconnect calendar to re-sync |

---

## 9. Recovery Steps

### Full reset for a user (data only)

1. Go to **Settings** in the app
2. Disconnect Gmail → Disconnect Google Calendar  
3. Reconnect Gmail → Reconnect Google Calendar
4. Data will re-sync from the OAuth callback

### Database reset (development only)

```bash
# Drop and recreate schema
npx drizzle-kit drop
npx drizzle-kit push
```

> [!CAUTION]
> Never run `drizzle-kit drop` in production. It deletes all user data.

---

*Last updated: June 2026*
