import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getTenantId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { subject, body } = await request.json();
    const truncatedBody = body?.substring(0, 10000) || ""; 
    
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

    const safeSubject = (subject || "").replace(/`/g, "\\`").replace(/\$/g, "\\$");
    const safeBody = truncatedBody.replace(/`/g, "\\`").replace(/\$/g, "\\$");
    
    const prompt = `
You are an AI assistant that summarizes emails. Summarize the following email and extract action items.

Subject: ${safeSubject}
Body: ${safeBody}

Return JSON only with this structure:
{
  "summary": ["Point 1", "Point 2", "Point 3"],
  "actions": ["Action 1", "Action 2"]
}

Requirements:
- Summary should be 3-5 concise bullet points
- Extract clear action items
- Do NOT hallucinate information not present in the email
- Return ONLY the JSON, no other text
`;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No content from AI");
    }

    // Extract JSON from the content (in case AI adds extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI did not return valid JSON");
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate summary", 
        details: error instanceof Error ? error.message : undefined 
      }, 
      { status: 500 }
    );
  }
}
