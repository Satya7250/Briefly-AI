import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getTenantId } from "@/lib/auth";
import { getInboxMessages, getUnreadEmails } from "@/features/mail/server/gmail-service";
import { getCalendarEvents } from "@/features/calendar/server/calendar-service";
import { CalendarRepository } from "@/features/calendar/server/calendar.repository";
import { prepareMeetingBriefing } from "@/features/meetings/server/meeting-prep-service";
import { getIntegrationStatus } from "@/lib/integrations";

// --- Types ---
type Intent = 
  | "EMAIL_SUMMARY"
  | "PRIORITY_BRIEFING"
  | "CALENDAR_SUMMARY"
  | "EMAIL_REPLY"
  | "UNREAD_EMAILS"
  | "PREPARE_MEETINGS"
  | "ACTION_ITEMS"
  | "GENERAL_QUESTION"
  | "SEND_EMAIL"
  | "CREATE_EVENT"
  | "UPDATE_EVENT";

// --- Helpers ---
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key not configured");
  return new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Briefly Assistant",
    },
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function parseExplicitEmail(message: string) {
  const toMatch = message.match(/To:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  const subjectMatch = message.match(/Subject:\s*([^\n]+)/i);
  const bodyMatch = message.match(/Body:\s*([\s\S]+)/i);

  if (toMatch) {
    const to = toMatch[1].trim();
    const subject = subjectMatch ? subjectMatch[1].trim() : "";
    const body = bodyMatch ? bodyMatch[1].trim() : "";
    return { to, subject, body };
  }
  return null;
}

async function resolveEmailForName(tenantId: string, name: string): Promise<string> {
  try {
    const messages = await getInboxMessages(tenantId);
    for (const msg of messages) {
      const lowerFrom = msg.from.toLowerCase();
      const lowerName = name.toLowerCase();
      if (lowerFrom.includes(lowerName)) {
        const match = msg.from.match(/<([^>]+)>/);
        if (match && match[1]) {
          return match[1];
        }
        if (msg.from.includes("@") && !msg.from.includes(" ")) {
          return msg.from.trim();
        }
      }
    }
  } catch (e) {
    console.error("Resolve email error:", e);
  }
  return "";
}

async function findEventByQuery(tenantId: string, query: string): Promise<any | null> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const nowPlus30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const events = await CalendarRepository.getUpcomingEvents(tenantId, thirtyDaysAgo, nowPlus30);
    
    const lowerQuery = query.toLowerCase();
    
    // 1. Time-based lookup (e.g. "4 PM" or "5 PM" meeting)
    const timeMatch = query.match(/(\d+)\s*(pm|am)/i);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      const isPm = timeMatch[2].toLowerCase() === "pm";
      const targetHour = isPm ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);
      
      const todayStr = new Date().toDateString();
      const match = events.find(e => {
        if (!e.start) return false;
        const startD = e.start.dateTime ? new Date(e.start.dateTime) : new Date(e.start.date);
        return startD.toDateString() === todayStr && startD.getHours() === targetHour;
      });
      if (match) return match;
    }

    // 2. Keyword-based lookup (e.g. "standup" or "agenda")
    const matchBySummary = events.find(e => e.summary?.toLowerCase().includes(lowerQuery));
    if (matchBySummary) return matchBySummary;

    // 3. Fallback to next upcoming meeting
    const now = new Date();
    const upcoming = events
      .filter(e => {
        if (!e.start) return false;
        const startD = e.start.dateTime ? new Date(e.start.dateTime) : new Date(e.start.date);
        return startD >= now;
      })
      .sort((a, b) => {
        const ad = a.start.dateTime ? new Date(a.start.dateTime) : new Date(a.start.date);
        const bd = b.start.dateTime ? new Date(b.start.dateTime) : new Date(b.start.date);
        return ad.getTime() - bd.getTime();
      });
    
    if (upcoming.length > 0) return upcoming[0];
  } catch (e) {
    console.error("Find event error:", e);
  }
  return null;
}

// --- Specific Actions ---
async function handleSummarizeEmail(subject: string, body: string, openai: OpenAI) {
  const truncatedBody = body?.substring(0, 10000) || ""; 
  const safeSubject = (subject || "").replace(/`/g, "\\`").replace(/\$/g, "\\$");
  const safeBody = truncatedBody.replace(/`/g, "\\`").replace(/\$/g, "\\$");
  
  const prompt = `
You are Briefly AI, an executive assistant. Summarize the following email and extract action items.

Subject: ${safeSubject}
Body: ${safeBody}

Return JSON only with this structure:
{
  "summary": ["Point 1", "Point 2", "Point 3"],
  "actions": ["Action 1", "Action 2"]
}
`;

  const completion = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const content = completion.choices[0].message.content;
  if (!content) throw new Error("No content from AI");
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI did not return valid JSON");

  return JSON.parse(jsonMatch[0]);
}

async function handleInboxSummary(tenantId: string, openai: OpenAI) {
  const messages = await getInboxMessages(tenantId);
  const emailsText = messages.slice(0, 20).map((msg, index) => 
    `Email ${index + 1}:\n- Subject: ${msg.subject}\n- From: ${msg.from}\n- Snippet: ${msg.snippet}\n`
  ).join("\n");

  const prompt = `You are Briefly AI. Here are the user's recent emails:\n${emailsText}\nPlease summarize the inbox highlighting: 1. Important emails, 2. Key topics, 3. Action items.`;

  const completion = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return { summary: completion.choices[0].message.content || "Couldn't generate summary." };
}

// --- Chat Intent Actions ---
async function detectIntent(message: string, openai: OpenAI): Promise<Intent> {
  const prompt = `
Classify the user's message into one category:
EMAIL_SUMMARY, PRIORITY_BRIEFING, CALENDAR_SUMMARY, EMAIL_REPLY, UNREAD_EMAILS, PREPARE_MEETINGS, ACTION_ITEMS, GENERAL_QUESTION, SEND_EMAIL, CREATE_EVENT, UPDATE_EVENT.
Respond with ONLY the category name.

Examples:
- "Send an email to Raj" -> SEND_EMAIL
- "Reply to this thread" -> EMAIL_REPLY
- "Schedule a meeting tomorrow at 5" -> CREATE_EVENT
- "Move tomorrow's standup to 6" -> UPDATE_EVENT
- "Prepare me for my 4 pm meeting" -> PREPARE_MEETINGS

User: ${message}`;
  
  const completion = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });
  
  const intent = completion.choices[0].message.content?.trim().toUpperCase() as Intent;
  const valid = [
    "EMAIL_SUMMARY", "PRIORITY_BRIEFING", "CALENDAR_SUMMARY", "EMAIL_REPLY", 
    "UNREAD_EMAILS", "PREPARE_MEETINGS", "ACTION_ITEMS", "GENERAL_QUESTION",
    "SEND_EMAIL", "CREATE_EVENT", "UPDATE_EVENT"
  ];
  return valid.includes(intent) ? intent : "GENERAL_QUESTION";
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request payload" },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();
    const integrationStatus = await getIntegrationStatus(tenantId);

    // 1. Check for specific direct actions (e.g., from UI buttons)
    if (body.action === "SUMMARIZE_EMAIL") {
      if (!integrationStatus.gmailConnected) {
        return NextResponse.json(
          { success: false, error: "Gmail is not connected. Please connect Gmail in Settings." },
          { status: 400 }
        );
      }
      const result = await handleSummarizeEmail(body.subject, body.body, openai);
      return NextResponse.json(result);
    }
    
    if (body.action === "INBOX_SUMMARY") {
      if (!integrationStatus.gmailConnected) {
        return NextResponse.json(
          { success: false, error: "Gmail is not connected. Please connect Gmail in Settings." },
          { status: 400 }
        );
      }
      const result = await handleInboxSummary(tenantId, openai);
      return NextResponse.json(result);
    }

    // 2. Otherwise it's a conversational message array
    const messages = body.messages || [];
    const lastMessage = messages[messages.length - 1]?.content || "";

    const intent = await detectIntent(lastMessage, openai);

    const gmailPromise = integrationStatus.gmailConnected ? getInboxMessages(tenantId) : Promise.resolve([]);
    const calendarPromise = integrationStatus.calendarConnected ? getCalendarEvents(tenantId) : Promise.resolve([]);

    const [emails, events] = await Promise.all([gmailPromise, calendarPromise]);

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
      }));

    // Streaming Response Setup
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const send = (text: string) => controller.enqueue(encoder.encode(text));

        try {
          // Check integration connection status relative to the intent
          if (intent === "CALENDAR_SUMMARY" || intent === "CREATE_EVENT" || intent === "UPDATE_EVENT") {
            if (!integrationStatus.calendarConnected) {
              send("It looks like your Google Calendar is not connected. Please connect Google Calendar in [Settings](/dashboard/settings) to view, schedule, or update events.");
              controller.close();
              return;
            }
          }
          if (intent === "EMAIL_SUMMARY" || intent === "UNREAD_EMAILS" || intent === "ACTION_ITEMS" || intent === "SEND_EMAIL" || intent === "EMAIL_REPLY") {
            if (!integrationStatus.gmailConnected) {
              send("It looks like your Gmail account is not connected. Please connect Gmail in [Settings](/dashboard/settings) to read, summarize, or draft emails.");
              controller.close();
              return;
            }
          }
          if (intent === "PREPARE_MEETINGS") {
            const missing = [];
            if (!integrationStatus.calendarConnected) missing.push("Google Calendar");
            if (!integrationStatus.gmailConnected) missing.push("Gmail");
            if (missing.length > 0) {
              send(`I need both Gmail and Google Calendar connected to prepare meeting briefing notes. Please connect your ${missing.join(" and ")} integration${missing.length > 1 ? "s" : ""} in [Settings](/dashboard/settings).`);
              controller.close();
              return;
            }
          }

          if (intent === "CALENDAR_SUMMARY") {
            const scheduleText = `Today's Schedule\n\n${processedEvents.length > 0 
              ? processedEvents.map(e => `${e.start} ${e.summary}`).join("\n") 
              : "No meetings scheduled for today."}`;
            send(scheduleText);
          } else if (intent === "ACTION_ITEMS") {
            const prompt = `Extract action items from these emails:\n${JSON.stringify(processedEmails)}\nReturn as numbered list.`;
            const completion = await openai.chat.completions.create({
              model: "openai/gpt-4o-mini",
              messages: [{ role: "user", content: prompt }],
              stream: true,
            });
            for await (const chunk of completion) {
              const text = chunk.choices[0]?.delta?.content || "";
              if (text) send(text);
            }
          } else if (intent === "SEND_EMAIL" || intent === "EMAIL_REPLY") {
            // Check for explicit email values
            const explicit = parseExplicitEmail(lastMessage);
            if (explicit) {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (emailRegex.test(explicit.to) && explicit.subject && explicit.body) {
                send(`I've prepared the email draft as requested:\n\n<email_draft to="${explicit.to}" subject="${explicit.subject}">\n${explicit.body}\n</email_draft>`);
                return;
              }
            }

            // Send Email Draft Flow (LLM Fallback)
            const nameMatch = lastMessage.match(/to\s+([a-zA-Z0-9]+)/i);
            const name = nameMatch ? nameMatch[1] : "";
            const resolvedEmail = name ? await resolveEmailForName(tenantId, name) : "";
            
            const prompt = `
You are Briefly AI. The user wants to draft an email.
User request: "${lastMessage}"
Resolved recipient email address: "${resolvedEmail}" (name resolved was: "${name}")

Current Local Date/Time: ${new Date().toString()}

STRICT RULES:
1. If the user explicitly provides a recipient email address (e.g. contains @), a subject, or body in the request, you MUST use those exact values in the draft.
2. Never replace or change user-provided email addresses, subjects, or bodies.
3. NEVER generate placeholder emails like raj@example.com or test@example.com. If no recipient email is resolved or provided, set to="" (empty string).

Construct an email draft XML block exactly in this format:
<email_draft to="[recipient_email]" subject="[SubjectLine]">
[Email body goes here. Write the exact content. Do not include placeholders like [Your Name], use "Briefly User" or generic sign-off if needed]
</email_draft>

First, describe what you drafted, then output the XML draft. Never auto-send emails.
`;
            const completion = await openai.chat.completions.create({
              model: "openai/gpt-4o-mini",
              messages: [{ role: "user", content: prompt }],
              stream: true,
            });
            for await (const chunk of completion) {
              const text = chunk.choices[0]?.delta?.content || "";
              if (text) send(text);
            }
          } else if (intent === "CREATE_EVENT") {
            // Calendar Event Creation Flow
            const prompt = `
You are Briefly AI. The user wants to schedule a meeting.
User request: "${lastMessage}"

Current Local Date/Time: ${new Date().toString()}

Construct a calendar event creation XML block in this format:
<event_draft summary="[Meeting Summary]" start="[Start ISO DateTime]" end="[End ISO DateTime]" attendees="[Comma-separated attendee emails]">
[Meeting Description]
</event_draft>

First, explain that you've prepared the event draft, then output the XML block. Make sure to calculate the correct ISO dates/times relative to the current local date/time provided above. Never auto-schedule events.
`;
            const completion = await openai.chat.completions.create({
              model: "openai/gpt-4o-mini",
              messages: [{ role: "user", content: prompt }],
              stream: true,
            });
            for await (const chunk of completion) {
              const text = chunk.choices[0]?.delta?.content || "";
              if (text) send(text);
            }
          } else if (intent === "UPDATE_EVENT") {
            // Calendar Event Update Flow
            // 1. Try to find the matching event
            const event = await findEventByQuery(tenantId, lastMessage);
            if (!event) {
              send("I couldn't find a matching event on your calendar to reschedule.");
            } else {
              const prompt = `
You are Briefly AI. The user wants to reschedule a meeting.
User request: "${lastMessage}"
Found event: "${event.summary || "Untitled Event"}" (ID: "${event.id}")
Current Start: "${event.start?.dateTime || event.start?.date}"
Current End: "${event.end?.dateTime || event.end?.date}"

Current Local Date/Time: ${new Date().toString()}

Construct a calendar event update XML block in this format:
<event_update eventId="${event.id}" summary="${event.summary || "Untitled Event"}" currentStart="${event.start?.dateTime || event.start?.date}" currentEnd="${event.end?.dateTime || event.end?.date}" proposedStart="[Proposed Start ISO DateTime]" proposedEnd="[Proposed End ISO DateTime]">
[Description of change]
</event_update>

First, show the proposed change details, then output the XML block. Calculate the proposed start/end times relative to the current local date/time provided.
`;
              const completion = await openai.chat.completions.create({
                model: "openai/gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                stream: true,
              });
              for await (const chunk of completion) {
                const text = chunk.choices[0]?.delta?.content || "";
                if (text) send(text);
              }
            }
          } else if (intent === "PREPARE_MEETINGS") {
            // Meeting preparation flow
            const event = await findEventByQuery(tenantId, lastMessage);
            if (!event) {
              send("I couldn't find any upcoming meetings to prepare briefing notes for.");
            } else {
              send(`Preparing briefing notes for "${event.summary || "Untitled Event"}"...\n\n`);
              try {
                const briefing = await prepareMeetingBriefing(tenantId, event.id);
                send(briefing);
              } catch (e: any) {
                send(`Error generating briefing: ${e.message || "Unknown error"}`);
              }
            }
          } else {
            // General Chat fallback
            const context = `
${integrationStatus.gmailConnected ? `Recent emails:\n${processedEmails.slice(0, 5).map(e => `- ${e.subject} (from ${e.from})`).join("\n")}` : "Gmail not connected."}
${integrationStatus.calendarConnected ? `Today's events:\n${processedEvents.map(e => `- ${e.summary} at ${e.start}`).join("\n")}` : "Calendar not connected."}
`;
            const systemPrompt = `You are Briefly AI. Use this context:\n${context}`;
            const completion = await openai.chat.completions.create({
              model: "openai/gpt-4o-mini",
              messages: [{ role: "system", content: systemPrompt }, ...messages],
              stream: true,
            });
            for await (const chunk of completion) {
              const text = chunk.choices[0]?.delta?.content || "";
              if (text) send(text);
            }
          }
        } catch (err: any) {
          send(`\nError generating response: ${err.message || "Unknown error"}`);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      }
    });
  } catch (error) {
    console.error("Error in unified assistant:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
