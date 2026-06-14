import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getTenantId } from "@/lib/auth";
import { getInboxMessages, getMessageById, getUnreadEmails } from "@/features/mail/server/gmail-service";
import { getCalendarEvents } from "@/features/calendar/server/calendar-service";
import { getIntegrationStatus } from "@/lib/integrations";
import { briefingCache } from "@/lib/briefing-cache";

type Intent = 
  | "EMAIL_SUMMARY"
  | "PRIORITY_BRIEFING"
  | "CALENDAR_SUMMARY"
  | "EMAIL_REPLY"
  | "UNREAD_EMAILS"
  | "PREPARE_MEETINGS"
  | "ACTION_ITEMS"
  | "GENERAL_QUESTION";

async function detectIntent(message: string, openai: OpenAI): Promise<Intent> {
  const prompt = `
You are an intent classifier for an executive assistant. Classify the user's message into one of these categories:

- EMAIL_SUMMARY: User asks about summarizing emails, today's emails, what happened in inbox
- PRIORITY_BRIEFING: User asks what needs attention, priority emails, show priority emails
- CALENDAR_SUMMARY: User asks about meetings, what meetings do I have today
- EMAIL_REPLY: User asks to draft reply, reply to email
- UNREAD_EMAILS: User asks to show unread emails
- PREPARE_MEETINGS: User asks to prepare for today's meetings
- ACTION_ITEMS: User asks what are my action items
- GENERAL_QUESTION: Any other question

Respond with ONLY the category name, nothing else.

User message: ${message}
`;

  const completion = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const intent = completion.choices[0].message.content?.trim().toUpperCase() as Intent;
  
  if ([
    "EMAIL_SUMMARY", 
    "PRIORITY_BRIEFING", 
    "CALENDAR_SUMMARY", 
    "EMAIL_REPLY", 
    "UNREAD_EMAILS", 
    "PREPARE_MEETINGS", 
    "ACTION_ITEMS", 
    "GENERAL_QUESTION"
  ].includes(intent)) {
    return intent;
  }
  return "GENERAL_QUESTION";
}

async function classifyEmailPriority(email: { subject: string; from: string; snippet: string }, openai: OpenAI): Promise<"HIGH" | "MEDIUM" | "LOW"> {
  const prompt = `
Classify this email's priority as HIGH, MEDIUM, or LOW based on:
- Sender (managers, clients, important people are higher)
- Subject (urgent, action required, deadline, meeting are higher)
- Snippet (indicates importance)

Respond with ONLY HIGH, MEDIUM, or LOW, nothing else.

Email:
Subject: ${email.subject}
From: ${email.from}
Snippet: ${email.snippet}
`;

  const completion = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const priority = completion.choices[0].message.content?.trim().toUpperCase();
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    return priority;
  }
  return "MEDIUM";
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

async function getStaticResponseForIntent(
  intent: Intent,
  emails: any[],
  events: any[],
  openai: OpenAI
): Promise<string> {
  switch (intent) {
    case "EMAIL_SUMMARY": {
      const prioritizedEmails = await Promise.all(
        emails.map(async (email) => ({
          ...email,
          priority: await classifyEmailPriority(email, openai)
        }))
      );
      
      const highPriority = prioritizedEmails.filter(e => e.priority === "HIGH");
      const mediumPriority = prioritizedEmails.filter(e => e.priority === "MEDIUM");
      const lowPriority = prioritizedEmails.filter(e => e.priority === "LOW");

      return `Today's Briefing\n\n🔴 Needs Attention\n${highPriority.length > 0 ? highPriority.map(e => `• ${e.subject} (from ${e.from})`).join("\n") : "• None"}\n\n🟡 Important\n${mediumPriority.length > 0 ? mediumPriority.map(e => `• ${e.subject} (from ${e.from})`).join("\n") : "• None"}\n\n⚪ Low Priority\n${lowPriority.length > 0 ? lowPriority.map(e => `• ${e.subject} (from ${e.from})`).join("\n") : "• None"}\n`;
    }

    case "PRIORITY_BRIEFING": {
      const prioritizedEmails = await Promise.all(
        emails.map(async (email) => ({
          ...email,
          priority: await classifyEmailPriority(email, openai)
        }))
      );
      
      const highPriority = prioritizedEmails.filter(e => e.priority === "HIGH");

      return `Today's Briefing\n\n🔴 Needs Attention\n${highPriority.length > 0 ? highPriority.map(e => `• ${e.subject} (from ${e.from})`).join("\n") : "• No high priority emails"}\n`;
    }

    case "CALENDAR_SUMMARY": {
      const today = new Date();
      const todayEvents = events.filter(e => {
        if (!e.start) return false;
        const eventDate = new Date(e.start);
        return eventDate.toDateString() === today.toDateString();
      }).sort((a, b) => {
        if (!a.start || !b.start) return 0;
        return a.start.getTime() - b.start.getTime();
      });

      return `Today's Schedule\n\n${todayEvents.length > 0 
        ? todayEvents.map(event => `${event.start ? formatTime(event.start) : "All day"} ${event.summary || "Untitled event"}`).join("\n")
        : "No meetings scheduled for today."
      }`;
    }

    case "UNREAD_EMAILS": {
      const unreadEmails = emails.filter(e => e.isUnread ?? true);
      return `Unread Emails\n\n${unreadEmails.length > 0 
        ? unreadEmails.map(email => `• ${email.subject} (from ${email.from})`).join("\n")
        : "No unread emails."
      }`;
    }
    
    default:
      return "";
  }
}

export async function POST(request: NextRequest) {
  const startTotal = Date.now();
  try {
    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { messages } = await request.json();
    const lastMessage = messages[messages.length - 1]?.content || "";
    
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: openaiApiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Briefly",
      },
    });

    const integrationStatus = await getIntegrationStatus(tenantId);
    const intent = await detectIntent(lastMessage, openai);

    // 4. Return cached briefing instantly when available (Target: < 50ms)
    const cached = briefingCache.get(tenantId);
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    if (intent === "EMAIL_SUMMARY" && cached && (Date.now() - cached.createdAt < CACHE_TTL)) {
      console.log(`[CACHE] Serving cached briefing in POST for tenant: ${tenantId}`);
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          const send = (text: string) => controller.enqueue(encoder.encode(text));
          
          const text = cached.briefing;
          const chunkSize = 16;
          for (let i = 0; i < text.length; i += chunkSize) {
            send(text.substring(i, i + chunkSize));
            await new Promise(resolve => setTimeout(resolve, 5));
          }
          controller.close();
          const totalTime = Date.now() - startTotal;
          console.log(`[LATENCY] CACHE HIT | Gmail: 0ms | Calendar: 0ms | AI: 0ms | Total: ${totalTime}ms`);
        }
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        }
      });
    }

    // Handle Gmail required intents
    if ([
      "EMAIL_SUMMARY", 
      "PRIORITY_BRIEFING", 
      "EMAIL_REPLY", 
      "UNREAD_EMAILS", 
      "ACTION_ITEMS"
    ].includes(intent)) {
      if (!integrationStatus.gmailConnected) {
        return new Response("Gmail is not connected. Please connect it first.", {
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      }
    }

    // Handle Calendar required intents
    if (["CALENDAR_SUMMARY", "PREPARE_MEETINGS"].includes(intent)) {
      if (!integrationStatus.calendarConnected) {
        return new Response("Google Calendar is not connected. Please connect it first.", {
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      }
    }

    // 6. Parallelize Operations: Fetch Gmail and Calendar simultaneously
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
        console.error("Error fetching Gmail:", e);
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
        console.error("Error fetching Calendar:", e);
        return [];
      }
    })();

    const [emails, events] = await Promise.all([gmailPromise, calendarPromise]);

    // 2. Pre-process data: Create compact summary object to minimize tokens
    // 3. Reduce prompt size: Limit to top 10 emails and today's events, no raw body
    const processedEmails = emails.slice(0, 10).map(e => ({
      id: e.id,
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

    // Return a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const send = (text: string) => {
          controller.enqueue(encoder.encode(text));
        };

        const streamStaticResponse = async (text: string) => {
          const chunkSize = 16;
          for (let i = 0; i < text.length; i += chunkSize) {
            send(text.substring(i, i + chunkSize));
            await new Promise(resolve => setTimeout(resolve, 8));
          }
        };

        const startAI = Date.now();
        try {
          switch (intent) {
            case "EMAIL_SUMMARY":
            case "PRIORITY_BRIEFING":
            case "CALENDAR_SUMMARY":
            case "UNREAD_EMAILS": {
              const text = await getStaticResponseForIntent(intent, processedEmails, events, openai);
              await streamStaticResponse(text);
              break;
            }

            case "PREPARE_MEETINGS": {
              if (processedEvents.length === 0) {
                send("No meetings scheduled for today.");
                break;
              }

              send("Preparing You for Today's Meetings\n");
              for (const event of processedEvents) {
                send(`\nMeeting: ${event.summary}\nTime: ${event.start}${event.end ? ` - End: ${event.end}` : ""}\nPreparation Notes:\n`);
                
                const preparationPrompt = `
Prepare meeting notes for this event:
- Title: ${event.summary}

Provide preparation notes in bullet points.
`;
                const prepCompletion = await openai.chat.completions.create({
                  model: "openai/gpt-4o-mini",
                  messages: [{ role: "user", content: preparationPrompt }],
                  stream: true,
                });
                for await (const chunk of prepCompletion) {
                  const content = chunk.choices[0]?.delta?.content || "";
                  if (content) send(content);
                }
                send("\n");
              }
              break;
            }

            case "ACTION_ITEMS": {
              const prompt = `
Extract action items from these emails. Look for tasks, commitments, deadlines, and follow-ups.

Emails:
${processedEmails.map(email => `Subject: ${email.subject}\nFrom: ${email.from}\nSnippet: ${email.snippet}`).join("\n\n")}

Return only the action items as numbered list.
`;
              const completion = await openai.chat.completions.create({
                model: "openai/gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                stream: true,
              });
              for await (const chunk of completion) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content) send(content);
              }
              break;
            }

            case "EMAIL_REPLY": {
              if (processedEmails.length === 0) {
                send("No emails to reply to.");
                break;
              }
              
              const latestEmail = processedEmails[0];
              const prompt = `
Draft a professional reply to this email:
From: ${latestEmail.from}
Subject: ${latestEmail.subject}
Snippet: ${latestEmail.snippet}

Please draft a professional reply.
`;
              const completion = await openai.chat.completions.create({
                model: "openai/gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                stream: true,
              });
              send(`Reply draft to "${latestEmail.subject}" (from ${latestEmail.from}):\n\n`);
              for await (const chunk of completion) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content) send(content);
              }
              break;
            }

            case "GENERAL_QUESTION":
            default: {
              const context = `
${integrationStatus.gmailConnected ? `
Recent emails:
${processedEmails.slice(0, 5).map(e => `- ${e.subject} (from ${e.from})`).join("\n")}
` : "Gmail not connected."}

${integrationStatus.calendarConnected ? `
Today's calendar events:
${processedEvents.map(e => `- ${e.summary} at ${e.start}`).join("\n")}
` : "Calendar not connected."}
`;
              const systemPrompt = `
You are Briefly AI, an executive assistant focused on email, calendar, and productivity. Use the following context to answer the user's question concisely and helpfully.
${context}
`;
              const completion = await openai.chat.completions.create({
                model: "openai/gpt-4o-mini",
                messages: [
                  { role: "system", content: systemPrompt },
                  ...messages
                ],
                stream: true,
              });
              for await (const chunk of completion) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content) send(content);
              }
              break;
            }
          }

          // 9. Measure Latency
          const aiTime = Date.now() - startAI;
          const totalTime = Date.now() - startTotal;
          console.log(`[LATENCY] Gmail fetch time: ${gmailTime}ms | Calendar fetch time: ${calendarTime}ms | AI generation time: ${aiTime}ms | Total response time: ${totalTime}ms`);
        } catch (error: any) {
          console.error("Error during streaming generation:", error);
          send(`\nError generating response: ${error.message || "Unknown error"}`);
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
    console.error("Error in briefing chat:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate response", 
        details: error instanceof Error ? error.message : undefined 
      }, 
      { status: 500 }
    );
  }
}
