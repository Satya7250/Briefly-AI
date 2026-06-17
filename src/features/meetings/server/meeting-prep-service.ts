import { corsair } from "@/corsair/client";
import { CalendarRepository } from "@/features/calendar/server/calendar.repository";
import { GmailRepository } from "@/features/mail/server/gmail.repository";
import { getMessageById, getUserProfile } from "@/features/mail/server/gmail-service";
import OpenAI from "openai";

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

export async function prepareMeetingBriefing(tenantId: string, eventId: string): Promise<string> {
  const tenant = corsair.withTenant(tenantId);

  // 1. Fetch Calendar Event
  const event = await CalendarRepository.getEvent(tenantId, eventId);
  if (!event) {
    throw new Error("Calendar event not found");
  }

  // 2. Fetch User Profile to filter out user's own email from attendee discussions
  const profile = await getUserProfile(tenantId);
  const userEmail = profile?.email || "";

  // 3. Find Attendees
  const attendeeEmails: string[] = event.attendees
    ?.map((a: any) => a.email)
    .filter(Boolean)
    .filter((email: string) => email.toLowerCase() !== userEmail.toLowerCase()) || [];

  // 4. Find Related Emails from local synced DB
  const recent = await tenant.gmail.db.messages.list({ limit: 80 });
  const relatedEmails: any[] = [];

  for (const msg of recent) {
    const data = (msg.data || msg) as any;
    const headers = data.payload?.headers || [];
    const from = data.from || headers.find((h: any) => h.name === "From")?.value || "";
    const to = data.to || headers.find((h: any) => h.name === "To")?.value || "";
    const cc = data.cc || headers.find((h: any) => h.name === "Cc")?.value || "";

    const isRelated = attendeeEmails.some((email) => {
      const lowerEmail = email.toLowerCase();
      return (
        from.toLowerCase().includes(lowerEmail) ||
        to.toLowerCase().includes(lowerEmail) ||
        cc.toLowerCase().includes(lowerEmail)
      );
    });

    if (isRelated) {
      relatedEmails.push(data);
    }
  }

  // 5. Fetch full body of the top 5 most recent related emails
  const emailsWithBodies: any[] = [];
  for (const email of relatedEmails.slice(0, 5)) {
    try {
      const details = await getMessageById(tenantId, email.id);
      emailsWithBodies.push(details);
    } catch (e) {
      console.error("Error fetching related email details:", e);
    }
  }

  // 6. Generate briefing using OpenAI
  const openai = getOpenAIClient();

  const systemPrompt = `You are Briefly AI, an elite executive assistant. Generate a highly professional, concise meeting preparation briefing.
Analyze the meeting details and the related email context provided.

Structure the response exactly with these headers:
## Meeting Title: [Title]
### Attendees
[List of attendees]

### Previous Discussions
[Summarize previous discussions based on the emails. If no emails are found, state "No previous discussions found in emails."]

### Open Questions
[List open questions discussed or implied. If none, state "None identified."]

### Pending Decisions
[List pending decisions. If none, state "None identified."]

### Action Items
[List action items. If none, state "None identified."]

### Risks
[List risks or concerns. If none, state "None identified."]

### Preparation Notes
[Provide preparation notes/context]
`;

  const userPrompt = `Meeting Title: ${event.summary || "Untitled Event"}
Description: ${event.description || "No description provided."}
Start Time: ${event.start?.dateTime || event.start?.date || "Unknown"}
Attendees: ${attendeeEmails.join(", ")}

Related Email Conversations:
${emailsWithBodies.length === 0 ? "No related emails found." : emailsWithBodies.map((email, idx) => `
Email ${idx + 1}:
From: ${email.sender}
Subject: ${email.subject}
Date: ${email.createdAt}
Snippet: ${email.snippet}
Body:
${email.body.substring(0, 3000)}
---
`).join("\n")}
`;

  const completion = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
  });

  return completion.choices[0].message.content || "Failed to generate briefing notes.";
}
