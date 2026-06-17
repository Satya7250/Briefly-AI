import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getTenantId } from "@/lib/auth";
import { getInboxMessages, getUnreadEmails } from "@/features/mail/server/gmail-service";
import { getCalendarEvents } from "@/features/calendar/server/calendar-service";
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
  | "GENERAL_QUESTION";

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
EMAIL_SUMMARY, PRIORITY_BRIEFING, CALENDAR_SUMMARY, EMAIL_REPLY, UNREAD_EMAILS, PREPARE_MEETINGS, ACTION_ITEMS, GENERAL_QUESTION.
Respond with ONLY the category name.

User: ${message}`;
  
  const completion = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });
  
  const intent = completion.choices[0].message.content?.trim().toUpperCase() as Intent;
  const valid = ["EMAIL_SUMMARY", "PRIORITY_BRIEFING", "CALENDAR_SUMMARY", "EMAIL_REPLY", "UNREAD_EMAILS", "PREPARE_MEETINGS", "ACTION_ITEMS", "GENERAL_QUESTION"];
  return valid.includes(intent) ? intent : "GENERAL_QUESTION";
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const openai = getOpenAIClient();

    // 1. Check for specific direct actions (e.g., from UI buttons)
    if (body.action === "SUMMARIZE_EMAIL") {
      const result = await handleSummarizeEmail(body.subject, body.body, openai);
      return NextResponse.json(result);
    }
    
    if (body.action === "INBOX_SUMMARY") {
      const result = await handleInboxSummary(tenantId, openai);
      return NextResponse.json(result);
    }

    // 2. Otherwise it's a conversational message array
    const messages = body.messages || [];
    const lastMessage = messages[messages.length - 1]?.content || "";

    const integrationStatus = await getIntegrationStatus(tenantId);
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
