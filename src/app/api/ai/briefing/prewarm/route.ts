import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getTenantId } from "@/lib/auth";
import { getInboxMessages } from "@/features/mail/server/gmail-service";
import { getCalendarEvents } from "@/features/calendar/server/calendar-service";
import { getIntegrationStatus } from "@/lib/integrations";
import { briefingCache } from "@/lib/briefing-cache";

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

async function generateAndCacheBriefing(tenantId: string) {
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  const cached = briefingCache.get(tenantId);
  if (cached && Date.now() - cached.createdAt < CACHE_TTL) {
    console.log(`[PREWARM] Cache is still fresh for tenant: ${tenantId}, skipping generation.`);
    return;
  }

  console.log(`[PREWARM] Starting background briefing generation for tenant: ${tenantId}...`);
  const startTotal = Date.now();

  const integrationStatus = await getIntegrationStatus(tenantId);
  if (!integrationStatus.gmailConnected && !integrationStatus.calendarConnected) {
    console.log("[PREWARM] No integrations connected, skipping generation.");
    return;
  }

  // Measure Gmail and Calendar fetch times in parallel
  let gmailTime = 0;
  let calendarTime = 0;

  const gmailPromise = (async () => {
    if (!integrationStatus.gmailConnected) return [];
    const start = Date.now();
    try {
      const res = await getInboxMessages(tenantId);
      gmailTime = Date.now() - start;
      return res;
    } catch (e) {
      console.error("Error fetching Gmail for prewarm:", e);
      return [];
    }
  })();

  const calendarPromise = (async () => {
    if (!integrationStatus.calendarConnected) return [];
    const start = Date.now();
    try {
      const res = await getCalendarEvents(tenantId);
      calendarTime = Date.now() - start;
      return res;
    } catch (e) {
      console.error("Error fetching Calendar for prewarm:", e);
      return [];
    }
  })();

  const [emails, events] = await Promise.all([gmailPromise, calendarPromise]);

  // Pre-process and compact data (Prompt size reduction)
  const processedEmails = emails.slice(0, 10).map(e => ({
    subject: e.subject,
    from: e.from,
    snippet: e.snippet,
  }));

  const today = new Date().toDateString();
  const processedEvents = events
    .filter(e => e.start && new Date(e.start).toDateString() === today)
    .map(e => ({
      summary: e.summary || "Untitled Event",
      start: e.start ? formatTime(e.start) : "All day",
      end: e.end ? formatTime(e.end) : undefined,
    }));

  const context = `
Current Time: ${new Date().toLocaleTimeString()}
${integrationStatus.gmailConnected ? `
Important & Recent Emails:
${processedEmails.map(e => `- Subject: "${e.subject}" | From: "${e.from}" | Snippet: "${e.snippet}"`).join("\n")}
` : "Gmail not connected."}

${integrationStatus.calendarConnected ? `
Today's Calendar Events:
${processedEvents.map(e => `- ${e.summary} at ${e.start}${e.end ? ` - ${e.end}` : ""}`).join("\n")}
` : "Google Calendar not connected."}
`;

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    console.error("[PREWARM] OpenAI API key not configured");
    return;
  }

  const openai = new OpenAI({
    apiKey: openaiApiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Briefly",
    },
  });

  const systemPrompt = `
You are Briefly AI, an executive assistant focused on email, calendar, and productivity.
Generate a structured, professional, and concise daily briefing based on the provided emails and calendar events.

Strict Layout Guidelines:
- Title must be: ## Morning Briefing
- Sections must use these exact headers:
  ### Priority Emails
  * (List 1-3 emails that require immediate attention, decisions, or actions. Format as: **[Subject]** from [Sender] - brief explanation of why it matters and what action is needed)
  
  ### Upcoming Meetings
  * (List today's meetings with times and a one-sentence brief preparation note based on meeting context)
  
  ### Important Follow-Ups
  * (List items requiring response, deadlines, or pending actions from recent threads)
  
  ### Suggested Focus
  * (A brief recommendation of what the user should prioritize or work on today based on their schedule and inbox)

Formatting Rules:
- If a section has no items or no data, write "* No active items at the moment" or "* No meetings scheduled for today."
- Never invent emails, meetings, or facts.
- Keep bullet points short, high-value, and extremely scannable.
- Sound conversational, intelligent, and confident. Avoid corporate chatbot filler.
`;

  const startAI = Date.now();
  try {
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Context:\n${context}` }
      ],
      temperature: 0.7,
    });

    const aiTime = Date.now() - startAI;
    const briefingText = completion.choices[0]?.message?.content || "No briefing could be generated.";
    
    // Save to Cache
    briefingCache.set(tenantId, {
      briefing: briefingText,
      createdAt: Date.now()
    });

    const totalTime = Date.now() - startTotal;
    console.log(`[LATENCY] PREWARM SUCCESS | Gmail: ${gmailTime}ms | Calendar: ${calendarTime}ms | AI: ${aiTime}ms | Total: ${totalTime}ms`);
  } catch (error) {
    console.error("[PREWARM] AI completion error:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Trigger prewarm asynchronously and return 200 immediately
    generateAndCacheBriefing(tenantId).catch(err => {
      console.error("Background briefing prewarm failed:", err);
    });

    return NextResponse.json({ success: true, status: "generation_triggered" });
  } catch (error) {
    console.error("Error in prewarm briefing route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
