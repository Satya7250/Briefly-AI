import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getTenantId } from "@/lib/auth";
import { getInboxMessages } from "@/features/mail/server/gmail-service";

export async function GET() {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const messages = await getInboxMessages(tenantId);
    
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

    const emailsText = messages.map((msg, index) => 
      `Email ${index + 1}:\n- Subject: ${msg.subject}\n- From: ${msg.from}\n- Snippet: ${msg.snippet}\n`
    ).join("\n");

    const systemPrompt = `You are Briefly AI, an executive assistant focused on email, calendar, and productivity. 
      Summarize the user's inbox, highlighting important emails, key topics, and any action items. 
      Be concise and organized.`;

    const userPrompt = `Here are the user's recent emails:\n${emailsText}\n\nPlease provide a summary of the inbox, highlighting:
      1. Important emails
      2. Key topics
      3. Action items
      4. Any urgent messages`;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
    });

    const content = completion.choices[0].message.content || "I'm sorry, I couldn't generate a summary.";
    return NextResponse.json({ summary: content, messages: messages.length });
  } catch (error) {
    console.error("Error generating inbox summary:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate inbox summary", 
        details: error instanceof Error ? error.message : undefined 
      }, 
      { status: 500 }
    );
  }
}
