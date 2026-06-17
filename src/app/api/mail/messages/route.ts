import { getInboxMessages } from "@/features/mail/server/gmail-service";
import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";
import { getIntegrationStatus } from "@/lib/integrations";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const integrationStatus = await getIntegrationStatus(tenantId);
    if (!integrationStatus.gmailConnected) {
      return NextResponse.json({
        success: true,
        data: [],
        integrationRequired: true
      });
    }
    
    const messages = await getInboxMessages(tenantId);
    
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      threadId: msg.threadId,
      subject: msg.subject,
      from: msg.from,
      snippet: msg.snippet,
      createdAt: msg.createdAt.toISOString(),
    }));
    
    return NextResponse.json({ success: true, data: formattedMessages });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch messages" }, { status: 500 });
  }
}

