import { getInboxMessages } from "@/features/mail/server/gmail-service";
import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId()
    
    if (!tenantId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }
    
    const messages = await getInboxMessages(tenantId);
    
    // Format the response as required
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      threadId: msg.threadId,
      subject: msg.subject,
      from: msg.from,
      snippet: msg.snippet,
      createdAt: msg.createdAt.toISOString(),
    }));
    
    return NextResponse.json({ success: true, data: formattedMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 });
  }
}
