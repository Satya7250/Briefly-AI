import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getTenantId } from "@/lib/auth";
import { getInboxMessages, getMessageById, getUnreadEmails } from "@/features/mail/server/gmail-service";
import { getCalendarEvents } from "@/features/calendar/server/calendar-service";
import { getIntegrationStatus } from "@/lib/integrations";

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

export async function POST(request: NextRequest) {
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
        "X-Title": "Superhuman Clone",
      },
    });

    const integrationStatus = await getIntegrationStatus(tenantId);

    const intent = await detectIntent(lastMessage, openai);

    let response: string = "";

    // Handle Gmail required intents
    if ([
      "EMAIL_SUMMARY", 
      "PRIORITY_BRIEFING", 
      "EMAIL_REPLY", 
      "UNREAD_EMAILS", 
      "ACTION_ITEMS"
    ].includes(intent)) {
      if (!integrationStatus.gmailConnected) {
        return NextResponse.json({ content: "Gmail is not connected." });
      }
    }

    // Handle Calendar required intents
    if (["CALENDAR_SUMMARY", "PREPARE_MEETINGS"].includes(intent)) {
      if (!integrationStatus.calendarConnected) {
        return NextResponse.json({ content: "Google Calendar is not connected." });
      }
    }

    switch (intent) {
      case "EMAIL_SUMMARY": {
        const emails = await getInboxMessages(tenantId);
        const prioritizedEmails = await Promise.all(
          emails.map(async (email) => ({
            ...email,
            priority: await classifyEmailPriority(email, openai)
          }))
        );
        
        const highPriority = prioritizedEmails.filter(e => e.priority === "HIGH");
        const mediumPriority = prioritizedEmails.filter(e => e.priority === "MEDIUM");
        const lowPriority = prioritizedEmails.filter(e => e.priority === "LOW");

        response = `Today's Briefing

🔴 Needs Attention
${highPriority.length > 0 ? highPriority.map(e => `• ${e.subject} (from ${e.from})`).join("\n") : "• None"}

🟡 Important
${mediumPriority.length > 0 ? mediumPriority.map(e => `• ${e.subject} (from ${e.from})`).join("\n") : "• None"}

⚪ Low Priority
${lowPriority.length > 0 ? lowPriority.map(e => `• ${e.subject} (from ${e.from})`).join("\n") : "• None"}
`;
        break;
      }

      case "PRIORITY_BRIEFING": {
        const emails = await getInboxMessages(tenantId);
        const prioritizedEmails = await Promise.all(
          emails.map(async (email) => ({
            ...email,
            priority: await classifyEmailPriority(email, openai)
          }))
        );
        
        const highPriority = prioritizedEmails.filter(e => e.priority === "HIGH");

        response = `Today's Briefing

🔴 Needs Attention
${highPriority.length > 0 ? highPriority.map(e => `• ${e.subject} (from ${e.from})`).join("\n") : "• No high priority emails"}
`;
        break;
      }

      case "CALENDAR_SUMMARY": {
        const events = await getCalendarEvents(tenantId);
        const today = new Date();
        const todayEvents = events.filter(e => {
          if (!e.start) return false;
          const eventDate = new Date(e.start);
          return eventDate.toDateString() === today.toDateString();
        }).sort((a, b) => {
          if (!a.start || !b.start) return 0;
          return a.start.getTime() - b.start.getTime();
        });

        response = `Today's Schedule

${todayEvents.length > 0 
  ? todayEvents.map(event => `${event.start ? formatTime(event.start) : "All day"} ${event.summary || "Untitled event"}`).join("\n")
  : "No meetings scheduled for today."
}`;
        break;
      }

      case "UNREAD_EMAILS": {
        const unreadEmails = await getUnreadEmails(tenantId);
        response = `Unread Emails

${unreadEmails.length > 0 
  ? unreadEmails.map(email => `• ${email.subject} (from ${email.from})`).join("\n")
  : "No unread emails."
}`;
        break;
      }

      case "PREPARE_MEETINGS": {
        const events = await getCalendarEvents(tenantId);
        const today = new Date();
        const todayEvents = events.filter(e => {
          if (!e.start) return false;
          const eventDate = new Date(e.start);
          return eventDate.toDateString() === today.toDateString();
        }).sort((a, b) => {
          if (!a.start || !b.start) return 0;
          return a.start.getTime() - b.start.getTime();
        });

        if (todayEvents.length === 0) {
          response = "No meetings scheduled for today.";
          break;
        }

        let meetingsText = "";
        for (const event of todayEvents) {
          const preparationPrompt = `
Prepare meeting notes for this event:
- Title: ${event.summary}
- Description: ${event.description || "No description"}

Provide preparation notes in bullet points.
`;
          const prepCompletion = await openai.chat.completions.create({
            model: "openai/gpt-4o-mini",
            messages: [{ role: "user", content: preparationPrompt }],
          });
          meetingsText += `
Meeting: ${event.summary || "Untitled event"}
Time: ${event.start ? formatTime(event.start) : "All day"}
${event.end ? `- End: ${formatTime(event.end)}` : ""}
Preparation Notes:
${prepCompletion.choices[0].message.content || "• Review agenda"}
`;
        }

        response = `Preparing You for Today's Meetings
${meetingsText}`;
        break;
      }

      case "ACTION_ITEMS": {
        const emails = await getInboxMessages(tenantId);
        const prompt = `
Extract action items from these emails. Look for:
- Tasks
- Commitments
- Deadlines
- Follow-ups

Emails:
${emails.slice(0, 10).map(email => `Subject: ${email.subject}\nFrom: ${email.from}\nSnippet: ${email.snippet}`).join("\n\n")}

Return only the action items as numbered list.
`;
        const completion = await openai.chat.completions.create({
          model: "openai/gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
        });

        response = `Action Items
${completion.choices[0].message.content || "• No action items identified"}`;
        break;
      }

      case "EMAIL_REPLY": {
        const emails = await getInboxMessages(tenantId);
        if (emails.length === 0) {
          response = "No emails to reply to.";
          break;
        }
        
        const latestEmailId = emails[0].id;
        const latestEmail = await getMessageById(tenantId, latestEmailId);
        
        const prompt = `
Draft a professional reply to this email:
From: ${latestEmail.sender}
Subject: ${latestEmail.subject}
Body: ${latestEmail.body.substring(0, 3000)}

Please draft a professional reply.
`;
        
        const completion = await openai.chat.completions.create({
          model: "openai/gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
        });
        
        response = `Reply draft to "${latestEmail.subject}" (from ${latestEmail.sender}):\n\n${completion.choices[0].message.content || "I'm sorry, I couldn't draft a reply."}`;
        break;
      }

      case "GENERAL_QUESTION":
      default: {
        const emails = integrationStatus.gmailConnected ? await getInboxMessages(tenantId) : [];
        const events = integrationStatus.calendarConnected ? await getCalendarEvents(tenantId) : [];
        
        const context = `
${integrationStatus.gmailConnected ? `
Recent emails:
${emails.slice(0, 5).map(e => `- ${e.subject} (from ${e.from})`).join("\n")}
` : "Gmail not connected."}

${integrationStatus.calendarConnected ? `
Today's calendar events:
${events.filter(e => e.start && new Date(e.start).toDateString() === new Date().toDateString()).map(e => `${e.summary || "Untitled"} at ${e.start ? formatTime(e.start) : "All day"}`).join("\n")}
` : "Calendar not connected."}
`;
        
        const systemPrompt = `
You are Briefing AI, an executive email and calendar assistant for Superhuman. Use the following context to answer the user's question concisely and helpfully.
${context}
`;
        
        const completion = await openai.chat.completions.create({
          model: "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
          ],
        });
        
        response = completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
      }
    }

    return NextResponse.json({ content: response });
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
